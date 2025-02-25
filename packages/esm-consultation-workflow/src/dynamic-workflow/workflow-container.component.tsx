import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Encounter, openmrsFetch, restBaseUrl, showToast } from '@openmrs/esm-framework';
import { Order, postOrders, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { Wizard } from 'react-use-wizard';
import Footer from '../footer.component';
import { useOrderEncounter } from './api';
import { showOrderSuccessToast } from './helpers';
import stepRegistry from './step-registry';
import { DrugOrderBasketItem, WorkflowStep } from './types';
import styles from './workflow-container.scss';
import { COMPLETE_STEP, SET_CURRENT_STEP, UPDATE_PROGRESS, useWorkflow } from './workflow-context';
import { saveWorkflowData } from './workflow.resource';
import { StepConditionEvaluatorService } from './services/step-condition-evaluator.service';

const Wrapper = ({ children }: { children: React.ReactNode }) => <div className={styles.wrapper}>{children}</div>;

const WorkflowContainer: React.FC = () => {
  const { state, dispatch, onCancel } = useWorkflow();
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const { t } = useTranslation();
  const { encounterUuid } = useOrderEncounter(state.patientUuid);
  const { orders, clearOrders } = useOrderBasket<DrugOrderBasketItem>();
  const stepConditionEvaluator = useMemo(() => new StepConditionEvaluatorService(), []);

  // Track which steps should be visible
  const [visibleSteps, setVisibleSteps] = useState<WorkflowStep[]>([]);
  // Track the current index in wizard navigation
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Function to evaluate step visibility based on current state and step data
  const evaluateStepVisibility = useCallback(() => {
    const evaluatedSteps = state.config.steps.filter((step) => {
      console.log('evaluating step', step);
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

  const handleStepDataChange = useCallback((stepId: string, data: any) => {
    setCurrentStepData((prev) => ({
      ...prev,
      [stepId]: data,
    }));
  }, []);

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
    setActiveStepIndex(activeStep);
    const currentStep = visibleSteps[activeStep];

    if (currentStep) {
      dispatch({
        type: SET_CURRENT_STEP,
        payload: {
          stepId: currentStep.id,
          currentStepIndex: activeStep,
        },
      });

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
          if (erroredItems.length == 0) {
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
          });
        } catch (error) {
          showToast({ kind: 'error', description: error.message });
        }
      }
    }

    updateProgress();

    // When moving to the next step, evaluate if the next step should be visible
    // If not, we should skip it
    const nextStepIndex = activeStep + 1;
    if (nextStepIndex < visibleSteps.length) {
      // The next step is already in visible steps, so it's fine
      return true;
    } else {
      // We've reached the end of current visible steps
      // Re-evaluate and see if there are any new steps that should become visible
      const updatedVisibleSteps = evaluateStepVisibility();
      if (updatedVisibleSteps.length > visibleSteps.length) {
        setVisibleSteps(updatedVisibleSteps);
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
    } catch (error) {
      showToast({
        title: t('error', 'Error!'),
        kind: 'error',
        critical: true,
        description: error.message,
      });
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
