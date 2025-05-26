import React, { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import ResultsTable from './results-table.component';
import { type FHIREntry, organizeEntries, useObs } from './lab-results.resources';

interface Props {
  patient: {
    id: string;
  };
}

interface RowsData {
  id: string;
  effectiveDateTime: string;
  genexpert: string | number;
}

const getGenexpert = (entries: FHIREntry[], conceptUuid: string) => {
  const filteredEntries = entries.filter((entry) => entry?.resource?.code?.coding?.[0]?.code === conceptUuid);
  return filteredEntries.length > 0
    ? filteredEntries[filteredEntries.length - 1].resource.valueCodeableConcept?.text
    : '--';
};

const Genexpert: React.FC<Props> = ({ patient }) => {
  const { t } = useTranslation();
  const [rowsData, setRowsData] = useState<RowsData[]>();
  const pageSize = 5;
  const conceptUuids = useMemo(() => ['b08eb89b-c609-4d15-ab81-53ad7c745332'], []);
  const { isLoading, error, obs } = useObs(patient.id, conceptUuids.join(','));

  const headerTitle = t('genexpert', 'Genexpert');

  const headerData = [
    {
      key: 'effectiveDateTime',
      header: 'Data e Hora',
    },
    {
      key: 'genexpert',
      header: t('genexpert', 'Genexpert'),
    },
  ];

  useEffect(() => {
    if (obs && obs.length > 0) {
      const data = organizeEntries(obs);
      const updatedRowsData: RowsData[] = data.map((item) => ({
        id: item.encounterReference,
        effectiveDateTime: item.entries[0].resource.effectiveDateTime,
        genexpert: getGenexpert(item.entries, conceptUuids[0]),
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

export default Genexpert;
