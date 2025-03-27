import React, { useCallback, useState } from 'react';
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

const Wrapper = ({ children }: { children: React.ReactNode }) => <div className={styles.wrapper}>{children}</div>;

const WorkflowContainer: React.FC = () => {
  const { state, dispatch, onCancel } = useWorkflow();
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const { t } = useTranslation();
  const { encounterUuid } = useOrderEncounter(state.patientUuid);
  const { orders, clearOrders } = useOrderBasket<DrugOrderBasketItem>();

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
    [state.patientUuid, handleStepComplete, handleStepDataChange],
  );

  const handleNextClick = async (activeStep: number) => {
    const currentStep = state.config.steps[activeStep];
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
          const orderBasketdrugs = orders.map((o) => o.drug.uuid);
          const savedOrders = encounter.orders.filter((encounterOrder) =>
            orderBasketdrugs.includes(encounterOrder.drug.uuid),
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
    return true;
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
        {state.config.steps.map((step) => (
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
