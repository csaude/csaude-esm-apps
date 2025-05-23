import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { type FHIREntry, organizeEntries, useObs } from './lab-results.resources';
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
  Cd4Absolute: string | number;
}

const getCd4Absolute = (entries: FHIREntry[], conceptUuid: string) => {
  const filteredEntries = entries.filter((entry) => entry?.resource?.code?.coding?.[0]?.code === conceptUuid);
  return filteredEntries.length > 0 ? filteredEntries[filteredEntries.length - 1].resource.valueQuantity?.value : 0;
};

const Cd4Absolute: React.FC<Props> = ({ patient }) => {
  const { t } = useTranslation();
  const [rowsData, setRowsData] = useState<RowsData[]>();
  const pageSize = 5;
  const conceptUuids = useMemo(() => ['e1dd5ab4-1d5f-11e0-b929-000c29ad1d07'], []);
  const { isLoading, error, obs } = useObs(patient.id, conceptUuids.join(','));

  const headerTitle = t('Cd4Absolute', 'CD4 Absoluto');
  const headerData = [
    {
      key: 'effectiveDateTime',
      header: 'Data e Hora',
    },
    {
      key: 'Cd4Absolute',
      header: t('Cd4Absolute', 'CD4 Absoluto'),
    },
  ];

  useEffect(() => {
    if (obs && obs.length > 0) {
      const data = organizeEntries(obs);
      const updatedRowsData: RowsData[] = data.map((item) => ({
        id: item.encounterReference,
        effectiveDateTime: item.entries[0].resource.effectiveDateTime,
        Cd4Absolute: getCd4Absolute(item.entries, conceptUuids[0]),
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

export default Cd4Absolute;
