import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowConfig, WorkflowWorkspaceProps } from './types';
import WorkflowContainer from './workflow-container';
import { WorkflowProvider } from './workflow-context';

const workflowConfig: WorkflowConfig = {
  name: 'APSS Workflow',
  steps: [
    {
      id: 'drugsStep1',
      renderType: 'medications',
      title: 'Medications 1',
      skippable: false,
    },
    {
      id: 'vitals-2',
      renderType: 'form',
      title: 'Form',
      formId: 'a1a62d1e-2def-11e9-b210-d663bd873d93',
      skippable: true,
    },
    {
      id: 'vitals-4',
      renderType: 'form',
      title: 'Form 1',
      formId: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
      skippable: true,
    },
    {
      id: 'vitals-3',
      renderType: 'form',
      title: 'Form 2',
      formId: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
      skippable: true,
    },
    {
      id: 'conditions',
      renderType: 'conditions',
      title: 'Form Example Step',
      dependentOn: 'vitals',
      condition: {
        stepId: 'vitals',
        field: 'temperature',
        value: 38,
        operator: 'gt',
      },
    },
    {
      id: 'drugsStep',
      renderType: 'medications',
      title: 'Medications Example Step',
      skippable: false,
    },
  ],
};

const DynamicWorkflowWorkspace: React.FC<WorkflowWorkspaceProps> = ({
  workflow,
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
}) => {
  return (
    <WorkflowProvider workflowConfig={workflowConfig}>
      <WorkflowContainer workflow={workflowConfig} patientUuid={patientUuid} />
    </WorkflowProvider>
  );
};

export default DynamicWorkflowWorkspace;
