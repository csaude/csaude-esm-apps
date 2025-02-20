import React, { useCallback, useState } from 'react';
import { COMPLETE_STEP, UPDATE_PROGRESS, UPDATE_STEP_DATA, useWorkflow } from './workflow-context';
import { WorkflowConfig, WorkflowStep } from './types';
import { Wizard } from 'react-use-wizard';
import styles from './workflow-container.scss';
import Footer from '../footer.component';
import stepRegistry from './step-registry';

interface Props {
  workflow: WorkflowConfig;
  patientUuid: string;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => <div className={styles.wrapper}>{children}</div>;

const WorkflowContainer: React.FC<Props> = ({ workflow, patientUuid }) => {
  const { state, dispatch } = useWorkflow();
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});

  const handleStepDataChange = useCallback((stepId: string, data: any) => {
    setCurrentStepData((prev) => ({
      ...prev,
      [stepId]: data,
    }));
  }, []);

  const updateProgress = useCallback(() => {
    const totalWeight = workflow.steps.reduce((sum, step) => sum + (step.weight || 1), 0);
    const completedWeight = workflow.steps
      .filter((step) => state.completedSteps.has(step.id))
      .reduce((sum, step) => sum + (step.weight || 1), 0);

    dispatch({
      type: UPDATE_PROGRESS,
      payload: (completedWeight / totalWeight) * 100,
    });
  }, [workflow.steps, state.completedSteps, dispatch]);

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
          patientUuid={patientUuid}
          handleStepComplete={handleStepComplete}
          onStepDataChange={handleStepDataChange}
        />
      ) : null;
    },
    [patientUuid, handleStepComplete, handleStepDataChange],
  );

  const handleNextClick = () => {
    const currentStep = workflow.steps[state.currentStepIndex];
    if (currentStep) {
      dispatch({
        type: UPDATE_STEP_DATA,
        payload: {
          stepId: currentStep.id,
          data: currentStepData[currentStep.id],
        },
      });
      // Doing this because the medication step has no completion button
      if (currentStep.renderType === 'medications') {
        handleStepComplete(currentStep.id, currentStepData[currentStep.id]);
      }
    }
  };

  const footer = <Footer onSave={() => {}} onCancel={() => {}} onNextClick={handleNextClick} />;

  return (
    <Wizard footer={footer} wrapper={<Wrapper children={''} />}>
      {workflow.steps.map((step) => (
        <div key={step.id}>
          <h2 className={styles.productiveHeading03}>{step.title}</h2>
          {renderStep(step)}
        </div>
      ))}
    </Wizard>
  );
};

export default WorkflowContainer;
