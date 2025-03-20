import { formatDate, parseDate } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Allergy } from '../hooks/useAllergies';
import styles from './components.scss';
import { AllergiesActionMenu } from './allergies-step-renderer.component';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';

interface AllergiesSummaryTableProps {
  allergies: Allergy[];
  patientUuid: string;
  isTablet: boolean;
  mutate: () => void;
}

function AllergiesSummaryTable({ allergies, isTablet, patientUuid, mutate }: AllergiesSummaryTableProps) {
  const { t } = useTranslation();

  const tableHeaders = [
    { key: 'display', header: t('allergen', 'Allergen') },
    {
      key: 'reactionSeverity',
      header: t('severityandReaction', 'Severity'),
    },
    { key: 'reaction', header: t('reaction', 'Reaction') },
    {
      key: 'note',
      header: t('comments', 'Comments'),
    },
  ];

  const tableRows = useMemo(() => {
    return allergies?.map((allergy) => ({
      ...allergy,
      reactionSeverity: allergy.reactionSeverity?.toUpperCase() ?? '--',
      lastUpdated: allergy.lastUpdated ? formatDate(parseDate(allergy.lastUpdated), { time: false }) : '--',
      reaction: allergy.reactionManifestations?.join(', '),
      note: allergy?.note ?? '--',
    }));
  }, [allergies]);

  return (
    <div>
      <DataTable rows={tableRows} headers={tableHeaders} isSortable useZebraStyles size={isTablet ? 'lg' : 'sm'}>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table aria-label="allergies summary" {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={styles.tableHeader}
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <AllergiesActionMenu
                        mutate={mutate}
                        patientUuid={patientUuid}
                        allergy={allergies.find((allergy) => allergy.id == row.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
}

export default AllergiesSummaryTable;
