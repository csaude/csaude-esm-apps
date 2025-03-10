import React from 'react';
import { formatDatetime, parseDate, usePagination } from '@openmrs/esm-framework';
import { CardHeader, PatientChartPagination } from '@openmrs/esm-patient-common-lib';
import styles from './lab-results.scss';
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

interface Props<T> {
  headerTitle: string;
  rowsData: T[];
  headerData: Array<{ key: string; header: string }>;
  pageSize: number;
}

const ResultsTable = <T extends {}>({ rowsData, headerData, pageSize, headerTitle }: Props<T>) => {
  const { results, goTo, currentPage } = usePagination(rowsData, pageSize);
  return (
    <div className={styles.table}>
      <CardHeader title={headerTitle}> </CardHeader>
      <DataTable rows={results} headers={headerData} isSortable>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()} size="sm" useZebraStyles aria-label="Data Table">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} key={header.key}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.uuid} {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.id.endsWith('effectiveDateTime') ? formatDatetime(parseDate(cell.value)) : cell.value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <PatientChartPagination
        pageNumber={currentPage}
        totalItems={rowsData.length}
        currentItems={results.length}
        pageSize={pageSize}
        onPageNumberChange={({ page }) => goTo(page)}
      />
    </div>
  );
};

export default ResultsTable;
