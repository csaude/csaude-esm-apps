import React, { useEffect, useRef } from 'react';
import { DrugOrderBasketItem, StepComponentProps } from '../types';
import WidgetExtension from './widget-extension.component';
import { Button } from '@carbon/react';
import {
  type DefaultPatientWorkspaceProps,
  type OrderBasketItem,
  postOrders,
  postOrdersOnNewEncounter,
  useOrderBasket,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, showModal, showSnackbar, useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { TFunction, useTranslation } from 'react-i18next';
import { prepMedicationOrderPostData } from '../api';
import { useWorkflow } from '../workflow-context';

interface MedicationsStepRendererProps extends StepComponentProps {
  onOrdersChange?: (orders: DrugOrderBasketItem[]) => void;
}
const MedicationStepRenderer: React.FC<MedicationsStepRendererProps> = ({
  patientUuid,
  encounterUuid,
  encounterTypeUuid,
  onStepComplete,
  onOrdersChange,
}) => {
  const { orders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
  const previousOrders = useRef<DrugOrderBasketItem[]>([]);
  const { getCurrentStep, state } = useWorkflow();
  const { t } = useTranslation();

  // Review this later, its a very expensive operation
  useEffect(() => {
    if (JSON.stringify(orders) !== JSON.stringify(previousOrders.current)) {
      previousOrders.current = orders;
      onOrdersChange?.(orders);
    }
  }, [orders, onOrdersChange]);

  const handleSave = () => {
    onStepComplete(orders);
  };

  return (
    <div>
      {<WidgetExtension patientUuid={patientUuid} stepId={getCurrentStep().id} extensionId="drug-order-panel" />}
    </div>
  );
};
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
export default MedicationStepRenderer;
