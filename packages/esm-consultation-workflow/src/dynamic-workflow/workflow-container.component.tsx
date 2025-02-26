import React, { useCallback, useEffect, useState } from 'react';
import { COMPLETE_STEP, SET_CURRENT_STEP, UPDATE_PROGRESS, UPDATE_STEP_DATA, useWorkflow } from './workflow-context';
import { WorkflowConfig, WorkflowStep, DrugOrderBasketItem } from './types';
import { useWizard, Wizard } from 'react-use-wizard';
import styles from './workflow-container.scss';
import Footer from '../footer.component';
import stepRegistry from './step-registry';
import { showSnackbar, showToast } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const Wrapper = ({ children }: { children: React.ReactNode }) => <div className={styles.wrapper}>{children}</div>;

const WorkflowContainer: React.FC = () => {
  const { state, dispatch } = useWorkflow();
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const { t } = useTranslation();

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

  const handleNextClick = (activeStep: number) => {
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
            title: t('warning', 'Warning!'),
            kind: 'warning',
            critical: true,
            description: t(
              'incompleteOrders',
              'You have incomplete orders. Please complete all orders before proceeding.',
            ),
          });
          return false;
        }
        handleStepComplete(currentStep.id, stepData);
      }
    }
    updateProgress();
    return true;
  };

  const handleSave = () => {
    // Todo: Think on moving the validation logic of all steps to the workflow container
    // The validation is not here because the Footer component is the one that can trigger an step change
    // and we need to move to incomplete steps
  };

  const footer = <Footer onSave={handleSave} onCancel={() => {}} onNextClick={handleNextClick} />;

  return (
    <Wizard footer={footer} wrapper={<Wrapper children={''} />}>
      {state.config.steps.map((step) => (
        <div key={step.id}>
          <h2 className={styles.productiveHeading03}>{step.title}</h2>
          {renderStep(step)}
        </div>
      ))}
    </Wizard>
  );
};

export default WorkflowContainer;
