import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper,
  Tag,
} from '@carbon/react';
import { type Encounter, ErrorState, openmrsFetch, type OpenmrsResource } from '@openmrs/esm-framework';
import { EmptyState, type Order } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import {
  ART_CHANGE_JUSTIFICATION_CONCEPT,
  CHANGE_LINE_CONCEPT,
  REGIMEN_CONCEPT,
  THERAPEUTIC_LINE_CONCEPT,
  YES_CONCEPT,
} from '../../../dynamic-workflow/components/regimen-drug-order/constants';
import styles from './step-display.scss';

// Synchronization status concept UUIDs
const CONCEPT_SYNCHRONIZATION_STATUS_UUID = 'e936c643-bf3b-4955-8459-13ae5f192269';
// const CONCEPT_PENDING_STATUS_UUID = 'e95e64a6-2383-4380-8565-e1ace2496315';
// const CONCEPT_SYNCHRONIZED_STATUS_UUID = 'e95e6740-3f38-4c5e-ab37-2c338f01d1b3';

interface RegimenDrugOrderStepDisplayProps {
  step: {
    stepId: string;
    stepName: string;
    renderType: string;
    completed: boolean;
    dataReference: string | null;
    patientUuid: string;
  };
}

const RegimenDrugOrderStepDisplay: React.FC<RegimenDrugOrderStepDisplayProps> = ({ step }) => {
  const { t } = useTranslation();
  const dataReference: { encounterUuid: String; orders: string[] } = JSON.parse(step.dataReference);
  // prettier-ignore
  const rep =
    `custom:(
      uuid,encounterProviders,obs:(
        uuid,display,value,concept:(
          uuid,display)),
      orders:(
        uuid,display,orderer,drug,dose,doseUnits,frequency,duration,durationUnits))`.replace(/\s/g, '');
  const { data, isLoading, error } = useSWR(
    dataReference ? `/ws/rest/v1/encounter/${dataReference?.encounterUuid}?v=${rep}` : null,
    openmrsFetch<Encounter>,
  );

  if (isLoading) {
    return <StructuredListSkeleton rowCount={5} />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('errorLoadingRegimenDrugOrders', 'Error loading drug orders')} />;
  }

  if (!dataReference.encounterUuid) {
    return <EmptyState displayText={t('orders', 'Orders')} headerTitle={t('orders', 'Orders')} />;
  }

  const encounter = data.data;
  const obsByConcept = Object.fromEntries(encounter.obs.map((o) => [o.concept.uuid, o]));
  const regimen = (obsByConcept[REGIMEN_CONCEPT].value as OpenmrsResource).display;
  const therapeuticLine = (obsByConcept[THERAPEUTIC_LINE_CONCEPT].value as OpenmrsResource).display;
  const changeLine = obsByConcept[CHANGE_LINE_CONCEPT];
  const justification = (obsByConcept[ART_CHANGE_JUSTIFICATION_CONCEPT]?.value as OpenmrsResource)?.display;
  const changeLineMsg = `${changeLine.display} ${(changeLine.value as OpenmrsResource).uuid === YES_CONCEPT ? `(${justification})` : ''}`;

  // Get synchronization status
  const syncStatusObs = obsByConcept[CONCEPT_SYNCHRONIZATION_STATUS_UUID];

  const getSyncStatus = (): { color: string; display: string } => {
    const statusUuid = (syncStatusObs?.value as OpenmrsResource)?.uuid;
    if (statusUuid === 'feb94661-9f27-4a63-972f-39ebb63c7022') {
      return { color: 'green', display: t('synced', 'Sincronizado com sucesso') }; // SUCESSO
    }
    if (statusUuid === 'e95e64a6-2383-4380-8565-e1ace2496315') {
      return { color: 'amber', display: t('pendingSync', 'Pendente') }; // PENDENTE
    }
    if (statusUuid === '9b9c21dc-e1fb-4cd9-a947-186e921fa78c') {
      return { color: 'red', display: t('notSynced', 'Erro na sincronização') }; // ERROR
    }
    return { color: 'gray', display: t('notSyncInfo', 'Sem informação') }; // UNKNOWN
  };

  const syncStatus = getSyncStatus();

  return (
    <>
      <div className={styles.regimenDrugOrderDisplayContainer}>
        <div className={styles.regimenHeader}>
          <div className={styles.regimenInfo}>
            <h4>{t('regimen', 'Regime')}</h4>
            <p className="regimen">
              <Tag>{regimen}</Tag>&nbsp;·&nbsp;{therapeuticLine}&nbsp;·&nbsp;{changeLineMsg}
            </p>
          </div>
          <div className={styles.syncStatusContainer}>
            <span>{t('syncStatus', 'Estado de sincronização')}:&nbsp;</span>
            <Tag type={syncStatus.color}>{syncStatus.display}</Tag>
          </div>
        </div>

        <div>
          <h4>{t('formulations', 'Formulações')}</h4>
          <StructuredListWrapper className={styles.structuredList}>
            <StructuredListHead>
              <StructuredListRow head>
                <StructuredListCell head>{t('drug', 'Medicamento')}</StructuredListCell>
                <StructuredListCell head>{t('doseFrequency', 'Toma')}</StructuredListCell>
                <StructuredListCell head>{t('duration', 'Duração')}</StructuredListCell>
              </StructuredListRow>
            </StructuredListHead>
            <StructuredListBody>
              {encounter.orders.map((o: Order) => (
                <StructuredListRow key={o.uuid}>
                  <StructuredListCell>{o.drug.display}</StructuredListCell>
                  <StructuredListCell>{o.frequency.name}</StructuredListCell>
                  <StructuredListCell>{`${o.duration} ${o.durationUnits.display}`}</StructuredListCell>
                </StructuredListRow>
              ))}
            </StructuredListBody>
          </StructuredListWrapper>
        </div>

        <p style={{ textAlign: 'right' }}>{t('provider', 'Prescrito por')}</p>
        <p style={{ textAlign: 'right' }}>{encounter.encounterProviders[0]?.provider?.display}</p>
      </div>
    </>
  );
};

export default RegimenDrugOrderStepDisplay;
