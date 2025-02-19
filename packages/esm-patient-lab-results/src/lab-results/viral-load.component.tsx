import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { FHIREntry, organizeEntries, useObs } from './lab-results.resources';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import ResultsTable from './results-table.component';

interface Props {
  patient: {
    id: string;
  };
}

interface RowsData {
  id: string;
  effectiveDateTime: string;
  viralLoad: string | number;
  viralLoadQualitative: string;
}

const getViralLoad = (entries: FHIREntry[], conceptUuid: string) => {
  const filteredEntries = entries.filter((entry) => entry?.resource?.code?.coding?.[0]?.code === conceptUuid);
  return filteredEntries.length > 0 ? filteredEntries[filteredEntries.length - 1].resource.valueQuantity?.value : 0;
};

const getViralLoadQualitative = (entries: FHIREntry[], conceptUuid: string) => {
  const filteredEntries = entries.filter((entry) => entry?.resource?.code?.coding?.[0]?.code === conceptUuid);
  return filteredEntries.length > 0
    ? filteredEntries[filteredEntries.length - 1].resource.valueCodeableConcept?.text
    : '--';
};

const ViralLoad: React.FC<Props> = ({ patient }) => {
  const { t } = useTranslation();
  const [rowsData, setRowsData] = useState<RowsData[]>();
  const pageSize = 5;
  const conceptUuids = useMemo(
    () => ['e1d6247e-1d5f-11e0-b929-000c29ad1d07', 'e1da2704-1d5f-11e0-b929-000c29ad1d07'],
    [],
  );
  const { isLoading, error, obs } = useObs(patient.id, conceptUuids.join(','));

  const headerTitle = t('viralLoad', 'Carga Viral');
  const headerData = [
    {
      key: 'effectiveDateTime',
      header: 'Data e Hora',
    },
    {
      key: 'viralLoad',
      header: t('viralLoad', 'Carga Viral'),
    },
    {
      key: 'viralLoadQualitative',
      header: t('viralLaodQualitative', 'Carga Viral, Qualitativa'),
    },
  ];

  useEffect(() => {
    if (obs && obs.length > 0) {
      const data = organizeEntries(obs);
      const updatedRowsData: RowsData[] = data.map((item) => ({
        id: item.encounterReference,
        effectiveDateTime: item.entries[0].resource.effectiveDateTime,
        viralLoad: getViralLoad(item.entries, conceptUuids[0]),
        viralLoadQualitative: getViralLoadQualitative(item.entries, conceptUuids[1]),
      }));
      setRowsData(updatedRowsData);
    }
  }, [obs, conceptUuids]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (rowsData) {
    return (
      <ResultsTable<RowsData>
        headerTitle={headerTitle}
        headerData={headerData}
        rowsData={rowsData}
        pageSize={pageSize}
      />
    );
  }

  return <EmptyState displayText={headerTitle} headerTitle={headerTitle} />;
};

export default ViralLoad;
