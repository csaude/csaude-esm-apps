import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, Link } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import styles from './consultation-workflow-details.scss';
import { ConsultationWorkflowData } from '../../hooks/useConsultationWorkflowData';
import AllergiesStepDisplay from './step-displays/allergies-step-display.component';
import { useConsultationWorkflow } from '../../hooks/useConsultationWorkflow';
import FormStepDisplay from './step-displays/form-step-display.component';
import ConditionsStepDisplay from './step-displays/conditions-step-display.component';
import { formatDate } from '@openmrs/esm-framework';
import RegimenDrugOrderStepDisplay from './step-displays/regimen-drug-order-step-display.component';

interface ConsultationWorkflowDetailsProps {
  workflow: ConsultationWorkflowData;
  onBackClick: () => void;
}

const ConsultationWorkflowDetails: React.FC<ConsultationWorkflowDetailsProps> = ({ workflow, onBackClick }) => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>(workflow.steps[0]?.stepId || '');
  const { consultationWorkflow, isLoadingConsultationWorkflow } = useConsultationWorkflow(
    workflow?.workflowConfig?.uuid,
  );

  const getStepComponent = (step) => {
    const stepConfig = consultationWorkflow?.steps.find((s) => s.id === step.stepId);
    switch (step.renderType) {
      case 'allergies':
        return <AllergiesStepDisplay step={{ ...step, patientUuid: workflow.patientUuid }} />;
      case 'form':
        return <FormStepDisplay step={{ ...step, formUuid: stepConfig?.formId, patientUuid: workflow.patientUuid }} />;
      case 'conditions':
        return <ConditionsStepDisplay step={step} />;
      case 'regimen-drug-order':
        return <RegimenDrugOrderStepDisplay step={step} />;
      default:
        return (
          <div className={styles.noDisplayComponent}>
            <p>{t('noDisplayComponent', 'No display component available for this step type.')}</p>
            {step.dataReference && (
              <p>
                {t('dataReference', 'Data Reference')}: {step.dataReference}
              </p>
            )}
          </div>
        );
    }
  };

  const completedSteps = workflow.steps.filter((step) => step.completed).length;
  const totalSteps = workflow.steps.length;
  const visitDate = new Date(workflow.dateCreated);
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Only render tabs if there are steps
  if (workflow.steps.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Button
            kind="ghost"
            renderIcon={ArrowLeft}
            iconDescription={t('back', 'Back')}
            onClick={onBackClick}
            className={styles.backButton}>
            {t('back', 'Back')}
          </Button>
          <h4 className={styles.workflowTitle}>{workflow.workflowConfig.name}</h4>
        </div>
        <div className={styles.emptyState}>{t('noStepsFound', 'No steps found for this workflow.')}</div>
      </div>
    );
  }

  if (isLoadingConsultationWorkflow) {
    return <InlineLoading description={t('loadingWorkflow', 'Loading workflow...')} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          iconDescription={t('back', 'Back')}
          onClick={onBackClick}
          className={styles.backButton}>
          {t('back', 'Back')}
        </Button>
        <h4 className={styles.workflowTitle}>{workflow.workflowConfig.name}</h4>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summarySection}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('workflowId', 'Workflow ID')}:</span>
            <span className={styles.summaryValue}>{workflow.uuid}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('visitType', 'Visit Type')}:</span>
            <span className={styles.summaryValue}>{workflow.visit.visitType.display}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('location', 'Location')}:</span>
            <span className={styles.summaryValue}>{workflow.visit.location.display}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('dateTime', 'Date & Time')}:</span>
            <span className={styles.summaryValue}>{formatDate(visitDate, { mode: 'wide', time: true })}</span>
          </div>
        </div>
        <div className={styles.progressSection}>
          <span className={styles.progressLabel}>{t('progress', 'Progress')}:</span>
          <span className={styles.progressValue}>
            {completedSteps} / {totalSteps} {t('stepsCompleted', 'steps completed')}
          </span>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}>
              <span className={styles.progressText}>{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionTitle}>{t('workflowSteps', 'Workflow Steps')}</div>

      <div className={styles.workflowContent}>
        <nav className={styles.navContainer}>
          <ul className={styles.navList}>
            {workflow.steps.map((step, index) => (
              <Link
                key={step.stepId}
                className={`${styles.navItem} ${selectedTab === step.stepId ? styles.navItemActive : ''}`}
                onClick={() => setSelectedTab(step.stepId)}>
                <div className={styles.stepNumberContainer}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                </div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepName}>{step.stepName}</span>
                  <div className={styles.stepMetadata}>
                    <span className={styles.stepType}>{step.renderType}</span>
                    <span className={`${styles.stepStatus} ${step.completed ? styles.completed : styles.incomplete}`}>
                      {step.completed ? t('completed', 'Completed') : t('incomplete', 'Incomplete')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        </nav>
        <div className={styles.contentContainer}>
          {workflow.steps.map((step) => (
            <div
              key={step.stepId}
              className={`${styles.stepContent} ${selectedTab === step.stepId ? styles.visible : styles.hidden}`}>
              {getStepComponent(step)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsultationWorkflowDetails;
