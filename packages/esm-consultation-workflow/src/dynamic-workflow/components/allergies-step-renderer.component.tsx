import { Button, IconButton } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { closeWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Allergy } from '../hooks/useAllergies';
import { StepComponentProps } from '../types';
import AllergiesSummaryCard from './allergies-summary-card.component';
import AllergiesSummaryTable from './allergies-summary-table.component';
import styles from './components.scss';
import { StepComponentHandle } from '../step-registry';

interface AllergiesActionMenuProps {
  allergy: Allergy;
  patientUuid?: string;
  onDelete: (allergyId: string) => void;
}

interface AllergiesStepRendererProps extends StepComponentProps {
  allergies: Allergy[];
  initiallyOpen: boolean;
}

const AllergiesStepRenderer = forwardRef<StepComponentHandle, AllergiesStepRendererProps>(
  ({ allergies, patientUuid, initiallyOpen }, ref) => {
    const { t } = useTranslation();
    const layout = useLayoutType();
    const isTablet = layout === 'tablet';
    const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
    const [currentAllergies, setCurrentAllergies] = useState(allergies ?? []);
    const [hasOpenedForm, setHasOpenedForm] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        onStepComplete() {
          return currentAllergies;
        },
      }),
      [currentAllergies],
    );

    const launchAllergiesForm = useCallback(
      () =>
        launchPatientWorkspace('patient-allergy-form-workspace', {
          closeWorkspaceWithSavedChanges: (data: Allergy) => {
            closeWorkspace('patient-allergy-form-workspace', {
              ignoreChanges: true,
              onWorkspaceClose: () => {
                setCurrentAllergies((prev) => [...prev, data]);
              },
            });
          },
        }),
      [],
    );

    const handleDelete = (allergyId: string) => {
      const updatedAllergies = currentAllergies.filter((allergy) => allergy.uuid !== allergyId);
      setCurrentAllergies(updatedAllergies);
    };

    useEffect(() => {
      if (currentAllergies.length < 1 && initiallyOpen && !hasOpenedForm) {
        launchAllergiesForm();
        setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
      }
    }, [hasOpenedForm, launchAllergiesForm, currentAllergies, initiallyOpen]);

    if (currentAllergies.length > 0) {
      return (
        <div>
          <Button renderIcon={Add} onClick={() => launchAllergiesForm()}>
            {t('adicionar', 'Adicionar')}
          </Button>
          {isTablet ? (
            <AllergiesSummaryTable
              patientUuid={patientUuid}
              allergies={currentAllergies}
              isTablet={isTablet}
              onDelete={handleDelete}
            />
          ) : (
            <AllergiesSummaryCard
              allergies={currentAllergies}
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
  },
);

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

AllergiesStepRenderer.displayName = 'AllergiesStepRenderer';

export default AllergiesStepRenderer;
