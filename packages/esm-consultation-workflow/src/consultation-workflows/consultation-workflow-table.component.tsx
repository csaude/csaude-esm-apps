import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './consultation-workflows.scss';
import classNames from 'classnames';
import {
  DataTable,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  Link,
} from '@carbon/react';

interface Table {
  rows: Array<any>;
  headers: Array<Record<string, string>>;
  isTablet: boolean;
  handleSearch?: (searchTerm: string) => void;
  handleWorkFlowOpen?: (workflowUuid: string) => void;
}

const ConsultationWorkflowsTable: React.FC<Table> = ({ headers, rows, isTablet, handleSearch, handleWorkFlowOpen }) => {
  const { t } = useTranslation();
  return (
    <DataTable
      headers={headers}
      rows={rows}
      size={isTablet ? 'lg' : 'sm'}
      isSortable
      useZebraStyles
      overflowMenuOnHover={false}>
      {({ rows, headers, getHeaderProps, getTableProps, getToolbarProps }) => (
        <TableContainer className={styles.tableContainer}>
          <TableToolbarContent {...getToolbarProps()} style={{ justifyContent: 'flex-start' }}>
            <Layer style={{ width: '100%' }}>
              <TableToolbarSearch
                persistent
                expanded
                onChange={(event) => handleSearch(event.target.value)}
                placeholder={t('searchForAWorkflow', 'Search for a worklfow')}
                size={isTablet ? 'lg' : 'sm'}
              />
            </Layer>
          </TableToolbarContent>
          <Table {...getTableProps()} className={styles.table}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader
                    className={classNames(styles.heading, styles.text02)}
                    {...getHeaderProps({
                      header,
                      isSortable: header.isSortable,
                    })}>
                    {header.header}
                  </TableHeader>
                ))}
                <TableHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handleWorkFlowOpen(row.id);
                        }}
                        role="presentation"
                        className={styles.formName}>
                        {row.cells[0].value}
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {rows.length === 0 ? (
            <div className={styles.tileContainer}>
              <Tile className={styles.tile}>
                <div className={styles.tileContent}>
                  <p className={styles.content}>
                    {t('noMatchingWorflowsToDisplay', 'No matching workflows to display')}
                  </p>
                </div>
              </Tile>
            </div>
          ) : null}
        </TableContainer>
      )}
    </DataTable>
  );
};

export default ConsultationWorkflowsTable;
