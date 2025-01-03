import { Button, ButtonSet, InlineLoading } from '@carbon/react';
import { showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizard } from 'react-use-wizard';
import styles from './footer.scss';

type FooterProps = {
  closeWorkspace: () => void;
  closeWorkspaceWithSavedChanges: () => void;
};

const Footer: React.FC<FooterProps> = ({ closeWorkspace, closeWorkspaceWithSavedChanges }) => {
  const { previousStep, nextStep, isLastStep } = useWizard();
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const onClickNext = async () => {
    if (isLastStep) {
      setIsSubmitting(true);
      await sleep(1000);
      closeWorkspaceWithSavedChanges();
      showSnackbar({
        isLowContrast: true,
        kind: 'success',
        title: 'TODO',
        subtitle: t('consultationSaved', 'Clinical consultation saved successfully'),
      });
    } else {
      nextStep();
    }
  };

  return (
    <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
      <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
        {t('cancel', 'Cancel')}
      </Button>
      <Button className={styles.button} kind="tertiary" onClick={() => previousStep()}>
        <span>{t('previous', 'Previous')}</span>
      </Button>
      <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit" onClick={onClickNext}>
        {isSubmitting ? (
          <InlineLoading description={t('saving', 'Saving') + '...'} />
        ) : (
          <span>{isLastStep ? t('save', 'Save') : t('next', 'Next')}</span>
        )}
      </Button>
    </ButtonSet>
  );
};

export default Footer;
