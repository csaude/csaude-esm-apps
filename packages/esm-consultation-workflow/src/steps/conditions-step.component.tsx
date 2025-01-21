import { DataTableSkeleton, Table, TableHead, TableRow, TableBody, TableHeader, TableCell } from '@carbon/react';
import { closeWorkspace, ErrorState, formatDate, parseDate } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './../consultation-workflow.scss';
import { useConditions } from './step-hooks';

interface Row {
  id: string;
  condition: string;
  onsetDate: string;
  clinicalStatus: string;
}

interface Header {
  key: string;
  header: string;
}

function launchClinicalConditionsWorkspace({ onConditionsSave }: { onConditionsSave: () => void }): void {
  launchPatientWorkspace('conditions-form-workspace', {
    closeWorkspaceWithSavedChanges: () => {
      closeWorkspace('conditions-form-workspace', { ignoreChanges: true, onWorkspaceClose: onConditionsSave });
    },
  });
}

const ConditionsStep: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { isLoading, error, conditions, mutate } = useConditions(patientUuid);
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      conditions?.map((condition) => ({
        id: condition.resource.id,
        condition: condition.resource.code.text,
        onsetDate: condition.resource.onsetDateTime,
        clinicalStatus: t(condition.resource.clinicalStatus.coding[0].code),
      })),
    [conditions, t],
  );

  const headers = [
    {
      key: 'condition',
      header: 'Condition',
    },
    {
      key: 'onsetDate',
      header: 'Onset Date',
    },
    {
      key: 'status',
      header: 'Status',
    },
  ];

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle="Erro!" />;
  }

  if (!conditions || !conditions.length) {
    return (
      <EmptyState
        displayText={t('conditions', 'Conditions')}
        headerTitle={t('conditions', 'Conditions')}
        launchForm={() => launchClinicalConditionsWorkspace({ onConditionsSave: mutate })}
      />
    );
  }

  return (
    <div className={styles.step}>
      <h4>{t('conditions', 'Conditions')}</h4>
      <ConditionsTable headers={headers} rows={rows} />
    </div>
  );
};

export default ConditionsStep;

const ConditionsTable: React.FC<{ rows: Row[]; headers: Header[] }> = ({ headers, rows }) => {
  return (
    <Table rows={rows} headers={headers} size="sm" useZebraStyles aria-label="sample table">
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableHeader id={header.key} key={header.key}>
              {header.header}
            </TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {Object.keys(row)
              .filter((key) => key !== 'id')
              .map((key) => {
                return (
                  <TableCell key={key}>
                    {key.endsWith('onsetDate') ? formatDate(parseDate(row[key])) : row[key]}
                  </TableCell>
                );
              })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
