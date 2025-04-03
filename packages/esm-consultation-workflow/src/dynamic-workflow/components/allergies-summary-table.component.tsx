import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Allergy } from '../hooks/useAllergies';
import { AllergiesActionMenu } from './allergies-step-renderer.component';
import styles from './components.scss';

interface AllergiesSummaryTableProps {
  allergies: Allergy[];
  onDelete: (allergyId: string) => void;
  patientUuid: string;
  isTablet: boolean;
}

function AllergiesSummaryTable({ allergies, isTablet, patientUuid, onDelete }: AllergiesSummaryTableProps) {
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
      id: allergy.uuid,
      reactionSeverity: allergy.severity.display.toUpperCase() ?? '--',
      lastUpdated: allergy.lastUpdated ? formatDate(parseDate(allergy.lastUpdated), { time: false }) : '--',
      reaction: allergy.reactions.map(({ reaction }) => reaction.display).join(', '),
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
                        patientUuid={patientUuid}
                        allergy={allergies.find((allergy) => allergy.uuid == row.id)}
                        onDelete={onDelete}
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
