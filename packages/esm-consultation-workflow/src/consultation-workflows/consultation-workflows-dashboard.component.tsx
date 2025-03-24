import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveWrapper, useConfig, useConnectivity } from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  EmptyDataIllustration,
  launchFormEntryOrHtmlForms,
  useLaunchWorkspaceRequiringVisit,
  useVisitOrOfflineVisit,
} from '@openmrs/esm-patient-common-lib';
// import type { ConfigObject } from '../config-schema';
// import { useForms } from '../hooks/use-forms';
// import FormsList from './forms-list.component';
import styles from './consultation-workflows.scss';
import { useConsultationWorkflows } from '../hooks/useConsultationWorkflows';
import ConsultationWorkflowList from './consultation-workflow-list.component';
import { DataTableSkeleton, Tile } from '@carbon/react';

interface ConsultationsWorkflowsDashboardProps extends DefaultPatientWorkspaceProps {
  clinicalConsultationWorkspaceName?: string;
  consultationEntryWorkspaceName?: string;
  consultationWorkflowEntryWorkspaceName?: string;
}

const ConsultationsWorkflowsDashboard: React.FC<ConsultationsWorkflowsDashboardProps> = ({
  patientUuid,
  clinicalConsultationWorkspaceName,
  consultationEntryWorkspaceName,
  consultationWorkflowEntryWorkspaceName,
}) => {
  const { t } = useTranslation();
  // const config = useConfig<ConfigObject>();
  // const isOnline = useConnectivity();
  // const htmlFormEntryForms = config.htmlFormEntryForms;
  const { consultationWorkflows, error, isLoading, mutate } = useConsultationWorkflows();
  const { currentVisit } = useVisitOrOfflineVisit(patientUuid);

  const launchWorkflowWorkspace = useLaunchWorkspaceRequiringVisit('dynamic-workflow-workspace');

  const handleWorkflowOpen = useCallback(
    (workflowUuid: string) => {
      launchWorkflowWorkspace({
        workflowUuid: workflowUuid,
      });
    },
    [launchWorkflowWorkspace],
  );

  // console.log(consultationWorkflows);

  // const sections = useMemo(() => {
  //   return config.formSections?.map((formSection) => ({
  //     ...formSection,
  //     availableForms: forms?.filter((formInfo) =>
  //       formSection.forms.some((formConfig) => formInfo.form.uuid === formConfig || formInfo.form.name === formConfig),
  //     ),
  //   }));
  // }, [config.formSections, forms]);

  // console.log(consultationWorkflows);

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

  // return (
  //   <div className={styles.container}>
  //     {sections.length === 0 ? (
  //       <FormsList completedForms={forms} error={error} handleFormOpen={handleFormOpen} />
  //     ) : (
  //       sections.map((section) => {
  //         return (
  //           <FormsList
  //             key={`form-section-${section.name}`}
  //             sectionName={section.name}
  //             completedForms={section.availableForms}
  //             error={error}
  //             handleFormOpen={handleFormOpen}
  //           />
  //         );
  //       })
  //     )}
  //   </div>
  // );
};

export default ConsultationsWorkflowsDashboard;
