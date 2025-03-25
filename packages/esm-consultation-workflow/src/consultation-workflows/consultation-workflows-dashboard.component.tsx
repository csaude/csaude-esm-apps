import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  EmptyDataIllustration,
  useLaunchWorkspaceRequiringVisit,
} from '@openmrs/esm-patient-common-lib';
import styles from './consultation-workflows.scss';
import { useConsultationWorkflows } from '../hooks/useConsultationWorkflows';
import ConsultationWorkflowList from './consultation-workflow-list.component';
import { DataTableSkeleton, Tile } from '@carbon/react';

const ConsultationsWorkflowsDashboard: React.FC<DefaultPatientWorkspaceProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { consultationWorkflows, isLoading } = useConsultationWorkflows(patientUuid);

  const launchWorkflowWorkspace = useLaunchWorkspaceRequiringVisit('dynamic-workflow-workspace');

  const handleWorkflowOpen = useCallback(
    (workflowUuid: string) => {
      launchWorkflowWorkspace({
        workflowUuid: workflowUuid,
        workflowsCount: consultationWorkflows.length,
      });
    },
    [launchWorkflowWorkspace, consultationWorkflows],
  );

  useEffect(() => {
    if (consultationWorkflows?.length === 1) {
      handleWorkflowOpen(consultationWorkflows[0].uuid);
    }
  });

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (consultationWorkflows?.length === 0) {
    return (
      <ResponsiveWrapper>
        <Tile className={styles.emptyState}>
          <EmptyDataIllustration />
          <p className={styles.emptyStateContent}>
            {t('noConsultationWorkflowsToDisplay', 'There are no consultation workflows to display.')}
          </p>
        </Tile>
      </ResponsiveWrapper>
    );
  }

  return (
    <div>
      <ConsultationWorkflowList consultationWorkflows={consultationWorkflows} handleWorkFlowOpen={handleWorkflowOpen} />
    </div>
  );
};

export default ConsultationsWorkflowsDashboard;
