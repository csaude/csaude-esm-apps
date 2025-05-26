import React, { useEffect } from 'react';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type CloseWorkspaceOptions, useVisit, usePatient } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { useClobdata } from '../hooks/useClobdata';
import { useConsultationWorkflow } from '../hooks/useConsultationWorkflow';
import WorkflowError from './components/workflow-error.component';
import WorkflowContainer from './workflow-container.component';
import { WorkflowProvider } from './workflow-context';
import { type WorkflowWorkspaceProps } from './types';

const DynamicWorkflowWorkspace: React.FC<WorkflowWorkspaceProps> = ({
  workflowUuid,
  workflowsCount,
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  setTitle,
}) => {
  const { t } = useTranslation();
  const { activeVisit, isLoading: isLoadingVisit } = useVisit(patientUuid);
  const { patient, isLoading: isLoadingPatient, error } = usePatient(patientUuid);
  const { consultationWorkflow, isLoadingConsultationWorkflow } = useConsultationWorkflow(workflowUuid);
  const { clobdata, isLoadingClobdata } = useClobdata(consultationWorkflow);

  const launchWorkflowsWorkspace = useLaunchWorkspaceRequiringVisit('consultation-workflows-workspace');

  useEffect(() => {
    if (consultationWorkflow) {
      setTitle(t('consultationWorkflow', 'Consultation Workflow'), consultationWorkflow.name);
    }
  }, [consultationWorkflow, setTitle, t]);

  const handleCloseWorkspace = (closeWorkspaceOptions?: CloseWorkspaceOptions) => {
    closeWorkspace(closeWorkspaceOptions);
    if (workflowsCount > 1) {
      launchWorkflowsWorkspace();
    }
  };

  if (isLoadingVisit || isLoadingPatient || isLoadingConsultationWorkflow || isLoadingClobdata) {
    return <InlineLoading iconDescription="Loading data..." />;
  }

  if (error) {
    return <div className="error-message">Error loading patient data: {error.message}</div>;
  }

  if (clobdata) {
    consultationWorkflow.steps = clobdata.steps;
    return (
      <WorkflowProvider
        workflowConfig={consultationWorkflow}
        patientUuid={patientUuid}
        visit={activeVisit}
        patient={patient}
        onCancel={handleCloseWorkspace}
        onComplete={closeWorkspaceWithSavedChanges}>
        <WorkflowContainer />
      </WorkflowProvider>
    );
  }

  return <WorkflowError closeWorkspace={handleCloseWorkspace} />;
};

export default DynamicWorkflowWorkspace;
