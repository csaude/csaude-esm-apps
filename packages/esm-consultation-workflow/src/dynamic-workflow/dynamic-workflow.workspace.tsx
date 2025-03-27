import { InlineLoading } from '@carbon/react';
import { CloseWorkspaceOptions, useVisit } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useClobdata } from '../hooks/useClobdata';
import { useConsultationWorkflow } from '../hooks/useConsultationWorkflow';
import WorkflowError from './components/workflow-error.component';
import { WorkflowWorkspaceProps } from './types';
import WorkflowContainer from './workflow-container.component';
import { WorkflowProvider } from './workflow-context';

const DynamicWorkflowWorkspace: React.FC<WorkflowWorkspaceProps> = ({
  workflow,
  workflowUuid,
  workflowsCount,
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  setTitle,
}) => {
  const { activeVisit } = useVisit(patientUuid);
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
    consultationWorkflow.steps = clobdata.steps;
    return (
      <WorkflowProvider
        workflowConfig={consultationWorkflow}
        patientUuid={patientUuid}
        visit={activeVisit}
        onCancel={handlecloseWorkspace}
        onComplete={closeWorkspaceWithSavedChanges}>
        <WorkflowContainer />
      </WorkflowProvider>
    );
  }

  return <WorkflowError closeWorkspace={handlecloseWorkspace} />;
};

export default DynamicWorkflowWorkspace;
