import { Button, ButtonSet, InlineLoading } from '@carbon/react';
import { showToast, useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWizard } from 'react-use-wizard';
import { SET_CURRENT_STEP, useWorkflow } from './dynamic-workflow/workflow-context';
import styles from './footer.scss';

type FooterProps = {
  onSave: () => void;
  onCancel: () => void;
  /**
   * @returns Promise indicating whether to continue to the next step
   */
  onNextClick: (activeStep: number) => Promise<boolean>;
};

const Footer: React.FC<FooterProps> = ({ onCancel, onSave, onNextClick }) => {
  const { previousStep, nextStep, goToStep, isLastStep, activeStep } = useWizard();
  const { state, dispatch, onComplete } = useWorkflow();
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClickNext = async () => {
    const shouldContinue = await onNextClick(activeStep);
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
    const incompleteSteps = workflow.steps.filter((step) => !state.completedSteps.has(step.id) && !step.skippable);
    const stepsWithOrders = workflow.steps.filter((step) => {
      const stepData = state.stepsData[step.id];
      return ['medications', 'orders', 'tests'].includes(step.renderType) && stepData?.length > 0;
    });

    if (incompleteSteps.length > 0) {
      showToast({
        title: t('warning', 'Warning!'),
        kind: 'warning',
        critical: true,
        description: t(
          'incompleteSteps',
          'Existem passos incompletos. Por favor, conclua todos os passos antes de salvar..',
        ),
      });

      // navigate to the first incomplete step
      const firstIncompleteStep = incompleteSteps[0];
      const firstIncompleteStepIndex = workflow.steps.findIndex((step) => step.id === firstIncompleteStep.id);
      dispatch({ type: SET_CURRENT_STEP, payload: firstIncompleteStepIndex });
      goToStep(firstIncompleteStepIndex);
      setIsSubmitting(false);
      return;
    }

    const incompleteOrderSteps = stepsWithOrders.filter((step) => !state.completedSteps.has(step.id));
    if (incompleteOrderSteps.length > 0) {
      showToast({
        title: t('warning', 'Warning!'),
        kind: 'warning',
        critical: true,
        description: t(
          'incompleteOrderSteps',
          'Existem pedidos incompletos. Por favor, conclua todos os pedidos antes de continuar.',
        ),
      });
      return;
    }

    onSave();
    setIsSubmitting(false);
    onComplete();
    showToast({
      title: t('success', 'Sucesso!'),
      kind: 'success',
      description: t('workflowCompletedSuccessfully', 'Fluxo concluído com sucesso.'),
    });
  };

  return (
    <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
      <Button className={styles.button} kind="secondary" onClick={onCancel}>
        {t('cancel', 'Cancelar')}
      </Button>
      <Button className={styles.button} kind="tertiary" onClick={() => previousStep()}>
        <span>{t('previous', 'Anterior')}</span>
      </Button>
      <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit" onClick={onClickNext}>
        {isSubmitting ? (
          <InlineLoading description={t('saving', 'A salvar') + '...'} />
        ) : (
          <span>{isLastStep ? t('save', 'Salvar') : t('next', 'Próximo')}</span>
        )}
      </Button>
    </ButtonSet>
  );
};

export default Footer;
