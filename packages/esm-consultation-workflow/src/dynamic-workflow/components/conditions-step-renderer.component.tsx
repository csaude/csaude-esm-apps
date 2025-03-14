import { closeWorkspace, useLayoutType, formatDate, parseDate, showModal } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useMemo } from 'react';
import { type StepComponentProps } from '../types';
import { useTranslation } from 'react-i18next';
import { Condition, useConditions } from '../hooks/useConditions';
import styles from './components.scss';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { Button, DataTableSkeleton, IconButton } from '@carbon/react';
import ConditionsSummaryTable from './conditions-summary-table.component';
import ConditionsSummaryCard from './conditions-summary-card.component';

interface ConditionsActionMenuProps {
  condition: Condition;
  patientUuid?: string;
  mutate: () => void;
}

const ConditionsStepRenderer: React.FC<StepComponentProps> = ({ patientUuid, onStepComplete }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const { conditions, error, isLoading, mutate } = useConditions(patientUuid);

  const launchConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: any) => {
          closeWorkspace('conditions-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              mutate();
              onStepComplete(data);
            },
          });
        },
      }),
    [onStepComplete, mutate],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('conditions', 'Conditions')} />;
  }

  if (conditions) {
    return (
      <div>
        <Button renderIcon={Add} onClick={() => launchConditionsForm()}>
          {t('adicionar', 'Adicionar')}
        </Button>
        {isTablet ? (
          <ConditionsSummaryTable patientUuid={patientUuid} conditions={conditions} mutate={mutate} />
        ) : (
          <ConditionsSummaryCard
            patientUuid={patientUuid}
            conditions={conditions}
            mutate={mutate}
            isDesktop={isDesktop}
          />
        )}
      </div>
    );
  }

  return (
    <EmptyState displayText={t('conditions', 'Condições')} headerTitle={''} launchForm={() => launchConditionsForm()} />
  );
};

export const ConditionsActionMenu = ({ condition, patientUuid, mutate }: ConditionsActionMenuProps) => {
  const { t } = useTranslation();

  const launchEditConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        workspaceTitle: t('editCondition', 'Editar Condição'),
        condition,
        formContext: 'editing',
        closeWorkspaceWithSavedChanges: () => {
          closeWorkspace('conditions-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              mutate();
            },
          });
        },
      }),
    [condition, t, mutate],
  );

  const launchDeleteConditionDialog = (conditionId: string) => {
    const dispose = showModal('condition-delete-confirmation-dialog', {
      closeDeleteModal: () => {
        dispose();
        mutate();
      },
      conditionId,
      patientUuid,
    });
  };

  return (
    <div className={styles.buttonWrapper}>
      <IconButton kind="ghost" label="Editar" onClick={launchEditConditionsForm}>
        <Edit />
      </IconButton>
      <IconButton kind="ghost" label="Apagar" onClick={() => launchDeleteConditionDialog(condition.id)}>
        <TrashCan />
      </IconButton>
    </div>
  );
};

export default ConditionsStepRenderer;
