import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { DrugOrderBasketItem, StepComponentProps } from '../types';
import WidgetExtension from './widget-extension.component';
import { Button } from '@carbon/react';
import {
  type DefaultPatientWorkspaceProps,
  Order,
  type OrderBasketItem,
  postOrders,
  postOrdersOnNewEncounter,
  useOrderBasket,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import {
  Encounter,
  ExtensionSlot,
  openmrsFetch,
  restBaseUrl,
  showModal,
  showSnackbar,
  showToast,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { TFunction, useTranslation } from 'react-i18next';
import { prepMedicationOrderPostData, useOrderEncounter } from '../api';
import { useWorkflow } from '../workflow-context';
import { StepComponentHandle } from '../step-registry';

interface MedicationsStepRendererProps extends StepComponentProps {
  onOrdersChange?: (orders: DrugOrderBasketItem[]) => void;
}
const MedicationStepRenderer = forwardRef<StepComponentHandle, MedicationsStepRendererProps>(
  ({ patientUuid, encounterTypeUuid, onOrdersChange }, ref) => {
    const { orders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
    const previousOrders = useRef<DrugOrderBasketItem[]>([]);
    const { getCurrentStep } = useWorkflow();
    const { t } = useTranslation();
    const { encounterUuid } = useOrderEncounter(patientUuid);

    // Review this later, its a very expensive operation
    useEffect(() => {
      if (JSON.stringify(orders) !== JSON.stringify(previousOrders.current)) {
        previousOrders.current = orders;
        onOrdersChange?.(orders);
      }
    }, [orders, onOrdersChange]);

    useImperativeHandle(
      ref,
      () => ({
        async onStepComplete() {
          if (orders.length > 0) {
            const incompleteOrders = orders?.filter((o) => o.isOrderIncomplete);
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
              return;
            }

            const abortController = new AbortController();
            const erroredItems = await postOrders(encounterUuid, abortController);
            if (erroredItems.length === 0) {
              showOrderSuccessToast(t, orders);
            }

            const rep = 'custom:(orders:(uuid,display,drug:(uuid,display)))';
            const { data: encounter } = await openmrsFetch<Encounter>(
              `${restBaseUrl}/encounter/${encounterUuid}?v=${rep}`,
            );

            const orderBasketDrugs = orders.map((o) => o.drug.uuid);
            const savedOrders = encounter.orders.filter((encounterOrder) =>
              orderBasketDrugs.includes(encounterOrder.drug.uuid),
            );

            return {
              encounter: encounterUuid,
              orders: savedOrders.map((o: Order) => o.uuid),
            };
          }
          return undefined;
        },
      }),
      [encounterUuid, orders, t],
    );

    return (
      <div>
        {<WidgetExtension patientUuid={patientUuid} stepId={getCurrentStep().id} extensionId="drug-order-panel" />}
      </div>
    );
  },
);
function showOrderSuccessToast(t: TFunction, patientOrderItems: OrderBasketItem[]) {
  const orderedString = patientOrderItems
    .filter((item) => ['NEW', 'RENEW'].includes(item.action))
    .map((item) => item.display)
    .join(', ');
  const updatedString = patientOrderItems
    .filter((item) => item.action === 'REVISE')
    .map((item) => item.display)
    .join(', ');
  const discontinuedString = patientOrderItems
    .filter((item) => item.action === 'DISCONTINUE')
    .map((item) => item.display)
    .join(', ');

  showSnackbar({
    isLowContrast: true,
    kind: 'success',
    title: t('orderCompleted', 'Pedidos feitos'),
    subtitle:
      (orderedString && `${t('ordered', 'Pedido feito para')} ${orderedString}. `) +
      (updatedString && `${t('updated', 'Atualizado')} ${updatedString}. `) +
      (discontinuedString && `${t('discontinued', 'Descontinuado')} ${discontinuedString}.`),
  });
}

MedicationStepRenderer.displayName = 'MedicationStepRenderer';

export default MedicationStepRenderer;
