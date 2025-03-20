import React, { useCallback } from 'react';
import { showModal } from '@openmrs/esm-framework';
import styles from './eligibility-criteria.scss';
import { Add, TrashCan } from '@carbon/react/icons';
import { Criteria } from '../../types';
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
  criteria: Criteria[];
  setCriteria: React.Dispatch<React.SetStateAction<Criteria[]>>;
}

interface TableProps {
  criteria: Criteria[];
  removeCriteria: (index: number) => void;
}

const EligibilityCriteria = ({ criteria, setCriteria }: Props) => {
  const updateCriteria = useCallback(
    (updateCriteria: Criteria[]) => {
      setCriteria(updateCriteria);
    },
    [setCriteria],
  );

  const removeCriteria = (index) => {
    const updatedCriteria = [...criteria];
    updatedCriteria.splice(index, 1);
    setCriteria(updatedCriteria);
  };

  const launchAddCriteriaModal = useCallback(() => {
    const dispose = showModal('add-criteria-modal', {
      closeModal: () => dispose(),
      criteria,
      updateCriteria,
    });
  }, [criteria, updateCriteria]);

  return (
    <>
      <div className={styles.container}>
        <h5>Criterios de elegibilidade</h5>
        <Button kind="ghost" renderIcon={Add} onClick={launchAddCriteriaModal}>
          Add Criteria
        </Button>
        {criteria.length > 0 && <CriteriaTable criteria={criteria} removeCriteria={removeCriteria} />}
      </div>
    </>
  );
};

const CriteriaTable = ({ criteria, removeCriteria }: TableProps) => {
  const headerData = [
    {
      key: 'criteriaType',
      header: 'Criteria Type',
    },
    {
      key: 'condition',
      header: 'Condition',
    },
  ];

  const rows = criteria.map((c, i) => ({
    ...c,
    id: i,
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
                    <IconButton kind="ghost" label="Apagar" align="left" onClick={() => removeCriteria(i)}>
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

export default EligibilityCriteria;
