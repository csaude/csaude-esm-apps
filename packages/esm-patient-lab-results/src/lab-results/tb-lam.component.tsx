import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { FHIREntry, organizeEntries, useObs } from './lab-results.resources';
import ResultsTable from './results-table.component';

interface Props {
  patient: {
    id: string;
  };
}

interface RowsData {
  id: string;
  effectiveDateTime: string;
  tbLam: string | number;
  tbLamLevelOfPositivity: string;
}

const getObservationResult = (entries: FHIREntry[], conceptUuid: string) => {
  const filteredEntries = entries.filter((entry) => entry?.resource?.code?.coding?.[0]?.code === conceptUuid);
  return filteredEntries.length > 0
    ? filteredEntries[filteredEntries.length - 1].resource.valueCodeableConcept?.text
    : '--';
};

const TbLam: React.FC<Props> = ({ patient }) => {
  const { t } = useTranslation();
  const [rowsData, setRowsData] = useState<RowsData[]>();
  const pageSize = 5;
  const conceptUuids = useMemo(
    () => ['ef139cb2-97c1-4c0f-9189-5e0711a45b8f', '303a4480-f2b3-4192-a446-725a401ebb09'],
    [],
  );
  const { isLoading, error, obs } = useObs(patient.id, conceptUuids.join(','));

  const headerTitle = t('tbLam', 'TB LAM');

  const headerData = [
    {
      key: 'effectiveDateTime',
      header: 'Data e Hora',
    },
    {
      key: 'tbLam',
      header: t('tbLam', 'TB LAM'),
    },
    {
      key: 'tbLamLevelOfPositivity',
      header: t('tbLamLevelOfPositivity', 'Nível de Positividade'),
    },
  ];

  useEffect(() => {
    if (obs && obs.length > 0) {
      const data = organizeEntries(obs);
      const updatedRowsData: RowsData[] = data.map((item) => ({
        id: item.encounterReference,
        effectiveDateTime: item.entries[0].resource.effectiveDateTime,
        tbLam: getObservationResult(item.entries, conceptUuids[0]),
        tbLamLevelOfPositivity: getObservationResult(item.entries, conceptUuids[1]),
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

export default TbLam;
