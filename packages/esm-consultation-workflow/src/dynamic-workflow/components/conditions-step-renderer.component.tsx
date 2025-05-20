import { Button, IconButton } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { closeWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Condition, type FHIRCondition, mapConditionProperties } from '../hooks/useConditions';
import { type StepComponentProps } from '../types';
import styles from './components.scss';
import ConditionsSummaryCard from './conditions-summary-card.component';
import ConditionsSummaryTable from './conditions-summary-table.component';
import { type StepComponentHandle } from '../step-registry';

interface ConditionsActionMenuProps {
  condition: Condition;
  patientUuid?: string;
  onEdit: (condition: Condition) => void;
  onDelete: (conditionId: string) => void;
}

interface ConditionsStepRendererProps extends StepComponentProps {
  conditions: Condition[];
  initiallyOpen: boolean;
}

const ConditionsStepRenderer = forwardRef<StepComponentHandle, ConditionsStepRendererProps>(
  ({ patientUuid, conditions, initiallyOpen }, ref) => {
    const { t } = useTranslation();
    const layout = useLayoutType();
    const isTablet = layout === 'tablet';
    const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
    const [currentConditions, setCurrentConditions] = useState(conditions ?? []);
    const [hasOpenedForm, setHasOpenedForm] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        onStepComplete() {
          return { conditions: currentConditions };
        },
      }),
      [currentConditions],
    );

    const launchConditionsForm = useCallback(
      () =>
        launchPatientWorkspace('conditions-form-workspace', {
          closeWorkspaceWithSavedChanges: (data: FHIRCondition) => {
            closeWorkspace('conditions-form-workspace', {
              ignoreChanges: true,
              onWorkspaceClose: () => {
                setCurrentConditions((prev) => [...prev, mapConditionProperties(data)]);
              },
            });
          },
        }),
      [],
    );

    const handleDelete = (conditionId: string) => {
      const updatedConditions = currentConditions.filter((condition) => condition.id !== conditionId);
      setCurrentConditions(updatedConditions);
    };

    const handleEdit = (condition: Condition) => {
      const index = currentConditions.findIndex((c) => c.id === condition.id);
      if (index > -1) {
        currentConditions.splice(index, 1, condition);
      }
      setCurrentConditions(currentConditions);
    };

    useEffect(() => {
      if (currentConditions.length < 1 && initiallyOpen && !hasOpenedForm) {
        launchConditionsForm();
        setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
      }
    }, [currentConditions, initiallyOpen, hasOpenedForm, launchConditionsForm]);

    if (currentConditions.length > 0) {
      return (
        <div>
          <Button renderIcon={Add} onClick={() => launchConditionsForm()}>
            {t('adicionar', 'Adicionar')}
          </Button>
          {isTablet ? (
            <ConditionsSummaryTable
              patientUuid={patientUuid}
              conditions={currentConditions}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ) : (
            <ConditionsSummaryCard
              patientUuid={patientUuid}
              conditions={currentConditions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDesktop={isDesktop}
            />
          )}
        </div>
      );
    }

    return (
      <EmptyState
        displayText={t('conditions', 'Condições')}
        headerTitle={''}
        launchForm={() => launchConditionsForm()}
      />
    );
  },
);

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
