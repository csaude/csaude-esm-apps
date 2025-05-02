import { Button, ButtonSet, InlineLoading } from '@carbon/react';
import { Encounter, openmrsFetch, restBaseUrl, showToast, useLayoutType } from '@openmrs/esm-framework';
import { Order, postOrders, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderEncounter } from './api';
import { showOrderSuccessToast } from './helpers';
import stepRegistry, { StepComponentHandle, StepProps } from './step-registry';
import { DrugOrderBasketItem, WorkflowState, WorkflowStep } from './types';
import styles from './workflow-container.scss';
import {
  COMPLETE_STEP,
  GO_TO_NEXT_STEP,
  GO_TO_PREVIOUS_STEP,
  GO_TO_STEP,
  UPDATE_STEP_DATA,
  useWorkflow,
  workflowReducer,
} from './workflow-context';
import { saveWorkflowData } from './workflow.resource';

const WorkflowContainer: React.FC = () => {
  const { state, dispatch, onCancel, onComplete } = useWorkflow();
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const stepRef = useRef<StepComponentHandle>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const { encounterUuid } = useOrderEncounter(state.patientUuid);
  const { orders } = useOrderBasket<DrugOrderBasketItem>();
  const isTablet = useLayoutType() === 'tablet';

  const handleStepDataChange = useCallback(
    (stepId: string, data: any) => {
      setCurrentStepData((prev) => ({
        ...prev,
        [stepId]: data,
      }));
      dispatch({
        type: UPDATE_STEP_DATA,
        payload: {
          stepId,
          data,
        },
      });
    },
    [dispatch],
  );

  const renderStep = useCallback(
    (step: WorkflowStep) => {
      const StepComponent = stepRegistry[step.renderType];

      return StepComponent ? (
        <StepComponent
          ref={stepRef}
          step={step}
          stepData={state.stepsData[step.id]}
          patientUuid={state.patientUuid}
          handleStepComplete={() => {
            throw new Error('For now all steps should be handled in WorkflowContainer');
          }}
          onStepDataChange={handleStepDataChange}
        />
      ) : null;
    },
    [state, handleStepDataChange],
  );

  const handleNextClick = async () => {
    const activeStep = state.currentStepIndex;
    const currentStep = state.visibleSteps[activeStep];

    let data: object;
    if (currentStep) {
      // TODO refactor this
      // Doing this because the medication step has no completion button
      const stepData = currentStepData[currentStep.id];
      if (currentStep.renderType === 'medications' && orders.length > 0) {
        const incompleteOrders = stepData?.filter((item: DrugOrderBasketItem) => {
          return item.isOrderIncomplete;
        });

        if (incompleteOrders?.length > 0) {
          showToast({
            title: t('warning', 'Atenção!'),
            kind: 'warning',
            critical: true,
            description: t(
              'incompleteOrders',
              'You have incomplete orders. Please complete all orders before proceeding.',
            ),
          });
          return false;
        }

        try {
          const abortController = new AbortController();
          const erroredItems = await postOrders(encounterUuid, abortController);
          if (orders.length > 0 && erroredItems.length == 0) {
            showOrderSuccessToast(t, orders);
          } else {
            // Try to find the steps that have errored items and set them as incomplete
            // setOrdersWithErrors(erroredItems);
          }
          const representation = 'custom:(orders:(uuid,display,drug:(uuid,display)))';
          const { data: encounter } = await openmrsFetch<Encounter>(
            `${restBaseUrl}/encounter/${encounterUuid}?v=${representation}`,
          );
          const orderBasketDrugs = orders.map((o) => o.drug.uuid);
          const savedOrders = encounter.orders.filter((encounterOrder) =>
            orderBasketDrugs.includes(encounterOrder.drug.uuid),
          );
          data = {
            encounter: encounterUuid,
            orders: savedOrders.map((o: Order) => o.uuid),
            stepId: currentStep.id,
            stepName: currentStep.title,
            renderType: currentStep.renderType,
          };
        } catch (error) {
          showToast({ kind: 'error', description: error.message });
          return;
        }
      }
      if (currentStep.renderType === 'allergies') {
        data = {
          allergies: stepRef.current.onStepComplete(),
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }
      if (currentStep.renderType === 'appointments' && stepData?.appointments) {
        data = {
          appointments: stepData?.appointments,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }
      if (currentStep.renderType === 'conditions' && stepData?.conditions) {
        data = {
          conditions: stepData?.conditions,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }
      if (currentStep.renderType === 'form' && stepData?.uuid) {
        data = {
          ...stepData,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }

      if (state.isLastStep) {
        const finalState = data
          ? workflowReducer(state, { type: COMPLETE_STEP, payload: currentStep.id, data })
          : state;
        await handleSave(finalState);
        return;
      }

      if (data) {
        dispatch({ type: COMPLETE_STEP, payload: currentStep.id, data });
      } else {
        dispatch({ type: GO_TO_NEXT_STEP });
      }
    }
  };

  const handleSave = async (finalState: WorkflowState) => {
    try {
      setSubmitting(true);
      const workflow = finalState.config;
      const incompleteSteps = workflow.steps.filter((step) => !finalState.completedSteps.has(step.id));

      if (incompleteSteps.length > 0) {
        showToast({
          title: t('warning', 'Warning!'),
          kind: 'warning',
          critical: true,
          description: t(
            'incompleteSteps',
            'Existem passos incompletos. Por favor, conclua todos os passos antes de salvar.',
          ),
        });
        // navigate to the first incomplete step
        const firstIncompleteStep = incompleteSteps[0];
        const firstIncompleteStepIndex = workflow.steps.findIndex((step) => step.id === firstIncompleteStep.id);
        dispatch({ type: GO_TO_STEP, payload: firstIncompleteStepIndex });
        return;
      }

      const incompleteOrderSteps = workflow.steps.filter((step) => {
        return ['medications', 'orders', 'tests'].includes(step.renderType) && !finalState.completedSteps.has(step.id);
      });
      if (incompleteOrderSteps.length > 0) {
        showToast({
          title: t('warning', 'Warning!'),
          kind: 'warning',
          critical: true,
          description: t(
            'incompleteOrderSteps',
            'Existem pedidos incompletos. Por favor, conclua todos os pedidos antes de continuar.',
          ),
        });
        return;
      }

      await saveWorkflowData(finalState, new AbortController());
      onComplete();
      showToast({
        title: t('success', 'Sucesso!'),
        kind: 'success',
        description: t('workflowCompletedSuccessfully', 'Fluxo concluído com sucesso.'),
      });
      if (state.config.syncPatient) {
        await syncPatient(state);
      }
    } catch (error) {
      showToast({
        title: t('error', 'Error!'),
        kind: 'error',
        critical: true,
        description: error.message,
      });
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const syncPatient = async (workflowState: WorkflowState) => {
    const formStepIds = workflowState.config.steps.filter((s) => s.renderType === 'form').map((s) => s.id);
    const encounters = Object.entries(workflowState.stepsData as Record<string, Encounter>)
      .filter(([k]) => formStepIds.includes(k))
      .map(([, v]) => v);

    if (encounters.length === 0) {
      throw new Error(t('patientSyncEncounterMissing', 'É necessário preencher pelo menos um formulário'));
    }
    const encounter = encounters.pop();
    const programMap = new Map([
      ['efe2481f-9e75-4515-8d5a-86bfde2b5ad3', '80A7852B-57DF-4E40-90EC-ABDE8403E01F'], //TARV
      ['142d23c4-c29f-4799-8047-eb3af911fd21', 'F5FEAD76-3038-4D3D-AC28-D63B9952F022'], //TB
      ['611f0a6b-68b7-4de7-bc7a-fd021330eef8', 'C4A3FFFA-BA52-4BEF-948D-1C8C90C3F38E'], //CCR
      ['ac7c5d2b-854a-48c4-a68f-0b8a92e11f4a', '165C876C-F850-436F-B0BB-80D519056BC3'], //PREP
    ]);
    const programState = {
      '4a7bec6f-8f27-4da5-b78d-40134c30d3ee': 'NOVO_PACIENTE', // ACTIVE ON PROGRAM
      'e1da7d3a-1d5f-11e0-b929-000c29ad1d07': 'TRANSFERIDO_DE', // TRANSFER FROM
    };
    const CONCEPT_SYNCHRONIZATION_STATUS_UUID = 'e936c643-bf3b-4955-8459-13ae5f192269';
    const CONCEPT_PENDING_STATUS_UUID = 'e95e64a6-2383-4380-8565-e1ace2496315';
    // prettier-ignore
    // eslint-disable-next-line prettier/prettier
    const rep =
      `custom:(
        patientIdentifier:(identifier),
        patientProgram:(
          dateEnrolled,program:(uuid,name),
          states:(
            startDate,endDate,state:(
              uuid,concept:(
                uuid,display))))`.replace(/\s/g, '');

    try {
      const {
        data: { results: enrollements },
      } = await openmrsFetch(`/ws/rest/v1/csaudecore/programenrollment?patient=${state.patient.id}&v=${rep}`);
      const {
        data: { birthdateEstimated },
      } = await openmrsFetch(`/ws/rest/v1/patient/${state.patient.id}?v=custom:(birthdateEstimated)`);
      const systemDate = new Date();
      const clinicalHistory = enrollements.map((p) => ({
        serviceCode: programMap.get(p.patientProgram.program.uuid),
        nid: p.patientIdentifier.identifier,
        admissionDate: p.patientProgram.dateEnrolled,
        programStatus: programState[p.patientProgram.states.find((s) => !s.endDate)?.state.concept.uuid],
        clinicalSector: '8a8a823b81900fee0181902674b20004',
        systemDate,
      }));
      const homeAddress = state.patient.address.find((a) => a.use === 'home');
      const payload = {
        encounterUuid: encounter.uuid,
        patientUuid: state.patient.id,
        firstName: state.patient.name[0].given[0],
        middleName: state.patient.name[0].given[1],
        lastName: state.patient.name[0].family,
        birthDate: state.patient.birthDate,
        birthdateEstimated,
        gender: state.patient.gender,
        province: homeAddress?.state,
        district: homeAddress?.district,
        administrativePost: '',
        locality: '',
        referencePoint: '',
        phoneNumber: state.patient.telecom?.at(0)?.value,
        alternativePhoneNumber: '',
        locationUuid: state.visit.location.uuid,
        locationName: state.visit.location.name,
        clinicalHistory,
      };
      await openmrsFetch('/ws/rest/v1/csaudeinterop/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      await openmrsFetch(`ws/rest/v1/encounter/${encounter.uuid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          obs: [
            {
              concept: CONCEPT_SYNCHRONIZATION_STATUS_UUID,
              value: CONCEPT_PENDING_STATUS_UUID,
            },
          ],
        },
      });
      showToast({
        kind: 'success',
        critical: true,
        description: t('patientSyncSuccess', 'Utente enviado para sincronização.'),
      });
    } catch (error) {
      showToast({
        kind: 'error',
        description: t('patientSyncError', 'Erro ao sincronizar o utente.'),
      });
      console.error(error);
    }
  };

  const handleBackClick = () => {
    dispatch({ type: GO_TO_PREVIOUS_STEP });
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {state.visibleSteps.length > 0
          ? renderStep(state.visibleSteps[state.currentStepIndex])
          : t('noVisibleSteps', 'Não existem passos visiveis.')}
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancelar')}
        </Button>
        <Button
          className={styles.button}
          kind="tertiary"
          onClick={handleBackClick}
          disabled={state.visibleSteps.length === 0}>
          <span>{t('previous', 'Anterior')}</span>
        </Button>
        <Button
          className={styles.button}
          disabled={isSubmitting || state.visibleSteps.length === 0}
          kind="primary"
          type="submit"
          onClick={handleNextClick}>
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'A salvar') + '...'} />
          ) : (
            <span>{state.isLastStep ? t('save', 'Salvar') : t('next', 'Próximo')}</span>
          )}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default WorkflowContainer;
