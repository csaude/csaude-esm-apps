import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
  Layer,
  Tile,
  TableContainer,
  Pagination,
} from '@carbon/react';
import styles from './consultation-workflow-list.scss';
import { formatDate } from '@openmrs/esm-framework';
import { type ConsultationWorkflowData } from '../../hooks/useConsultationWorkflowData';

interface ConsultationWorkflowListProps {
  consultationWorkflows: ConsultationWorkflowData[];
  isLoading: boolean;
  error: Error | null;
  onWorkflowClick?: (workflow: ConsultationWorkflowData) => void;
}

const ConsultationWorkflowList: React.FC<ConsultationWorkflowListProps> = ({
  consultationWorkflows,
  isLoading,
  error,
  onWorkflowClick,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const handlePagination = ({ page, pageSize }) => {
    setPage(page);
    setPageSize(pageSize);
  };

  // Handle row click - this ensures we have access to the original workflow object
  const handleRowClick = (rowId: string) => {
    if (onWorkflowClick) {
      const workflow = consultationWorkflows.find((w) => w.uuid === rowId);
      if (workflow) {
        onWorkflowClick(workflow);
      }
    }
  };

  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedWorkflows = consultationWorkflows.slice(startIndex, endIndex);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (error) {
    return (
      <div className={styles.errorMessage}>
        {t('errorLoadingWorkflows', 'Erro ao abrir fluxos: {{error}}', { error: error.message })}
      </div>
    );
  }

  if (consultationWorkflows.length === 0) {
    return (
      <Layer>
        <Tile className={styles.emptyState}>
          <p className={styles.emptyStateContent}>{t('noWorkflowsFound', 'Nenhum fluxo encontrado')}</p>
        </Tile>
      </Layer>
    );
  }

  const headers = [
    {
      key: 'workflowName',
      header: t('workflowName', 'Nome do Fluxo da Consulta'),
    },
    {
      key: 'visitType',
      header: t('visitType', 'Tipo da Visita'),
    },
    {
      key: 'date',
      header: t('dateTime', 'Data e Hora'),
    },
    {
      key: 'stepsCount',
      header: t('stepsCount', 'Etapas'),
    },
    {
      key: 'completedSteps',
      header: t('completedSteps', 'Etapas Completadas'),
    },
  ];

  const rows = paginatedWorkflows.map((workflow) => {
    const completedSteps = workflow.steps.filter((step) => step.completed).length;
    const totalSteps = workflow.steps.length;
    const visitDate = new Date(workflow.dateCreated);

    return {
      id: workflow.uuid,
      workflowName: workflow.workflowConfig.name,
      visitType: workflow.visit.visitType.display,
      date: formatDate(visitDate, { mode: 'wide', time: true }),
      stepsCount: totalSteps,
      completedSteps: `${completedSteps}/${totalSteps}`,
    };
  });

  return (
    <div className={styles.container}>
      <DataTable rows={rows} headers={headers} isSortable useZebraStyles size="sm">
        {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
          <TableContainer>
            <Table {...getTableProps()} className={styles.workflowTable}>
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
                  <TableRow
                    {...getRowProps({ row })}
                    key={row.id}
                    onClick={() => handleRowClick(row.id)}
                    className={styles.workflowRow}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      <Pagination
        page={page}
        pageSize={pageSize}
        pageSizes={[10, 20, 30, 40, 50]}
        totalItems={consultationWorkflows.length}
        onChange={handlePagination}
        className={styles.pagination}
      />
    </div>
  );
};

export default ConsultationWorkflowList;
