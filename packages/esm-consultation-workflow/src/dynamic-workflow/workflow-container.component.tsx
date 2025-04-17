import { Button, ButtonSet, InlineLoading } from '@carbon/react';
import { Encounter, openmrsFetch, restBaseUrl, showToast, useLayoutType } from '@openmrs/esm-framework';
import { Order, postOrders, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrderEncounter } from './api';
import { showOrderSuccessToast } from './helpers';
import stepRegistry from './step-registry';
import { DrugOrderBasketItem, WorkflowState, WorkflowStep } from './types';
import styles from './workflow-container.scss';
import {
  COMPLETE_STEP,
  GO_TO_NEXT_STEP,
  GO_TO_PREVIOUS_STEP,
  GO_TO_STEP,
  UPDATE_STEP_DATA,
  useWorkflow,
  workflowReducer,
} from './workflow-context';
import { saveWorkflowData } from './workflow.resource';

const WorkflowContainer: React.FC = () => {
  const { state, dispatch, onCancel, onComplete } = useWorkflow();
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const { encounterUuid } = useOrderEncounter(state.patientUuid);
  const { orders } = useOrderBasket<DrugOrderBasketItem>();
  const isTablet = useLayoutType() === 'tablet';

  const handleStepDataChange = useCallback(
    (stepId: string, data: any) => {
      setCurrentStepData((prev) => ({
        ...prev,
        [stepId]: data,
      }));
      dispatch({
        type: UPDATE_STEP_DATA,
        payload: {
          stepId,
          data,
        },
      });
    },
    [dispatch],
  );

  const renderStep = useCallback(
    (step: WorkflowStep) => {
      const StepComponent = stepRegistry[step.renderType];

      return StepComponent ? (
        <StepComponent
          step={step}
          patientUuid={state.patientUuid}
          handleStepComplete={() => {
            throw new Error('For now all steps should be handled in WorkflowContainer');
          }}
          onStepDataChange={handleStepDataChange}
        />
      ) : null;
    },
    [state, handleStepDataChange],
  );

  const handleNextClick = async () => {
    const activeStep = state.currentStepIndex;
    const currentStep = state.visibleSteps[activeStep];

    let data: object;
    if (currentStep) {
      // TODO refactor this
      // Doing this because the medication step has no completion button
      const stepData = currentStepData[currentStep.id];
      if (currentStep.renderType === 'medications' && orders.length > 0) {
        const incompleteOrders = stepData?.filter((item: DrugOrderBasketItem) => {
          return item.isOrderIncomplete;
        });

        if (incompleteOrders?.length > 0) {
          showToast({
            title: t('warning', 'Atenção!'),
            kind: 'warning',
            critical: true,
            description: t(
              'incompleteOrders',
              'You have incomplete orders. Please complete all orders before proceeding.',
            ),
          });
          return false;
        }

        try {
          const abortController = new AbortController();
          const erroredItems = await postOrders(encounterUuid, abortController);
          if (orders.length > 0 && erroredItems.length == 0) {
            showOrderSuccessToast(t, orders);
          } else {
            // Try to find the steps that have errored items and set them as incomplete
            // setOrdersWithErrors(erroredItems);
          }
          const representation = 'custom:(orders:(uuid,display,drug:(uuid,display)))';
          const { data: encounter } = await openmrsFetch<Encounter>(
            `${restBaseUrl}/encounter/${encounterUuid}?v=${representation}`,
          );
          const orderBasketDrugs = orders.map((o) => o.drug.uuid);
          const savedOrders = encounter.orders.filter((encounterOrder) =>
            orderBasketDrugs.includes(encounterOrder.drug.uuid),
          );
          data = {
            encounter: encounterUuid,
            orders: savedOrders.map((o: Order) => o.uuid),
            stepId: currentStep.id,
            stepName: currentStep.title,
            renderType: currentStep.renderType,
          };
        } catch (error) {
          showToast({ kind: 'error', description: error.message });
          return;
        }
      }
      if (currentStep.renderType === 'allergies' && stepData?.allergies) {
        data = {
          allergies: stepData?.allergies,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }
      if (currentStep.renderType === 'appointments' && stepData?.appointments) {
        data = {
          appointments: stepData?.appointments,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }
      if (currentStep.renderType === 'conditions' && stepData?.conditions) {
        data = {
          conditions: stepData?.conditions,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }
      if (currentStep.renderType === 'form' && stepData?.uuid) {
        data = {
          ...stepData,
          stepId: currentStep.id,
          stepName: currentStep.title,
          renderType: currentStep.renderType,
        };
      }

      if (state.isLastStep) {
        const finalState = data
          ? workflowReducer(state, { type: COMPLETE_STEP, payload: currentStep.id, data })
          : state;
        await handleSave(finalState);
        return;
      }

      if (data) {
        dispatch({ type: COMPLETE_STEP, payload: currentStep.id, data });
      } else {
        dispatch({ type: GO_TO_NEXT_STEP });
      }
    }
  };

  const handleSave = async (finalState: WorkflowState) => {
    try {
      setSubmitting(true);
      const workflow = finalState.config;
      const incompleteSteps = workflow.steps.filter((step) => !finalState.completedSteps.has(step.id));

      if (incompleteSteps.length > 0) {
        showToast({
          title: t('warning', 'Warning!'),
          kind: 'warning',
          critical: true,
          description: t(
            'incompleteSteps',
            'Existem passos incompletos. Por favor, conclua todos os passos antes de salvar.',
          ),
        });
        // navigate to the first incomplete step
        const firstIncompleteStep = incompleteSteps[0];
        const firstIncompleteStepIndex = workflow.steps.findIndex((step) => step.id === firstIncompleteStep.id);
        dispatch({ type: GO_TO_STEP, payload: firstIncompleteStepIndex });
        return;
      }

      const incompleteOrderSteps = workflow.steps.filter((step) => {
        return ['medications', 'orders', 'tests'].includes(step.renderType) && !finalState.completedSteps.has(step.id);
      });
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

      await saveWorkflowData(finalState, new AbortController());
      onComplete();
      showToast({
        title: t('success', 'Sucesso!'),
        kind: 'success',
        description: t('workflowCompletedSuccessfully', 'Fluxo concluído com sucesso.'),
      });
    } catch (error) {
      showToast({
        title: t('error', 'Error!'),
        kind: 'error',
        critical: true,
        description: error.message,
      });
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    dispatch({ type: GO_TO_PREVIOUS_STEP });
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {state.visibleSteps.length > 0
          ? renderStep(state.visibleSteps[state.currentStepIndex])
          : t('noVisibleSteps', 'Não existem passos visiveis.')}
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancelar')}
        </Button>
        <Button
          className={styles.button}
          kind="tertiary"
          onClick={handleBackClick}
          disabled={state.visibleSteps.length === 0}>
          <span>{t('previous', 'Anterior')}</span>
        </Button>
        <Button
          className={styles.button}
          disabled={isSubmitting || state.visibleSteps.length === 0}
          kind="primary"
          type="submit"
          onClick={handleNextClick}>
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'A salvar') + '...'} />
          ) : (
            <span>{state.isLastStep ? t('save', 'Salvar') : t('next', 'Próximo')}</span>
          )}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default WorkflowContainer;
