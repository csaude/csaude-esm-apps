import { showSnackbar } from '@openmrs/esm-framework';
import { type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { type TFunction } from 'react-i18next';

// Copied from patient-orders because it is not exported from patient-commons-lib
export function showOrderSuccessToast(t: TFunction, patientOrderItems: OrderBasketItem[]) {
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
