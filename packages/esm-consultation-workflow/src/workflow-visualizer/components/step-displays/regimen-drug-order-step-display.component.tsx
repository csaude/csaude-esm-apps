import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper,
  Tag,
} from '@carbon/react';
import { Encounter, ErrorState, openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { EmptyState, Order } from '@openmrs/esm-patient-common-lib';
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
  // eslint-disable-next-line prettier/prettier
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
  return (
    <>
      <div className={styles.regimenDrugOrderDisplayContainer}>
        <div>
          <h4>{t('regimen', 'Regimen')}</h4>
          <p className="regimen">
            <Tag>{regimen}</Tag>&nbsp;·&nbsp;{therapeuticLine}&nbsp;·&nbsp;{changeLineMsg}
          </p>
        </div>

        <div>
          <h4>{t('formulations', 'Formulations')}</h4>
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

        <p style={{ textAlign: 'right' }}>{t('provider', 'Provider')}</p>
        <p style={{ textAlign: 'right' }}>{encounter.encounterProviders[0]?.provider?.display}</p>
      </div>
    </>
  );
};

export default RegimenDrugOrderStepDisplay;
