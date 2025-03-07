import { InlineLoading } from '@carbon/react';
import { closeWorkspace, ErrorState } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

function useOrders(patientUuid: string) {
  return {
    isLoading: false,
    error: null,
    orders: [],
    mutate: () => {},
  };
}

function launchOrdersWorkspace({ onOrderSave }: { onOrderSave: () => void }): void {
  const name = 'order-basket';
  launchPatientWorkspace(name, {
    closeWorkspaceWithSavedChanges: () => {
      closeWorkspace(name, { ignoreChanges: true, onWorkspaceClose: onOrderSave });
    },
  });
}

const OrdersStep: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isLoading, error, orders, mutate } = useOrders(patientUuid);

  if (isLoading) {
    return <InlineLoading />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle="Erro!" />;
  }

  if (!orders.length) {
    return (
      <EmptyState
        displayText={t('orders', 'Pedidos')}
        headerTitle={t('orders', 'Pedidos')}
        launchForm={() => launchOrdersWorkspace({ onOrderSave: mutate })}
      />
    );
  }

  return <h1>Pedidos laboratoriais</h1>;
};

export default OrdersStep;
