import React from 'react';
import { WorkflowWorkspaceProps } from './types';
import WorkflowContainer from './workflow-container.component';
import { WorkflowProvider } from './workflow-context';
import { useConsultationWorkflow } from '../hooks/useConsultationWorkflow';
import { useClobdata } from '../hooks/useClobdata';
import { InlineLoading } from '@carbon/react';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib/src';
import { CloseWorkspaceOptions, useWorkspaces } from '@openmrs/esm-framework/src';
import WorkflowError from './components/workflow-error.component';

const DynamicWorkflowWorkspace: React.FC<WorkflowWorkspaceProps> = ({
  workflow,
  workflowUuid,
  workflowsCount,
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  setTitle,
}) => {
  const { consultationWorkflow, isLoadingConsultationWorkflow } = useConsultationWorkflow(workflowUuid);
  const { clobdata, isLoadingClobdata } = useClobdata(consultationWorkflow);

  const launchWorkflowsWorkspace = useLaunchWorkspaceRequiringVisit('consultation-workflows-workspace');
  const handlecloseWorkspace = (closeWorkspaceOptions?: CloseWorkspaceOptions) => {
    closeWorkspace(closeWorkspaceOptions);
    if (workflowsCount > 1) {
      launchWorkflowsWorkspace();
    }
  };

  if (isLoadingConsultationWorkflow || isLoadingClobdata) {
    return <InlineLoading iconDescription="Loading data..." />;
  }

  if (clobdata) {
    return (
      <WorkflowProvider
        workflowConfig={clobdata}
        patientUuid={patientUuid}
        onCancel={handlecloseWorkspace}
        onComplete={closeWorkspaceWithSavedChanges}>
        <WorkflowContainer />
      </WorkflowProvider>
    );
  }

  return <WorkflowError closeWorkspace={handlecloseWorkspace} />;
};

export default DynamicWorkflowWorkspace;
