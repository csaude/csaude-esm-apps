import { Encounter, openmrsFetch, restBaseUrl, showToast } from '@openmrs/esm-framework';
import { Order, postOrders, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wizard } from 'react-use-wizard';
import Footer from '../footer.component';
import { useOrderEncounter } from './api';
import { showOrderSuccessToast } from './helpers';
import { StepConditionEvaluatorService } from './services/step-condition-evaluator.service';
import stepRegistry from './step-registry';
import { DrugOrderBasketItem, WorkflowState, WorkflowStep } from './types';
import styles from './workflow-container.scss';
import { COMPLETE_STEP, SET_CURRENT_STEP, UPDATE_PROGRESS, UPDATE_STEP_DATA, useWorkflow } from './workflow-context';
import { saveWorkflowData } from './workflow.resource';

const Wrapper = ({ children }: { children: React.ReactNode }) => <div className={styles.wrapper}>{children}</div>;

const WorkflowContainer: React.FC = () => {
  const { state, dispatch, onCancel } = useWorkflow();
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const { t } = useTranslation();
  const { encounterUuid } = useOrderEncounter(state.patientUuid);
  const { orders } = useOrderBasket<DrugOrderBasketItem>();
  const stepConditionEvaluator = useMemo(() => new StepConditionEvaluatorService(), []);

  // Track which steps should be visible
  const [visibleSteps, setVisibleSteps] = useState<WorkflowStep[]>([]);

  // Function to evaluate step visibility based on current state and step data
  const evaluateStepVisibility = useCallback(() => {
    const evaluatedSteps = state.config.steps.filter((step) => {
      // If step has no visibility conditions, it's always visible
      if (!step.visibility || !step.visibility.conditions || step.visibility.conditions.length === 0) {
        return true;
      }

      // Group conditions by their source (patient or step)
      const patientConditions = step.visibility.conditions.filter((condition) => condition.source === 'patient');
      const stepConditions = step.visibility.conditions.filter((condition) => condition.source === 'step');

      // Evaluate patient conditions
      const patientConditionsMet =
        patientConditions.length === 0 ||
        patientConditions.every((condition) => stepConditionEvaluator.evaluateCondition(condition, state));

      // Evaluate step conditions if there are any
      const stepConditionsMet =
        stepConditions.length === 0 ||
        stepConditions.every((condition) => {
          // Get the source step's data
          const sourceStepData = condition.stepId ? state.stepsData[condition.stepId] : null;

          // Skip this condition if we don't have data for the source step yet
          if (!sourceStepData) {
            return false;
          }

          // Evaluate the condition using the data from the source step
          return stepConditionEvaluator.evaluateCondition(condition, state);
        });

      // Combine results based on logical operator
      const logicalOperator = step.visibility.logicalOperator || 'AND';
      return logicalOperator === 'AND'
        ? patientConditionsMet && stepConditionsMet
        : patientConditionsMet || stepConditionsMet;
    });

    return evaluatedSteps;
  }, [state, stepConditionEvaluator]);

  // Re-evaluate step visibility whenever step data changes
  useEffect(() => {
    const updatedVisibleSteps = evaluateStepVisibility();
    setVisibleSteps(updatedVisibleSteps);
  }, [currentStepData, state.completedSteps, evaluateStepVisibility]);

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

  const updateProgress = useCallback(() => {
    const workflow = state.config;
    const totalWeight = workflow.steps.reduce((sum, step) => sum + (step.weight || 1), 0);
    const completedWeight = workflow.steps
      .filter((step) => state.completedSteps.has(step.id))
      .reduce((sum, step) => sum + (step.weight || 1), 0);

    dispatch({
      type: UPDATE_PROGRESS,
      payload: (completedWeight / totalWeight) * 100,
    });
  }, [state.config, state.completedSteps, dispatch]);

  const handleStepComplete = useCallback(
    (stepId: string, data: any) => {
      dispatch({ type: COMPLETE_STEP, payload: stepId, data });
      updateProgress();
    },
    [dispatch, updateProgress],
  );

  const renderStep = useCallback(
    (step: WorkflowStep) => {
      const StepComponent = stepRegistry[step.renderType];

      return StepComponent ? (
        <StepComponent
          step={step}
          patientUuid={state.patientUuid}
          handleStepComplete={handleStepComplete}
          onStepDataChange={handleStepDataChange}
        />
      ) : null;
    },
    [state, handleStepComplete, handleStepDataChange],
  );

  const handleNextClick = async (activeStep: number) => {
    const currentStep = visibleSteps[activeStep];

    if (currentStep) {
      dispatch({
        type: SET_CURRENT_STEP,
        payload: {
          stepId: currentStep.id,
          currentStepIndex: activeStep,
        },
      });

      // TODO refactor this
      // Doing this because the medication step has no completion button
      if (currentStep.renderType === 'medications') {
        const stepData = currentStepData[currentStep.id];
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
          handleStepComplete(currentStep.id, {
            encounter: encounterUuid,
            orders: savedOrders.map((o: Order) => o.uuid),
            stepId: currentStep.id,
            stepName: currentStep.title,
            renderType: currentStep.renderType,
          });
        } catch (error) {
          showToast({ kind: 'error', description: error.message });
        }
      }
      if (currentStep.renderType === 'allergies') {
        handleStepComplete(currentStep.id, {
          allergies: currentStepData[currentStep.id]?.allergies,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        });
      }
      if (currentStep.renderType === 'appointments') {
        handleStepComplete(currentStep.id, {
          appointments: currentStepData[currentStep.id]?.appointments,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        });
      }
      if (currentStep.renderType === 'conditions') {
        handleStepComplete(currentStep.id, {
          conditions: currentStepData[currentStep.id]?.conditions,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        });
      }
    }

    updateProgress();

    const dispatchNextStep = (nextStepIndex: number) =>
      dispatch({
        type: SET_CURRENT_STEP,
        payload: {
          currentStepIndex: nextStepIndex,
        },
      });

    // When moving to the next step, evaluate if the next step should be visible
    // If not, we should skip it
    const nextStepIndex = activeStep + 1;
    if (nextStepIndex < visibleSteps.length) {
      // The next step is already in visible steps, so it's fine
      dispatchNextStep(nextStepIndex);
      return true;
    } else {
      // We've reached the end of current visible steps
      // Re-evaluate and see if there are any new steps that should become visible
      const updatedVisibleSteps = evaluateStepVisibility();
      if (updatedVisibleSteps.length >= visibleSteps.length) {
        setVisibleSteps(updatedVisibleSteps);
        dispatchNextStep(nextStepIndex);
        return true;
      }
      return false;
    }
  };

  const handleSave = async () => {
    // Todo: Think on moving the validation logic of all steps to the workflow container
    // The validation is not here because the Footer component is the one that can trigger an step change
    // and we need to move to incomplete steps
    try {
      await saveWorkflowData(state, new AbortController());
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
      showToast({
        kind: 'success',
        critical: true,
        description: t('patientSyncSuccess', 'Utente sincronizado com sucesso.'),
      });
    } catch (error) {
      showToast({
        kind: 'error',
        description: t('patientSyncError', 'Erro ao sincronizar o utente.'),
      });
      console.error(error);
    }
  };

  const footer = (
    <Footer onSave={handleSave} onCancel={() => onCancel({ ignoreChanges: false })} onNextClick={handleNextClick} />
  );

  return (
    <div className={styles.container}>
      <Wizard footer={footer} wrapper={<Wrapper children={''} />}>
        {visibleSteps.map((step) => (
          <div key={step.id}>
            <h2 className={styles.productiveHeading03}>{step.title}</h2>
            {renderStep(step)}
          </div>
        ))}
      </Wizard>
    </div>
  );
};

export default WorkflowContainer;
