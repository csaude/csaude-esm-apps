import React, { useEffect, useState } from 'react';
import { Button, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from '../dynamic-workflow.scss';
import { CloseWorkspaceOptions } from '@openmrs/esm-framework';

interface Props {
  closeWorkspace: (closeWorkspaceOptions?: CloseWorkspaceOptions) => void;
}

const WorkflowError = ({ closeWorkspace }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={styles.errorContainer}>
      <div className={styles.formErrorCard}>
        <p className={styles.errorTitle}>{t('errorTitle', 'There was an error with this workflow')}</p>
        <div className={styles.errorMessage}>
          <span>{t('workflowErrorMessage', 'Tente abrir outro workflow')}</span>
        </div>
        <div className={styles.separator}>{t('or', 'ou')}</div>
        <Button onClick={closeWorkspace} kind="ghost">
          {t('closeThisPanel', 'Fechar este painel')}
        </Button>
      </div>
    </div>
  );
};

export default WorkflowError;
