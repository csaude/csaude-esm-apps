import { Button, IconButton } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { closeWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Allergy } from '../hooks/useAllergies';
import { StepComponentProps } from '../types';
import { useWorkflow } from '../workflow-context';
import AllergiesSummaryCard from './allergies-summary-card.component';
import AllergiesSummaryTable from './allergies-summary-table.component';
import styles from './components.scss';

interface AllergiesActionMenuProps {
  allergy: Allergy;
  patientUuid?: string;
  onDelete: (allergyId: string) => void;
}

interface AllergiesStepRendererProps extends StepComponentProps {
  stepId: string;
}

const AllergiesStepRenderer: React.FC<AllergiesStepRendererProps> = ({
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
  const allergies = useMemo<Allergy[]>(() => state.stepsData[stepId]?.allergies ?? [], [state, stepId]);
  const [hasOpenedForm, setHasOpenedForm] = useState(false);

  const launchAllergiesForm = useCallback(
    () =>
      launchPatientWorkspace('patient-allergy-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: Allergy) => {
          closeWorkspace('patient-allergy-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              allergies.push(data);
              onStepDataChange(allergies);
            },
          });
        },
      }),
    [onStepDataChange, allergies],
  );

  const handleDelete = (allergyId: string) => {
    const updatedAllergies = allergies.filter((allergy) => allergy.uuid !== allergyId);
    onStepDataChange(updatedAllergies);
  };

  useEffect(() => {
    const stepInitiallyOpen = state.config.steps.find((step) => step.id === stepId)?.initiallyOpen;
    if (allergies.length < 1 && stepInitiallyOpen && !hasOpenedForm) {
      launchAllergiesForm();
      setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
    }
  }, [state, stepId, hasOpenedForm, launchAllergiesForm, allergies]);

  if (allergies.length > 0) {
    return (
      <div>
        <Button renderIcon={Add} onClick={() => launchAllergiesForm()}>
          {t('adicionar', 'Adicionar')}
        </Button>
        {isTablet ? (
          <AllergiesSummaryTable
            patientUuid={patientUuid}
            allergies={allergies}
            isTablet={isTablet}
            onDelete={handleDelete}
          />
        ) : (
          <AllergiesSummaryCard
            allergies={allergies}
            isDesktop={isDesktop}
            patientUuid={patientUuid}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
  }

  return (
    <EmptyState displayText={t('allergies', 'Alergias')} headerTitle={''} launchForm={() => launchAllergiesForm()} />
  );
};

export const AllergiesActionMenu = ({ allergy, patientUuid, onDelete }: AllergiesActionMenuProps) => {
  const { t } = useTranslation();

  const launchEditAllergiesForm = useCallback(
    () =>
      launchPatientWorkspace('patient-allergy-form-workspace', {
        workspaceTitle: t('editAllergy', 'Edit an Allergy'),
        allergy,
        formContext: 'editing',
        closeWorkspace: () => {
          closeWorkspace('patient-allergy-form-workspace', {
            ignoreChanges: true,
          });
        },
      }),
    [t, allergy],
  );

  const launchDeleteAllergyDialog = (allergyId: string) => {
    const dispose = showModal('allergy-delete-confirmation-dialog', {
      closeDeleteModal: () => {
        onDelete(allergyId);
        dispose();
      },
      allergyId,
      patientUuid,
    });
  };

  return (
    <div className={styles.buttonWrapper}>
      <IconButton kind="ghost" label="Editar" align="left" onClick={launchEditAllergiesForm}>
        <Edit />
      </IconButton>
      <IconButton kind="ghost" label="Apagar" align="left" onClick={() => launchDeleteAllergyDialog(allergy.uuid)}>
        <TrashCan />
      </IconButton>
    </div>
  );
};

export default AllergiesStepRenderer;
