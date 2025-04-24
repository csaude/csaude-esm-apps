import { Button, IconButton } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { closeWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Condition, FHIRCondition, mapConditionProperties } from '../hooks/useConditions';
import { type StepComponentProps } from '../types';
import { useWorkflow } from '../workflow-context';
import styles from './components.scss';
import ConditionsSummaryCard from './conditions-summary-card.component';
import ConditionsSummaryTable from './conditions-summary-table.component';

interface ConditionsActionMenuProps {
  condition: Condition;
  patientUuid?: string;
  onEdit: (condition: Condition) => void;
  onDelete: (conditionId: string) => void;
}

interface ConditionsStepRendererProps extends StepComponentProps {
  stepId: string;
}

const ConditionsStepRenderer: React.FC<ConditionsStepRendererProps> = ({
  stepId,
  patientUuid,
  onStepComplete,
  onStepDataChange,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const { state } = useWorkflow();
  const conditions = useMemo<Condition[]>(() => state.stepsData[stepId]?.conditions ?? [], [state, stepId]);
  const [hasOpenedForm, setHasOpenedForm] = useState(false);

  const launchConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: FHIRCondition) => {
          closeWorkspace('conditions-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              conditions.push(mapConditionProperties(data));
              onStepDataChange(conditions);
            },
          });
        },
      }),
    [onStepDataChange, conditions],
  );

  const handleDelete = (conditionId: string) => {
    const updatedConditions = conditions.filter((condition) => condition.id !== conditionId);
    onStepDataChange(updatedConditions);
  };

  const handleEdit = (condition: Condition) => {
    const index = conditions.findIndex((c) => c.id === condition.id);
    if (index > -1) {
      conditions.splice(index, 1, condition);
    }
    onStepDataChange(conditions);
  };

  useEffect(() => {
    const stepInitiallyOpen = state.config.steps.find((step) => step.id === stepId)?.initiallyOpen;
    if (conditions.length < 1 && stepInitiallyOpen && !hasOpenedForm) {
      launchConditionsForm();
      setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
    }
  }, [state, stepId, hasOpenedForm, launchConditionsForm, conditions]);

  if (conditions.length > 0) {
    return (
      <div>
        <Button renderIcon={Add} onClick={() => launchConditionsForm()}>
          {t('adicionar', 'Adicionar')}
        </Button>
        {isTablet ? (
          <ConditionsSummaryTable
            patientUuid={patientUuid}
            conditions={conditions}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <ConditionsSummaryCard
            patientUuid={patientUuid}
            conditions={conditions}
            onEdit={handleEdit}
            onDelete={handleDelete}
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

export const ConditionsActionMenu = ({ condition, patientUuid, onEdit, onDelete }: ConditionsActionMenuProps) => {
  const { t } = useTranslation();

  const launchEditConditionsForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        workspaceTitle: t('editCondition', 'Editar Condição'),
        condition,
        formContext: 'editing',
        closeWorkspaceWithSavedChanges: (condition: FHIRCondition) => {
          closeWorkspace('conditions-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              onEdit(mapConditionProperties(condition));
            },
          });
        },
      }),
    [t, condition, onEdit],
  );

  const launchDeleteConditionDialog = (conditionId: string) => {
    const dispose = showModal('condition-delete-confirmation-dialog', {
      closeDeleteModal: () => {
        onDelete(conditionId);
        dispose();
      },
      conditionId,
      patientUuid,
    });
  };

  return (
    <div className={styles.buttonWrapper}>
      <IconButton kind="ghost" label="Editar" align="left" onClick={launchEditConditionsForm}>
        <Edit />
      </IconButton>
      <IconButton kind="ghost" label="Apagar" align="left" onClick={() => launchDeleteConditionDialog(condition.id)}>
        <TrashCan />
      </IconButton>
    </div>
  );
};

export default ConditionsStepRenderer;
