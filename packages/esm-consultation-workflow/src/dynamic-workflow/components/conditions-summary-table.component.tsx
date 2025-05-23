import { formatDate, parseDate } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type Condition } from '../hooks/useConditions';
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
import { ConditionsActionMenu } from './conditions-step-renderer.component';

interface ConditionsSummaryTableProps {
  conditions: Condition[];
  patientUuid: string;
  onEdit: (condition: Condition) => void;
  onDelete: (conditionId: string) => void;
}

function ConditionsSummaryTable({ conditions, patientUuid, onEdit, onDelete }: ConditionsSummaryTableProps) {
  const { t } = useTranslation();

  const headers = useMemo(
    () => [
      {
        key: 'display',
        header: t('condition', 'Condition'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
      {
        key: 'onsetDateTimeRender',
        header: t('dateOfOnset', 'Date of onset'),
        isSortable: true,
        sortFunc: (valueA, valueB) =>
          valueA.onsetDateTime && valueB.onsetDateTime
            ? new Date(valueA.onsetDateTime).getTime() - new Date(valueB.onsetDateTime).getTime()
            : 0,
      },
      {
        key: 'status',
        header: t('status', 'Status'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.clinicalStatus?.localeCompare(valueB.clinicalStatus),
      },
    ],
    [t],
  );

  const tableRows = useMemo(() => {
    return conditions?.map((condition) => {
      return {
        ...condition,
        id: condition.id,
        condition: condition.display,
        abatementDateTime: condition.abatementDateTime,
        onsetDateTimeRender: condition.onsetDateTime
          ? formatDate(parseDate(condition.onsetDateTime), { mode: 'wide', time: 'for today' })
          : '--',
        status: condition.clinicalStatus,
      };
    });
  }, [conditions]);

  return (
    <div>
      <DataTable rows={tableRows} headers={headers} isSortable useZebraStyles>
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <>
            <TableContainer>
              <Table {...getTableProps()} aria-label="conditions summary">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader
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
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                      <TableCell className="cds--table-column-menu">
                        <ConditionsActionMenu
                          patientUuid={patientUuid}
                          condition={row}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DataTable>
    </div>
  );
}

export default ConditionsSummaryTable;
