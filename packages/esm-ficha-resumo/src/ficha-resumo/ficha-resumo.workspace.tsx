import { showSnackbar, useSession } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FichaResumoForm, { type FichaResumoFormData } from './ficha-resumo-form.component';
import { createFichaResumo, updateFichaResumo, type FichaResumo } from './ficha-resumo.resource';

export interface FichaResumoWorkspaceProps extends DefaultPatientWorkspaceProps {
  fichaResumo: FichaResumo;
  // Called when the Ficha Resumo is created/updated.
  onChange;
}

const FichaResumoWorkspace: React.FC<FichaResumoWorkspaceProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  patientUuid,
  fichaResumo,
  onChange,
}) => {
  const { t } = useTranslation();
  const session = useSession();

  const update = async (data: FichaResumoFormData, dirtyFields: object) => {
    const abortController = new AbortController();
    try {
      await updateFichaResumo(patientUuid, fichaResumo, data, dirtyFields, abortController);
      onChange();
      closeWorkspaceWithSavedChanges();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        title: t('fichaResumoRecorded', 'Ficha Resumo gravada com sucesso'),
      });
    } catch (error) {
      console.error(error);
      showSnackbar({
        kind: 'error',
        title: t('fichaResumoSaveError', 'Erro ao gravar Ficha Resumo'),
        subtitle: error.message,
      });
    } finally {
      abortController.abort();
    }
  };

  const create = async (data: FichaResumoFormData) => {
    const abortController = new AbortController();
    try {
      await createFichaResumo(
        patientUuid,
        session?.sessionLocation?.uuid,
        session?.currentProvider?.uuid,
        data,
        abortController,
      );
      onChange();
      closeWorkspaceWithSavedChanges();
      showSnackbar({
        kind: 'success',
        isLowContrast: true,
        title: t('fichaResumoRecorded', 'Ficha Resumo gravada com sucesso'),
      });
    } catch (error) {
      console.error(error);
      showSnackbar({
        kind: 'error',
        title: t('fichaResumoSaveError', 'Erro ao gravar Ficha Resumo'),
        subtitle: error.message,
      });
    } finally {
      abortController.abort();
    }
  };

  return (
    <FichaResumoForm fichaResumo={fichaResumo} onSubmit={fichaResumo ? update : create} onDiscard={closeWorkspace} />
  );
};

export default FichaResumoWorkspace;
