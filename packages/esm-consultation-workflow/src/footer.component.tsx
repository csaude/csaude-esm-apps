import { Button, ButtonSet, InlineLoading } from '@carbon/react';
import { showSnackbar, showToast, useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizard } from 'react-use-wizard';
import styles from './footer.scss';
import { SET_CURRENT_STEP, useWorkflow } from './dynamic-workflow/workflow-context';
import { postOrders, useOrderBasket } from '@openmrs/esm-patient-common-lib/src';
import { useOrderEncounter } from './dynamic-workflow/api';
import { showOrderSuccessToast } from './dynamic-workflow/helpers';

type FooterProps = {
  onSave: () => void;
  onCancel: () => void;
  onNextClick: (activeStep: number) => boolean;
};

const Footer: React.FC<FooterProps> = ({ onCancel, onSave, onNextClick }) => {
  const { previousStep, nextStep, goToStep, isLastStep, activeStep } = useWizard();
  const { state, dispatch, onComplete } = useWorkflow();
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { encounterUuid } = useOrderEncounter(state.patientUuid);
  const { orders, clearOrders } = useOrderBasket();

  const onClickNext = () => {
    const shouldContinue = onNextClick(activeStep);
    if (!shouldContinue) {
      return;
    }
    if (isLastStep) {
      handleSave();
    } else {
      nextStep();
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const workflow = state.config;
    const incompleteSteps = workflow.steps.filter((step) => !state.completedSteps.has(step.id));
    const stepsWithOrders = workflow.steps.filter((step) => {
      const stepData = state.stepsData[step.id];
      return ['medications', 'orders', 'tests'].includes(step.renderType) && stepData?.length > 0;
    });

    if (incompleteSteps.length > 0) {
      showToast({
        title: t('warning', 'Warning!'),
        kind: 'warning',
        critical: true,
        description: t('incompleteSteps', 'You have incomplete steps. Please complete all steps before saving.'),
      });

      // navigate to the first incomplete step
      const firstIncompleteStep = incompleteSteps[0];
      const firstIncompleteStepIndex = workflow.steps.findIndex((step) => step.id === firstIncompleteStep.id);
      dispatch({ type: SET_CURRENT_STEP, payload: firstIncompleteStepIndex });
      goToStep(firstIncompleteStepIndex);
      setIsSubmitting(false);
      return;
    }

    const abortController = new AbortController();

    const erroredItems = await postOrders(encounterUuid, abortController);
    clearOrders({ exceptThoseMatching: (item) => erroredItems.map((e) => e.display).includes(item.display) });
    if (erroredItems.length == 0) {
      showOrderSuccessToast(t, orders);
    } else {
      // Try to find the steps that have errored items and set them as incomplete
      // setOrdersWithErrors(erroredItems);
    }
    const incompleteOrderSteps = stepsWithOrders.filter((step) => !state.completedSteps.has(step.id));
    if (incompleteOrderSteps.length > 0) {
      showToast({
        title: t('warning', 'Warning!'),
        kind: 'warning',
        critical: true,
        description: t('incompleteOrderSteps', 'Please complete all steps with orders before saving.'),
      });
      return;
    }

    onSave();
    setIsSubmitting(false);
    onComplete();
    showToast({
      title: t('success', 'Success!'),
      kind: 'success',
      description: t('workflowCompletedSuccessfully', 'Workflow completed successfully.'),
    });
  };

  return (
    <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
      <Button className={styles.button} kind="secondary" onClick={onCancel}>
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
