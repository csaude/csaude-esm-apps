import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DefinitionTooltip, Tag } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import styles from './workflow-details.scss';
import { ConsultationWorkflowData } from '../../hooks/useConsultationWorkflowData';

interface WorkflowDetailsProps {
  workflow: ConsultationWorkflowData;
  onBackClick: () => void;
}

const WorkflowDetails: React.FC<WorkflowDetailsProps> = ({ workflow, onBackClick }) => {
  const { t } = useTranslation();

  // Extract visit type from display format like "Consulta Externa @ CS CICTRA - 11/03/2025 15:23"
  const extractVisitInfo = (visitDisplay: string) => {
    const parts = visitDisplay.split('@');
    const visitType = parts[0]?.trim() || '';
    const locationAndDate = parts[1]?.trim() || '';

    return {
      visitType,
      location: locationAndDate.split('-')[0]?.trim() || '',
      dateTime: locationAndDate.split('-')[1]?.trim() || '',
    };
  };

  const visitInfo = extractVisitInfo(workflow.visit.display);
  const completedSteps = workflow.steps.filter((step) => step.completed).length;

  // Get a render type display label
  const getRenderTypeLabel = (renderType: string) => {
    const types = {
      form: t('form', 'Form'),
      conditions: t('conditions', 'Conditions'),
      allergies: t('allergies', 'Allergies'),
      medications: t('medications', 'Medications'),
      orders: t('orders', 'Orders'),
      diagnosis: t('diagnosis', 'Diagnosis'),
      'form-workspace': t('formWorkspace', 'Form Workspace'),
      appointments: t('appointments', 'Appointments'),
    };

    return types[renderType] || renderType;
  };

  // Get color based on step completed status
  const getStepStatusColor = (completed: boolean) => {
    return completed ? 'green' : 'red';
  };

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

      <div className={styles.workflowSummary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>{t('workflowId', 'Workflow ID')}:</span>
          <span className={styles.summaryValue}>{workflow.uuid}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>{t('visitType', 'Visit Type')}:</span>
          <span className={styles.summaryValue}>{visitInfo.visitType}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>{t('location', 'Location')}:</span>
          <span className={styles.summaryValue}>{visitInfo.location}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>{t('dateTime', 'Date & Time')}:</span>
          <span className={styles.summaryValue}>{visitInfo.dateTime}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>{t('progress', 'Progress')}:</span>
          <span className={styles.summaryValue}>
            {completedSteps} / {workflow.steps.length} {t('stepsCompleted', 'steps completed')}
            <Tag type={completedSteps === workflow.steps.length ? 'green' : 'purple'} className={styles.progressTag}>
              {Math.round((completedSteps / workflow.steps.length) * 100)}%
            </Tag>
          </span>
        </div>
      </div>

      <div className={styles.stepsSection}>
        <h5 className={styles.sectionTitle}>{t('workflowSteps', 'Workflow Steps')}</h5>
        <div className={styles.stepsList}>
          {workflow.steps.map((step, index) => (
            <div className={styles.stepItem} key={step.stepId}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepInfo}>
                <span className={styles.stepName}>{step.stepName}</span>
                <div className={styles.stepMeta}>
                  <Tag type="gray" className={styles.stepType}>
                    {getRenderTypeLabel(step.renderType)}
                  </Tag>
                  <Tag type={getStepStatusColor(step.completed)} className={styles.stepStatus}>
                    {step.completed ? t('completed', 'Completed') : t('incomplete', 'Incomplete')}
                  </Tag>
                </div>
                {step.dataReference && (
                  <DefinitionTooltip
                    className={styles.dataReferenceTooltip}
                    definition={step.dataReference}
                    align="bottom"
                    direction="bottom">
                    <span className={styles.dataReferenceLabel}>{t('dataReference', 'Data Reference')}</span>
                  </DefinitionTooltip>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
