import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation, type TFunction } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  IconButton,
  InlineLoading,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  Tile,
} from '@carbon/react';
import { Add, DocumentImport, Download, Edit, TrashCan } from '@carbon/react/icons';
import { type KeyedMutator, preload } from 'swr';
import {
  ConfigurableLink,
  navigate,
  openmrsFetch,
  restBaseUrl,
  showModal,
  showSnackbar,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import EmptyState from '../empty-state/empty-state.component';
import ErrorState from '../error-state/error-state.component';
import Header from '../header/header.component';
import { FormBuilderPagination } from '../pagination';
import { useClobdata } from '../../hooks/useClobdata';
import type { ConsultationWorkflow as TypedConsultationWorkflow } from '../../types';
import styles from './dashboard.scss';
import { useConsultationWorkflows } from '../../hooks/useConsultationWorkflows';
import { deleteConsultationWorkflow } from '../../resources/consultation-workflow.resource';

type Mutator = KeyedMutator<{
  data: {
    results: Array<TypedConsultationWorkflow>;
  };
}>;

interface ActionButtonsProps {
  consultationWorkflow: TypedConsultationWorkflow;
  mutate: Mutator;
  responsiveSize: string;
  t: TFunction;
}

interface FormsListProps {
  consultationWorkflows: Array<TypedConsultationWorkflow>;
  isValidating: boolean;
  mutate: Mutator;
  t: TFunction;
}

function CustomTag({ condition }: { condition?: boolean }) {
  const { t } = useTranslation();

  if (condition) {
    return (
      <Tag type="green" size="md" title="Clear Filter" data-testid="yes-tag">
        {t('yes', 'Yes')}
      </Tag>
    );
  }

  return (
    <Tag type="red" size="md" title="Clear Filter" data-testid="no-tag">
      {t('no', 'No')}
    </Tag>
  );
}

function ActionButtons({ consultationWorkflow, mutate, responsiveSize, t }: ActionButtonsProps) {
  const defaultEnterDelayInMs = 300;
  const { clobdata } = useClobdata(consultationWorkflow);
  const resourceValueReference = consultationWorkflow?.resourceValueReference;
  const [isDeletingWorkflow, setIsDeletingWorkflow] = useState(false);

  const downloadableSchema = useMemo(
    () =>
      new Blob([JSON.stringify(clobdata, null, 2)], {
        type: 'application/json',
      }),
    [clobdata],
  );

  const handleDeleteConsultationWorkflow = useCallback(
    async (uuid: string) => {
      try {
        const res = await deleteConsultationWorkflow(uuid);
        if (res.status === 204) {
          showSnackbar({
            title: t('consultationWorkflowDeleted', 'Consultation workflow deleted'),
            kind: 'success',
            isLowContrast: true,
            subtitle: t(
              'consultationWorkflowDeletedMessage',
              'The consultationWorkflow "{{- consultationWorkflowName}}" has been deleted successfully',
              {
                consultationWorkflowName: consultationWorkflow.name,
              },
            ),
          });
          await mutate();
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          showSnackbar({
            title: t('errorDeletingConsultationWorkflow', 'Error deleting Consultation workflow'),
            kind: 'error',
            subtitle: e?.message,
          });
        }
      } finally {
        setIsDeletingWorkflow(false);
      }
    },
    [consultationWorkflow.name, mutate, t],
  );

  const launchDeleteWorkflowModal = useCallback(() => {
    const dispose = showModal('delete-workflow-modal', {
      closeModal: () => dispose(),
      isDeletingWorkflow,
      onDeleteWorkflow: () => handleDeleteConsultationWorkflow(consultationWorkflow.uuid),
    });
  }, [consultationWorkflow.uuid, handleDeleteConsultationWorkflow, isDeletingWorkflow]);

  const ImportButton = () => {
    return (
      <IconButton
        align="center"
        enterDelayMs={defaultEnterDelayInMs}
        label={t('import', 'Import')}
        kind="ghost"
        onClick={() => navigate({ to: `${window.spaBase}/wizard-workflow-builder/edit/${consultationWorkflow.uuid}` })}
        size={responsiveSize}>
        <DocumentImport />
      </IconButton>
    );
  };

  const EditButton = () => {
    return (
      <IconButton
        enterDelayMs={defaultEnterDelayInMs}
        kind="ghost"
        label={t('editSchema', 'Edit schema')}
        onClick={() =>
          navigate({
            to: `${window.spaBase}/wizard-workflow-builder/edit/${consultationWorkflow.uuid}`,
          })
        }
        size={responsiveSize}>
        <Edit />
      </IconButton>
    );
  };

  const DownloadSchemaButton = () => {
    return (
      <a download={`${consultationWorkflow?.name}.json`} href={window.URL.createObjectURL(downloadableSchema)}>
        <IconButton
          enterDelayMs={defaultEnterDelayInMs}
          kind="ghost"
          label={t('downloadSchema', 'Download schema')}
          size={responsiveSize}>
          <Download />
        </IconButton>
      </a>
    );
  };

  const DeleteButton = () => {
    return (
      <IconButton
        enterDelayMs={defaultEnterDelayInMs}
        kind="ghost"
        label={t('deleteSchema', 'Delete schema')}
        onClick={launchDeleteWorkflowModal}
        size={responsiveSize}>
        <TrashCan />
      </IconButton>
    );
  };

  return (
    <>
      {!resourceValueReference ? (
        <ImportButton />
      ) : (
        <>
          <EditButton />
          <DownloadSchemaButton />
        </>
      )}
      <DeleteButton />
    </>
  );
}

function ConsultationWorkflowList({ consultationWorkflows, isValidating, mutate, t }: FormsListProps) {
  const pageSize = 10;
  const isTablet = useLayoutType() === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const [filter, setFilter] = useState('');
  const [searchString, setSearchString] = useState('');

  const filteredRows = useMemo(() => {
    if (!filter) {
      return consultationWorkflows;
    }

    if (filter === 'Published') {
      return consultationWorkflows.filter((consultationWorkflow) => consultationWorkflow.published);
    }

    if (filter === 'Unpublished') {
      return consultationWorkflows.filter((consultationWorkflow) => !consultationWorkflow.published);
    }

    return consultationWorkflows;
  }, [filter, consultationWorkflows]);

  const tableHeaders = [
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('version', 'Version'),
      key: 'version',
    },
    {
      header: t('published', 'Published'),
      key: 'published',
    },
    {
      header: t('schemaActions', 'Schema actions'),
      key: 'actions',
    },
  ];

  const editSchemaUrl = '${openmrsSpaBase}/wizard-workflow-builder/edit/${formUuid}';

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      return filteredRows.filter((form) => form.name.toLowerCase().includes(searchString.toLowerCase()));
    }

    return filteredRows;
  }, [searchString, filteredRows]);

  const { paginated, goTo, results, currentPage } = usePagination(searchResults, pageSize);

  const tableRows = results?.map((consultationWorkflow: TypedConsultationWorkflow) => ({
    ...consultationWorkflow,
    id: consultationWorkflow?.uuid,
    name: (
      <ConfigurableLink
        className={styles.link}
        to={editSchemaUrl}
        templateParams={{ formUuid: consultationWorkflow?.uuid }}
        onMouseEnter={() =>
          preload(`${restBaseUrl}/consultationworkflow/workflowconfig/${consultationWorkflow?.uuid}`, openmrsFetch)
        }>
        {consultationWorkflow.name}
      </ConfigurableLink>
    ),
    published: <CustomTag condition={consultationWorkflow.published} />,
    actions: (
      <ActionButtons
        consultationWorkflow={consultationWorkflow}
        mutate={mutate}
        responsiveSize={responsiveSize}
        t={t}
      />
    ),
  }));

  const handleFilter = ({ selectedItem }: { selectedItem: string }) => setFilter(selectedItem);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      goTo(1);
      setSearchString(e.target.value);
    },
    [goTo, setSearchString],
  );

  return (
    <>
      <div className={styles.flexContainer}>
        <div className={styles.filterContainer}>
          <Dropdown
            className={styles.filterDropdown}
            id="publishStatusFilter"
            initialSelectedItem={'All'}
            label=""
            titleText={t('filterBy', 'Filter by') + ':'}
            size={responsiveSize}
            type="inline"
            items={['All', 'Published', 'Unpublished']}
            onChange={handleFilter}
          />
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <DataTable rows={tableRows} headers={tableHeaders} size={isTablet ? 'lg' : 'sm'} useZebraStyles>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <>
            <TableContainer className={styles.tableContainer} data-testid="steps-table">
              <div className={styles.toolbarWrapper}>
                <TableToolbar className={styles.tableToolbar} size={responsiveSize}>
                  <TableToolbarContent className={styles.headerContainer}>
                    <TableToolbarSearch
                      expanded
                      className={styles.searchbox}
                      onChange={handleSearch}
                      placeholder={t('searchThisList', 'Search this list')}
                    />
                    <Button
                      kind="primary"
                      iconDescription={t('createNewWorkflow', 'Create a new workflow')}
                      renderIcon={() => <Add size={16} />}
                      size={responsiveSize}
                      onClick={() =>
                        navigate({
                          to: `${window.spaBase}/wizard-workflow-builder/new`,
                        })
                      }>
                      {t('createNewWorkflow', 'Create a new workflow')}
                    </Button>
                  </TableToolbarContent>
                </TableToolbar>
              </div>
              <Table {...getTableProps()} className={styles.table}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key="row.id" {...getRowProps({ row })} data-testid={`form-row-${row.id}`}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t('noMatchingWorkflowsToDisplay', 'No matching workflows to display')}
                    </p>
                    <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </>
        )}
      </DataTable>
      {paginated && (
        <FormBuilderPagination
          currentItems={results.length}
          totalItems={searchResults.length}
          onPageNumberChange={({ page }) => {
            goTo(page);
          }}
          pageNumber={currentPage}
          pageSize={pageSize}
        />
      )}
    </>
  );
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { consultationWorkflows, error, isLoading, isValidating, mutate } = useConsultationWorkflows();

  return (
    <main>
      <Header title={t('home', 'Home')} />
      <div className={styles.container}>
        {(() => {
          if (error) {
            return <ErrorState error={error} />;
          }

          if (isLoading) {
            return <DataTableSkeleton role="progressbar" />;
          }

          if (consultationWorkflows.length === 0) {
            return <EmptyState />;
          }

          return (
            <>
              <ConsultationWorkflowList
                consultationWorkflows={consultationWorkflows}
                isValidating={isValidating}
                mutate={mutate}
                t={t}
              />
            </>
          );
        })()}
      </div>
    </main>
  );
};

export default Dashboard;
