import React, { useCallback, useEffect, useState } from 'react';
import { showModal } from '@openmrs/esm-framework';
import styles from './eligibility-criteria.scss';
import { Add, TrashCan } from '@carbon/react/icons';
import type { Criteria } from '../../types';
import { useCriteriaValues } from '../../hooks/useCriteriaValues';
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
  getProgramName: (uuid: string) => string;
  getPatientAttributeName: (uuid: string) => string;
  getProviderRoleName: (uuid: string) => string;
}

const EligibilityCriteria = ({ criteria, setCriteria }: Props) => {
  const { data: programsData } = useCriteriaValues('program');
  const { data: patientAttributesData } = useCriteriaValues('personattributetype?v=full');
  const { data: providerRolesData } = useCriteriaValues('role?v=full');

  const [programs, setPrograms] = useState<{ label: string; value: string }[]>([]);
  const [patientAttributes, setPatientAttributes] = useState<{ label: string; value: string }[]>([]);
  const [providerRoles, setProviderRoles] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (programsData) {
      setPrograms(programsData);
    }
    if (patientAttributesData) {
      setPatientAttributes(patientAttributesData);
    }
    if (providerRolesData) {
      setProviderRoles(providerRolesData);
    }
  }, [programsData, patientAttributesData, providerRolesData]);

  const updateCriteria = useCallback(
    (updateCriteria: Criteria[]) => {
      setCriteria(updateCriteria);
    },
    [setCriteria],
  );

  const removeCriteria = (index: number) => {
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

  const getNameByUuid = (list: { label: string; value: string }[], uuid: string): string => {
    return list.find((item) => item.value === uuid)?.label || uuid;
  };

  return (
    <>
      <div className={styles.container}>
        <h5>Criterios de elegibilidade</h5>
        <Button kind="ghost" renderIcon={Add} onClick={launchAddCriteriaModal}>
          Add Criteria
        </Button>
        {criteria.length > 0 && (
          <CriteriaTable
            criteria={criteria}
            removeCriteria={removeCriteria}
            getProgramName={(uuid) => getNameByUuid(programs, uuid)}
            getPatientAttributeName={(uuid) => getNameByUuid(patientAttributes, uuid)}
            getProviderRoleName={(uuid) => getNameByUuid(providerRoles, uuid)}
          />
        )}
      </div>
    </>
  );
};

const CriteriaTable = ({
  criteria,
  removeCriteria,
  getProgramName,
  getPatientAttributeName,
  getProviderRoleName,
}: TableProps) => {
  const headerData = [
    { key: 'criteriaType', header: 'Criteria Type' },
    { key: 'condition', header: 'Condition' },
  ];

  const rows = criteria.map((c, i) => ({ ...c, id: i }));

  const formatConditionValue = (value: string, type: string) => {
    const parts = value.split(' ');

    switch (type) {
      case 'PROGRAM':
        return `${parts[0]} ${parts[1]} ${getProgramName(parts[2])}`;
      case 'PATIENT_ATTRIBUTES':
        return `${getPatientAttributeName(parts[0])} ${parts[1]} ${parts[2]}`;
      case 'PROVIDER_ROLE':
        return `${parts[0]} ${parts[1]} ${getProviderRoleName(parts[2])}`;
      default:
        return value;
    }
  };

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
                  {row.cells.map((cell, cellIndex) => {
                    const value = cellIndex === 1 ? formatConditionValue(cell.value, row.cells[0].value) : cell.value;
                    return <TableCell key={cell.id}>{value}</TableCell>;
                  })}
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
