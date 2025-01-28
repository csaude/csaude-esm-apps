import React from 'react';
import { useWizard } from 'react-use-wizard';
import styles from './workflow-container.scss';

const WorkflowNavigation: React.FC = () => {
  const { previousStep, nextStep, isFirstStep, isLastStep, activeStep } = useWizard();

  return (
    <div className={styles.workflowNavigation}>
      <button onClick={previousStep} disabled={isFirstStep} className={styles.btnNavigation}>
        Previous
      </button>
      <span className={styles.stepIndicator}>Step {activeStep + 1}</span>
      <button onClick={nextStep} disabled={isLastStep} className={styles.btnNavigation}>
        Next
      </button>
    </div>
  );
};

export default WorkflowNavigation;
