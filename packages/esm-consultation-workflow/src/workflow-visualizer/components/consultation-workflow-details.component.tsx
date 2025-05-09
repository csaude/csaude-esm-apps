import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, Link, ActionableNotification, Tag } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import styles from './consultation-workflow-details.scss';
import { ConsultationWorkflowData } from '../../hooks/useConsultationWorkflowData';
import AllergiesStepDisplay from './step-displays/allergies-step-display.component';
import { useConsultationWorkflow } from '../../hooks/useConsultationWorkflow';
import FormStepDisplay from './step-displays/form-step-display.component';
import ConditionsStepDisplay from './step-displays/conditions-step-display.component';
import { formatDate, openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import RegimenDrugOrderStepDisplay from './step-displays/regimen-drug-order-step-display.component';
import { useObs } from '../../hooks/useObs';
import { AppointmentsStepDisplay } from './step-displays';

interface ConsultationWorkflowDetailsProps {
  workflow: ConsultationWorkflowData;
  onBackClick: () => void;
}

const ConsultationWorkflowDetails: React.FC<ConsultationWorkflowDetailsProps> = ({ workflow, onBackClick }) => {
  const { t } = useTranslation();
  const { consultationWorkflow, isLoadingConsultationWorkflow } = useConsultationWorkflow(
    workflow?.workflowConfig?.uuid,
  );

  // Sort workflow steps according to the order defined in consultationWorkflow
  const sortedSteps = React.useMemo(() => {
    if (!consultationWorkflow?.steps?.length) {
      return workflow.steps;
    }

    // Create a map for quick lookups of step order in consultationWorkflow
    const orderMap = new Map(consultationWorkflow.steps.map((step, index) => [step.id, index]));

    // Return a new sorted array based on the order in consultationWorkflow
    return [...workflow.steps].sort((a, b) => {
      const orderA = orderMap.get(a.stepId) ?? Number.MAX_SAFE_INTEGER;
      const orderB = orderMap.get(b.stepId) ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [workflow.steps, consultationWorkflow?.steps]);

  // Initialize selectedTab with the first step from the sorted list
  const [selectedTab, setSelectedTab] = useState<string>('');

  // Update selectedTab when sortedSteps is available
  useEffect(() => {
    if (sortedSteps.length > 0) {
      setSelectedTab(sortedSteps[0].stepId);
    }
  }, [sortedSteps]);

  const matchingObs = workflow.visit.encounters
    .flatMap((encounter) => encounter.obs || [])
    .filter((obs) => obs.display.toLowerCase().startsWith('estado de sincroniza'));
  const { obs } = useObs(matchingObs[0]?.uuid);

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
      case 'appointments':
        return <AppointmentsStepDisplay step={{ ...step, patientUuid: workflow.patientUuid }} />;
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

  const getSyncronizationStatus = (statusUuid: string): 'green' | 'red' | 'purple' | 'gray' => {
    if (statusUuid.includes('feb94661-9f27-4a63-972f-39ebb63c7022')) {
      return 'green'; // SUCESSO
    }
    if (statusUuid.includes('e95e64a6-2383-4380-8565-e1ace2496315')) {
      return 'gray'; // PENDENTE
    }
    if (statusUuid.includes('9b9c21dc-e1fb-4cd9-a947-186e921fa78c')) {
      return 'red'; // ERROR
    }
    return 'gray'; // UNKNOWN
  };

  // Use sortedSteps for calculations
  const completedSteps = sortedSteps.filter((step) => step.completed).length;
  const totalSteps = sortedSteps.length;
  const visitDate = new Date(workflow.dateCreated);
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Only render tabs if there are steps
  if (sortedSteps.length === 0) {
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
        <div className={styles.emptyState}>{t('noStepsFound', 'Nenhuma etapa encontrada para este fluxo.')}</div>
      </div>
    );
  }

  if (isLoadingConsultationWorkflow) {
    return <InlineLoading description={t('loadingWorkflow', 'Carregando fluxo...')} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          iconDescription={t('back', 'Voltar')}
          onClick={onBackClick}
          className={styles.backButton}>
          {t('back', 'Voltar')}
        </Button>
        <h4 className={styles.workflowTitle}>{workflow.workflowConfig.name}</h4>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summarySection}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('visitType', 'Tipo da visita')}:</span>
            <span className={styles.summaryValue}>{workflow.visit.visitType.display}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('location', 'Local')}:</span>
            <span className={styles.summaryValue}>{workflow.visit.location.display}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('dateTime', 'Data e Hora')}:</span>
            <span className={styles.summaryValue}>{formatDate(visitDate, { mode: 'wide', time: true })}</span>
          </div>
        </div>
        <div className={styles.progressSection}>
          <span className={styles.progressLabel}>{t('progress', 'Progresso')}:</span>
          <span className={styles.progressValue}>
            {completedSteps} / {totalSteps} {t('stepsCompleted', 'etapas concluídas')}
          </span>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}>
              <span className={styles.progressText}>{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {obs && workflow.workflowConfig.name.toLowerCase().includes('consulta de admiss') && (
        <div className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>
              {t('syncronizationStateIdmed', 'Estado de Sincronização com iDMED')}:
            </span>
            <div>
              <Tag type={getSyncronizationStatus(obs.value.uuid)}>{obs.value.display}</Tag>
            </div>
          </div>

          {obs.comment && (
            <div className={styles.summaryItem}>
              <ActionableNotification
                subtitle={obs.comment}
                inline
                title={t('error', 'Erro: ')}
                kind="error"
                lowContrast
                hideCloseButton
              />
            </div>
          )}
        </div>
      )}

      <div className={styles.sectionTitle}>{t('workflowSteps', 'Etapas do Fluxo')}</div>

      <div className={styles.workflowContent}>
        <nav className={styles.navContainer}>
          <ul className={styles.navList}>
            {sortedSteps.map((step, index) => (
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
                      {step.completed ? t('completed', 'Concluído') : t('incomplete', 'Incompleto')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        </nav>
        <div className={styles.contentContainer}>
          {sortedSteps.map((step) => (
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
