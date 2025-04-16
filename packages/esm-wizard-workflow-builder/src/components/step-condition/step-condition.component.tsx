import React, { useCallback } from 'react';
import { Schema, StepCondition } from '../../types';
import styles from './step-condition.scss';
import { useTranslation } from 'react-i18next';
import { Add, TrashCan } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  DataTable,
  IconButton,
  Button,
} from '@carbon/react';

interface Props {
  schema: Schema;
  stepIndex: number;
  onSchemaChange: (schema: Schema) => void;
}

interface TableProps {
  conditions: StepCondition[];
  handleRemoveCondition: (index: number) => void;
}

const StepCondition = ({ schema, stepIndex, onSchemaChange }: Props) => {
  const { t } = useTranslation();

  const launchAddConditionModal = useCallback(
    (stepIndex: number) => {
      const dispose = showModal('add-condition-modal', {
        closeModal: () => dispose(),
        schema,
        onSchemaChange,
        stepIndex,
      });
    },
    [schema, onSchemaChange],
  );

  const handleRemoveCondition = (index: number) => {
    const updatedConditions = [...schema.steps[stepIndex].visibility?.conditions];
    updatedConditions.splice(index, 1);
    onSchemaChange({
      ...schema,
      steps: schema.steps.map((step, i) =>
        i === stepIndex ? { ...step, visibility: { conditions: updatedConditions } } : step,
      ),
    });
  };

  return (
    <div className={styles.container}>
      <Button renderIcon={Add} onClick={() => launchAddConditionModal(stepIndex)} kind="ghost">
        {t('Add condition', 'Add Condition')}
      </Button>
      {schema.steps[stepIndex].visibility?.conditions?.length > 0 && (
        <StepConditionTable
          conditions={schema.steps[stepIndex].visibility?.conditions}
          handleRemoveCondition={handleRemoveCondition}
        />
      )}
    </div>
  );
};

const StepConditionTable = ({ conditions, handleRemoveCondition }: TableProps) => {
  const { t } = useTranslation();
  const headerData = [
    {
      key: 'source',
      header: t('source', 'Source'),
    },
    {
      key: 'condition',
      header: t('condition', 'Condition'),
    },
  ];

  const rows = conditions.map((c, i) => ({
    ...c,
    id: i,
    source: c.stepId ? `${c.stepId}` : `${c.source}`,
    condition: `${c.field} '${c.operator}' ${c.value}`,
  }));

  return (
    <DataTable rows={rows} headers={headerData}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
        <TableContainer {...getTableContainerProps()}>
          <Table {...getTableProps()} size="lg" useZebraStyles aria-label="critetia table">
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })} key={header.key}>
                    {header.header}
                  </TableHeader>
                ))}
                <TableHeader></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.uuid} {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>{cell.value}</TableCell>
                  ))}
                  <TableCell className="cds--table-column-menu">
                    <IconButton
                      kind="ghost"
                      label={t('delete', 'Apagar')}
                      align="left"
                      onClick={() => handleRemoveCondition(i)}>
                      <TrashCan />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DataTable>
  );
};

export default StepCondition;
