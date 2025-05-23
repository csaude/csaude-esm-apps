import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLayoutType, ResponsiveWrapper } from '@openmrs/esm-framework';
import { type WorkflowConfig } from '../dynamic-workflow/types';
import ConsultationWorkflowsTable from './consultation-workflow-table.component';

interface ConsultationWorkflowListProps {
  consultationWorkflows: WorkflowConfig[];
  handleWorkFlowOpen?: (workflowUuid: string) => void;
}

const ConsultationWorkflowList: React.FC<ConsultationWorkflowListProps> = ({
  consultationWorkflows,
  handleWorkFlowOpen,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);

  useEffect(() => {
    setWorkflows(consultationWorkflows);
  }, [consultationWorkflows]);

  const handleSearch = (searchTerm: string) => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    if (!lowercasedSearchTerm) {
      setWorkflows(consultationWorkflows);
      return;
    }
    setWorkflows(
      consultationWorkflows.filter((workflow) => workflow.name.toLowerCase().includes(lowercasedSearchTerm)),
    );
  };

  const tableHeaders = useMemo(() => {
    return [
      {
        header: t('consultationWorkflowName', 'Consultas clinicas'),
        key: 'consultationWorkflowName',
      },
    ];
  }, [t]);

  const tableRows = useMemo(
    () =>
      workflows?.map((consultarionWorkflow) => {
        return {
          ...consultarionWorkflow,
          id: consultarionWorkflow.uuid,
          consultationWorkflowName: consultarionWorkflow.name,
        };
      }) ?? [],
    [workflows],
  );

  return (
    <ResponsiveWrapper>
      <ConsultationWorkflowsTable
        headers={tableHeaders}
        rows={tableRows}
        isTablet={isTablet}
        handleSearch={handleSearch}
        handleWorkFlowOpen={handleWorkFlowOpen}
      />
    </ResponsiveWrapper>
  );
};

export default ConsultationWorkflowList;
