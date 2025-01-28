import React from 'react';
import { StepComponentProps } from '../types';
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

interface MedicationsStepRendererProps extends StepComponentProps {}

const MedicationStepRenderer: React.FC<MedicationsStepRendererProps> = ({
  step,
  patientUuid,
  encounterUuid,
  encounterTypeUuid,
  onStepComplete,
}) => {
  const { orders, clearOrders } = useOrderBasket();
  const handleSave = () => {
    postNewOrders();
  };
  const session = useSession();
  const { t } = useTranslation();

  const postNewOrders = async () => {
    const abortController = new AbortController();
    try {
      await postOrdersOnNewEncounter(
        patientUuid,
        encounterTypeUuid,
        null, // todo: pass visit?
        session?.sessionLocation?.uuid,
        abortController,
      );

      //clearOrders();
      // todo: handle this later
      //await mutateOrders();
      showOrderSuccessToast(t, orders);
    } catch (e) {
      console.error(e);
      // todo: handle this later
      //   setCreatingEncounterError(
      //     e.responseBody?.error?.message ||
      //       t('tryReopeningTheWorkspaceAgain', 'Please try launching the workspace again'),
      //   );
    }
  };

  return (
    <div>
      <div>{<Button onClick={handleSave}>{'Save'}</Button>}</div>
      {<WidgetExtension patientUuid={patientUuid} stepId={step.id} extensionId="drug-order-panel" />}
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
    title: t('orderCompleted', 'Placed orders'),
    subtitle:
      (orderedString && `${t('ordered', 'Placed order for')} ${orderedString}. `) +
      (updatedString && `${t('updated', 'Updated')} ${updatedString}. `) +
      (discontinuedString && `${t('discontinued', 'Discontinued')} ${discontinuedString}.`),
  });
}
export default MedicationStepRenderer;
