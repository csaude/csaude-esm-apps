import { Button, ButtonSet, InlineLoading, ActionableNotification, ProgressBar } from '@carbon/react';
import { type Encounter, openmrsFetch, restBaseUrl, showToast, useLayoutType } from '@openmrs/esm-framework';
import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import stepRegistry, { type StepComponentHandle } from './step-registry';
import { type WorkflowConfig, type WorkflowState, type WorkflowStep } from './types';
import styles from './workflow-container.scss';
import {
  COMPLETE_STEP,
  GO_TO_NEXT_STEP,
  GO_TO_PREVIOUS_STEP,
  GO_TO_STEP,
  useWorkflow,
  workflowReducer,
} from './workflow-context';
import { saveWorkflowData } from './workflow.resource';

const WorkflowContainer: React.FC = () => {
  const { state, isLastStep, visibleSteps, dispatch, getCurrentStep, onCancel, onComplete } = useWorkflow();
  const stepRef = useRef<StepComponentHandle>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const renderStep = useCallback(
    (step: WorkflowStep) => {
      const StepComponent = stepRegistry[step.renderType];

      return StepComponent ? (
        <StepComponent ref={stepRef} step={step} stepData={state.stepsData[step.id]} patientUuid={state.patientUuid} />
      ) : null;
    },
    [state],
  );

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

      // Check if there are any regimen-drug-order steps in the workflow
      await verifyDrugOrderSyncStatus(workflow);

      if (state.config.syncPatient) {
        await syncPatient(finalState);
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

    async function verifyDrugOrderSyncStatus(workflow: WorkflowConfig) {
      const regimenDrugOrderSteps = workflow.steps.filter((step) => step.renderType === 'regimen-drug-order');

      // If we have regimen-drug-order steps, check their sync status and show appropriate message
      if (regimenDrugOrderSteps.length > 0) {
        for (const step of regimenDrugOrderSteps) {
          const stepData = finalState.stepsData[step.id];

          if (stepData && stepData['regimen-drug-order']?.encounterUuid) {
            try {
              // Fetch encounter details to get sync status observation
              const rep = 'custom:(uuid,display,obs:(uuid,display,value:(uuid,display)))';
              const { data: encounter } = await openmrsFetch<Encounter>(
                `${restBaseUrl}/encounter/${stepData['regimen-drug-order']?.encounterUuid}?v=${rep}`,
              );

              // Find the sync status observation
              const syncStatusObs = encounter.obs?.find((obs) =>
                obs.display.toLowerCase().includes('estado de sincronização'),
              );

              if (syncStatusObs && typeof syncStatusObs.value === 'object' && 'uuid' in syncStatusObs.value) {
                const statusValue = syncStatusObs.value.uuid;

                // Display message based on sync status
                if (statusValue === 'feb94661-9f27-4a63-972f-39ebb63c7022') {
                  // SUCCESS
                  showToast({
                    title: t('syncSuccess', 'Sincronização bem-sucedida'),
                    kind: 'success',
                    description: t(
                      'medicationAvailable',
                      'O paciente pode agora levantar seus medicamentos na farmácia.',
                    ),
                  });
                } else if (statusValue === '9b9c21dc-e1fb-4cd9-a947-186e921fa78c') {
                  // ERROR
                  showToast({
                    title: t('syncError', 'Erro de sincronização'),
                    kind: 'error',
                    critical: true,
                    description: t(
                      'pharmacySystemError',
                      'Houve um erro na sincronização com o sistema da farmácia, por favor contacte o departamento de TI.',
                    ),
                  });
                } else if (statusValue === 'e95e64a6-2383-4380-8565-e1ace2496315') {
                  // PENDING
                  showToast({
                    title: t('syncPending', 'Sincronização pendente'),
                    kind: 'info',
                    description: t(
                      'pharmacyProcessing',
                      'A requisição está sendo processada pelo sistema da farmácia.',
                    ),
                  });
                }
              }
            } catch (error) {
              console.error('Error checking prescription sync status:', error);
            }
          }
        }
      }
    }
  };

  const getStepDataPayload = async (
    currentStep: WorkflowStep,
    stepRef: React.RefObject<StepComponentHandle>,
  ): Promise<object | undefined> => {
    try {
      const data = await stepRef.current.onStepComplete();
      if (data) {
        return {
          ...data,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }
      return undefined;
    } catch (error) {
      showToast({ kind: 'error', description: error.message });
      console.error(error);
      return;
    }
  };

  const handleNextClick = async () => {
    const currentStep = getCurrentStep();

    if (currentStep) {
      const data = await getStepDataPayload(currentStep, stepRef);
      if (isLastStep) {
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

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const syncPatient = async (workflowState: WorkflowState) => {
    const firstFormStepId = workflowState.config.steps.find((s) => s.renderType === 'form')?.id;
    const firstEncounter = Object.entries(workflowState.stepsData as Record<string, Encounter>)
      .filter(([k]) => k === firstFormStepId)
      .map(([, v]) => v)[0];

    if (firstEncounter?.encounter === undefined) {
      throw new Error(t('patientSyncEncounterMissing', 'É necessário preencher pelo menos um formulário'));
    }
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
      } = await openmrsFetch(`/ws/rest/v1/csaudecore/programenrollment?patient=${workflowState.patient.id}&v=${rep}`);
      const {
        data: { birthdateEstimated },
      } = await openmrsFetch(`/ws/rest/v1/patient/${workflowState.patient.id}?v=custom:(birthdateEstimated)`);
      const systemDate = new Date();
      const clinicalHistory = enrollements.map((p) => ({
        serviceCode: programMap.get(p.patientProgram.program.uuid),
        nid: p.patientIdentifier.identifier,
        admissionDate: p.patientProgram.dateEnrolled,
        programStatus: programState[p.patientProgram.states.find((s) => !s.endDate)?.state.concept.uuid],
        clinicalSector: '8a8a823b81900fee0181902674b20004',
        systemDate,
      }));
      const homeAddress = workflowState.patient.address.find((a) => a.use === 'home');
      const payload = {
        encounterUuid: firstEncounter.encounter.uuid,
        patientUuid: workflowState.patient.id,
        firstName: workflowState.patient.name[0].given[0],
        middleName: workflowState.patient.name[0].given[1],
        lastName: workflowState.patient.name[0].family,
        birthDate: workflowState.patient.birthDate,
        birthdateEstimated,
        gender: capitalizeFirstLetter(workflowState.patient.gender),
        province: homeAddress?.state,
        district: homeAddress?.district,
        administrativePost: '',
        locality: '',
        referencePoint: '',
        phoneNumber: workflowState.patient.telecom?.at(0)?.value,
        alternativePhoneNumber: '',
        locationUuid: workflowState.visit.location.uuid,
        locationName: workflowState.visit.location.name,
        clinicalHistory,
      };
      await openmrsFetch('/ws/rest/v1/csaudeinterop/patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      await openmrsFetch(`ws/rest/v1/encounter/${firstEncounter.encounter.uuid}`, {
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

  const handleBackClick = async () => {
    const currentStep = getCurrentStep();
    if (currentStep) {
      const data = await getStepDataPayload(currentStep, stepRef);
      dispatch({ type: GO_TO_PREVIOUS_STEP, payload: currentStep.id, data });
    }
  };

  return (
    <div className={styles.container}>
      {state.visibleSteps.length > 0 && (
        <div>
          <ProgressBar max={state.visibleSteps.length} value={state.currentStepIndex + 1} size="small" hideLabel />
          <div className={styles.stepCount}>
            {t('step', 'Passo')} {state.currentStepIndex + 1} {t('of', 'de')} {state.visibleSteps.length}
          </div>
          <h2 className={styles.productiveHeading03}>{state.visibleSteps[state.currentStepIndex].title}</h2>
        </div>
      )}
      <div className={styles.wrapper}>
        {visibleSteps ? (
          renderStep(getCurrentStep())
        ) : (
          <ActionableNotification
            actionButtonLabel={t('close', 'Fechar')}
            onActionButtonClick={onCancel}
            kind="warning"
            lowContrast
            hideCloseButton
            subtitle={t('noVisibleSteps', 'Não existem passos visiveis para esta consulta.')}
            title={t('warning', 'Atenção!')}
          />
        )}
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancelar')}
        </Button>
        <Button className={styles.button} kind="tertiary" onClick={handleBackClick} disabled={!visibleSteps}>
          <span>{t('previous', 'Anterior')}</span>
        </Button>
        <Button
          className={styles.button}
          disabled={isSubmitting || !visibleSteps}
          kind="primary"
          type="submit"
          onClick={handleNextClick}>
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'A salvar') + '...'} />
          ) : (
            <span>{isLastStep ? t('save', 'Salvar') : t('next', 'Próximo')}</span>
          )}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default WorkflowContainer;
