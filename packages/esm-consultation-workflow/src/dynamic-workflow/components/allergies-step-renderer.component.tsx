import { closeWorkspace, useLayoutType, showModal } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace, ErrorState } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StepComponentProps } from '../types';
import { Allergy, useAllergies } from '../hooks/useAllergies';
import styles from './components.scss';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { Button, DataTableSkeleton, IconButton } from '@carbon/react';
import AllergiesSummaryCard from './allergies-summary-card.component';
import AllergiesSummaryTable from './allergies-summary-table.component';

interface allergiesActionMenuProps {
  allergy: Allergy;
  patientUuid?: string;
  mutate: () => void;
}

const AllergiesStepRenderer: React.FC<StepComponentProps> = ({ patientUuid, onStepComplete }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const { allergies, isLoading, error, mutate } = useAllergies(patientUuid);

  const launchAllergiesForm = useCallback(
    () =>
      launchPatientWorkspace('patient-allergy-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: any) => {
          closeWorkspace('patient-allergy-form-workspace', {
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
    return <ErrorState error={error} headerTitle={t('allergies', 'Allergies')} />;
  }

  if (allergies) {
    return (
      <div>
        <Button renderIcon={Add} onClick={() => launchAllergiesForm()}>
          {t('adicionar', 'Adicionar')}
        </Button>
        {isTablet ? (
          <AllergiesSummaryTable patientUuid={patientUuid} allergies={allergies} mutate={mutate} isTablet={isTablet} />
        ) : (
          <AllergiesSummaryCard allergies={allergies} isDesktop={isDesktop} patientUuid={patientUuid} mutate={mutate} />
        )}
      </div>
    );
  }

  return (
    <EmptyState displayText={t('allergies', 'Alergias')} headerTitle={''} launchForm={() => launchAllergiesForm()} />
  );
};

export const AllergiesActionMenu = ({ allergy, patientUuid, mutate }: allergiesActionMenuProps) => {
  const { t } = useTranslation();

  const launchEditAllergiesForm = useCallback(() => {
    launchPatientWorkspace('patient-allergy-form-workspace', {
      workspaceTitle: t('editAllergy', 'Edit an Allergy'),
      allergy,
      formContext: 'editing',
      closeWorkspaceWithSavedChanges: () => {
        closeWorkspace('patient-allergy-form-workspace', {
          ignoreChanges: true,
          onWorkspaceClose: () => {
            mutate();
          },
        });
      },
    });
  }, [allergy, t, mutate]);

  const launchDeleteAllergyDialog = (allergyId: string) => {
    const dispose = showModal('allergy-delete-confirmation-dialog', {
      closeDeleteModal: () => {
        dispose();
        mutate();
      },
      allergyId,
      patientUuid,
    });
  };

  return (
    <div className={styles.buttonWrapper}>
      <IconButton kind="ghost" label="Editar" onClick={launchEditAllergiesForm}>
        <Edit />
      </IconButton>
      <IconButton kind="ghost" label="Apagar" onClick={() => launchDeleteAllergyDialog(allergy.id)}>
        <TrashCan />
      </IconButton>
    </div>
  );
};

export default AllergiesStepRenderer;
