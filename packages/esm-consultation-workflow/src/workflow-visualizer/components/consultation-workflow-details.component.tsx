/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, Link, ActionableNotification, Tag } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import styles from './consultation-workflow-details.scss';
import { type ConsultationWorkflowData } from '../../hooks/useConsultationWorkflowData';
import AllergiesStepDisplay from './step-displays/allergies-step-display.component';
import { useConsultationWorkflow } from '../../hooks/useConsultationWorkflow';
import FormStepDisplay from './step-displays/form-step-display.component';
import ConditionsStepDisplay from './step-displays/conditions-step-display.component';
import { formatDate } from '@openmrs/esm-framework';
import RegimenDrugOrderStepDisplay from './step-displays/regimen-drug-order-step-display.component';
import { AppointmentsStepDisplay } from './step-displays';
import { useEncounters } from '../../hooks/useEncounters';

interface ConsultationWorkflowDetailsProps {
  workflow: ConsultationWorkflowData;
  patientUuid: string;
  onBackClick: () => void;
}

const ConsultationWorkflowDetails: React.FC<ConsultationWorkflowDetailsProps> = ({
  workflow,
  onBackClick,
  patientUuid,
}) => {
  const { t } = useTranslation();

  /* ------------------------------------------------------------------ */
  /*               Consult-workflow configuration (remote)              */
  /* ------------------------------------------------------------------ */
  const { consultationWorkflow, isLoadingConsultationWorkflow } = useConsultationWorkflow(
    workflow?.workflowConfig?.uuid,
  );

  /* ------------------------------------------------------------------ */
  /*                       Step ordering & selection                    */
  /* ------------------------------------------------------------------ */
  const steps = workflow.steps ?? [];

  const sortedSteps = useMemo(() => {
    if (!consultationWorkflow?.steps?.length) {
      return steps;
    }

    const orderMap = new Map(consultationWorkflow.steps.map((step, idx) => [step.id, idx]));

    return [...steps].sort(
      (a, b) =>
        (orderMap.get(a.stepId) ?? Number.MAX_SAFE_INTEGER) - (orderMap.get(b.stepId) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [steps, consultationWorkflow?.steps]);

  const [selectedTab, setSelectedTab] = useState<string>(() => steps[0]?.stepId ?? '');

  /* update selected tab whenever the step list changes */
  useEffect(() => {
    if (sortedSteps.length) {
      setSelectedTab(sortedSteps[0].stepId);
    }
  }, [sortedSteps]);

  /* ------------------------------------------------------------------ */
  /*                         Synchronisation OBS                        */
  /* ------------------------------------------------------------------ */
  const { data: encounters } = useEncounters(patientUuid, 'e936c643-bf3b-4955-8459-13ae5f192269');
  const obs = encounters
    .flatMap((enc) => enc.obs || [])
    .filter((o) => o?.concept?.uuid === 'e936c643-bf3b-4955-8459-13ae5f192269')[0];

  const getSyncronizationStatus = (statusUuid?: string): 'green' | 'red' | 'purple' | 'gray' => {
    if (!statusUuid) {
      return 'gray';
    }

    if (statusUuid.includes('feb94661-9f27-4a63-972f-39ebb63c7022')) {
      return 'green';
    }
    if (statusUuid.includes('e95e64a6-2383-4380-8565-e1ace2496315')) {
      return 'gray';
    }
    if (statusUuid.includes('9b9c21dc-e1fb-4cd9-a947-186e921fa78c')) {
      return 'red';
    }
    return 'gray';
  };

  /* ------------------------------------------------------------------ */
  /*                      Derived values (no hooks)                     */
  /* ------------------------------------------------------------------ */
  const completedSteps = sortedSteps.filter((s) => s.completed).length;
  const totalSteps = sortedSteps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const visitDate = workflow.dateCreated ? new Date(workflow.dateCreated) : null;

  /* ------------------------------------------------------------------ */
  /*                          Early UI returns                          */
  /* ------------------------------------------------------------------ */
  if (isLoadingConsultationWorkflow) {
    return <InlineLoading description={t('loadingWorkflow', 'Carregando fluxo…')} />;
  }

  if (totalSteps === 0) {
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
          <h4 className={styles.workflowTitle}>{workflow.workflowConfig?.name ?? t('unnamed', 'Sem nome')}</h4>
        </div>
        <div className={styles.emptyState}>{t('noStepsFound', 'Nenhuma etapa encontrada para este fluxo.')}</div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*                 Resolve appropriate display component              */
  /* ------------------------------------------------------------------ */
  const getStepComponent = (step) => {
    switch (step.renderType) {
      case 'allergies':
        return <AllergiesStepDisplay step={{ ...step, patientUuid: workflow.patientUuid }} />;
      case 'form':
        return (
          <FormStepDisplay
            step={{
              ...step,
              patientUuid: workflow.patientUuid,
            }}
          />
        );
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

  /* ------------------------------------------------------------------ */
  /*                               Render                               */
  /* ------------------------------------------------------------------ */
  return (
    <div className={styles.container}>
      {/* ---------- header ---------- */}
      <div className={styles.header}>
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          iconDescription={t('back', 'Voltar')}
          onClick={onBackClick}
          className={styles.backButton}>
          {t('back', 'Voltar')}
        </Button>
        <h4 className={styles.workflowTitle}>{workflow.workflowConfig?.name ?? t('unnamed', 'Sem nome')}</h4>
      </div>

      {/* ---------- summary card ---------- */}
      <div className={styles.summaryCard}>
        <div className={styles.summarySection}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('visitType', 'Tipo da visita')}:</span>
            <span className={styles.summaryValue}>{workflow.visit?.visitType?.display ?? '—'}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('location', 'Local')}:</span>
            <span className={styles.summaryValue}>{workflow.visit?.location?.display ?? '—'}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{t('dateTime', 'Data e Hora')}:</span>
            <span className={styles.summaryValue}>
              {visitDate ? formatDate(visitDate, { mode: 'wide', time: true }) : '—'}
            </span>
          </div>
        </div>

        <div className={styles.progressSection}>
          <span className={styles.progressLabel}>{t('progress', 'Progresso')}:</span>
          <span className={styles.progressValue}>
            {completedSteps}/{totalSteps} {t('stepsCompleted', 'etapas concluídas')}
          </span>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}>
              <span className={styles.progressText}>{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- sync status card ---------- */}
      {obs?.value && workflow.workflowConfig?.name?.toLowerCase().includes('consulta de admiss') && (
        <div className={styles.summaryCard}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>
              {t('syncronizationStateIdmed', 'Estado de Sincronização com iDMED')}:
            </span>
            <div>
              <Tag type={getSyncronizationStatus((obs.value as any).uuid)}>{(obs.value as any).display}</Tag>
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

      {/* ---------- workflow steps ---------- */}
      <div className={styles.sectionTitle}>{t('workflowSteps', 'Etapas do Fluxo')}</div>

      <div className={styles.workflowContent}>
        {/* ----- navigation ----- */}
        <nav className={styles.navContainer}>
          <ul className={styles.navList}>
            {sortedSteps.map((step, idx) => (
              <Link
                key={`${step.stepId}-${idx}`}
                className={`${styles.navItem} ${selectedTab === step.stepId ? styles.navItemActive : ''}`}
                onClick={() => setSelectedTab(step.stepId)}>
                <div className={styles.stepNumberContainer}>
                  <span className={styles.stepNumber}>{idx + 1}</span>
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

        {/* ----- step content ----- */}
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
