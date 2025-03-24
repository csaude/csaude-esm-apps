import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope } from '@carbon/react/icons';
import { ActionMenuButton, useWorkspaces, useFeatureFlag } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';

const ConsultationWorkflowActionButton: React.FC = () => {
  const { t } = useTranslation();
  const { workspaces } = useWorkspaces();
  const launchWorkflowsWorkspace = useLaunchWorkspaceRequiringVisit('consultation-workflows-workspace');
  const launchOpendWorkflow = useLaunchWorkspaceRequiringVisit('dynamic-workflow-workspace');

  const workflowEntryWorkspaces = workspaces.filter((w) => w.name === 'dynamic-workflow-workspace');
  const recentlyOpenWorkflow = workflowEntryWorkspaces[0];

  const isWorkflowOpen = workflowEntryWorkspaces?.length >= 1;

  const launchConsultationWorkspace = () => {
    if (isWorkflowOpen) {
      launchOpendWorkflow({
        workflowUuid: recentlyOpenWorkflow?.additionalProps?.['workflowUuid'],
      });
    } else {
      launchWorkflowsWorkspace();
    }
  };

  const isConsultationWorkflowEnabled = useFeatureFlag('consultation-workflow');
  if (!isConsultationWorkflowEnabled) {
    return null;
  }

  return (
    <ActionMenuButton
      getIcon={() => <Stethoscope />}
      label={t('consultationWorkflow', 'Consulta clínica')}
      iconDescription={t('consultationWorkflow', 'Consulta clínica')}
      handler={launchConsultationWorkspace}
      type={'dynamic-workflow'}
    />
  );
};

export default ConsultationWorkflowActionButton;
