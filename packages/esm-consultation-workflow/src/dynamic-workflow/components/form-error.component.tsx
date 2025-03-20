import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { clinicalFormsWorkspace, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import styles from './form-error.scss';

interface FormErrorProps {
  closeWorkspace: () => void;
  clinicalFormsWorkspaceName?: string;
}

const FormError: React.FC<FormErrorProps> = ({
  closeWorkspace,
  clinicalFormsWorkspaceName = clinicalFormsWorkspace,
}) => {
  const { t } = useTranslation();

  const handleOpenFormList = () => {
    closeWorkspace();
    launchPatientWorkspace(clinicalFormsWorkspaceName);
  };

  return (
    <div className={styles.errorContainer}>
      <div className={styles.formErrorCard}>
        <p className={styles.errorTitle}>{t('errorTitle', 'There was an error with this form')}</p>
        <div className={styles.errorMessage}>
          <span>{t('tryAgainMessage', 'Tente abrir outro formulário')}</span>
          <span className={styles.list} role="button" tabIndex={0} onClick={handleOpenFormList}>
            {t('thisList', 'esta lista')}
          </span>
        </div>
        <div className={styles.separator}>{t('or', 'ou')}</div>
        <Button onClick={closeWorkspace} kind="ghost">
          {t('closeThisPanel', 'Fechar este painel')}
        </Button>
      </div>
    </div>
  );
};

export default FormError;
