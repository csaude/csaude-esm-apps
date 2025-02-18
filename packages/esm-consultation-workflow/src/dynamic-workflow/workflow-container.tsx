import React, { useEffect } from 'react';
import { useWorkflow } from './workflow-context';
import { WorkflowConfig, WorkflowStep } from './types';
import { useWizard, Wizard } from 'react-use-wizard';
import WorkflowNavigation from './workflow-navigation';
import styles from './workflow-container.scss';
import FormRenderer from './components/form-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import Footer from '../footer.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import stepRegistry from './step-registry';

interface Props {
  workflow: WorkflowConfig;
  patientUuid: string;
}
const Wrapper = ({ children }: { children?: any }) => <div className={styles.wrapper}>{children}</div>;

const WizardStep: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeStep } = useWizard();

  return <>{children}</>;
};

const WorkflowContainer: React.FC<Props> = ({ workflow, patientUuid }) => {
  const { state, dispatch } = useWorkflow();

  const renderStep = (step: WorkflowStep) => {
    const StepComponent = stepRegistry[step.renderType];
    return StepComponent ? (
      <StepComponent step={step} patientUuid={patientUuid} handleStepComplete={handleStepComplete} />
    ) : null;
  };

  const handleStepComplete = (stepId: string, data: any) => {
    dispatch({ type: 'COMPLETE_STEP', payload: stepId, data });
    updateProgress();
  };

  const updateProgress = () => {
    const totalWeight = workflow.steps.reduce((sum, step) => sum + (step.weight || 1), 0);
    const completedWeight = workflow.steps
      .filter((step) => state.completedSteps.has(step.id))
      .reduce((sum, step) => sum + (step.weight || 1), 0);

    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: (completedWeight / totalWeight) * 100,
    });
  };
  const footer = <Footer onSave={() => {}} onCancel={() => {}} />;
  return (
    //   <div>
    //     <div className={styles.progressBar} style={{ '--progress': `${state.progress}%` } as React.CSSProperties}>
    // //         Progress: {state.progress.toFixed(0)}%
    // //       </div>
    //   </div>
    <Wizard wrapper={<Wrapper />} footer={footer}>
      {workflow.steps.map((step) => (
        <WizardStep key={step.id}>
          <div>
            <h2 className={styles.productiveHeading03}>{step.title}</h2>
            {renderStep(step)}
          </div>
        </WizardStep>
      ))}
    </Wizard>
  );
};

export default WorkflowContainer;
