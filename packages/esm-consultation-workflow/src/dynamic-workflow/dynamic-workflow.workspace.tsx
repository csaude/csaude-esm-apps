import React from 'react';
import { WorkflowConfig, WorkflowWorkspaceProps } from './types';

import { WorkflowProvider } from './workflow-context';
import WorkflowContainer from './workflow-container.component';

const workflowConfig: WorkflowConfig = {
  name: 'APSS Workflow',
  steps: [
    {
      id: 'prescription',
      renderType: 'medications',
      title: 'Prescription',
      skippable: false,
    },
    // {
    //   id: 'soap-note-step',
    //   renderType: 'form',
    //   title: 'Soap Note',
    //   formId: 'da5c6422-a1f3-47ca-a090-45a64f411cbe',
    //   skippable: true,
    // },
    {
      id: 'covid-19-step-1',
      renderType: 'form',
      title: 'Covid 19 Screening (1)',
      formId: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
      skippable: true,
    },
    // {
    //   id: 'covid-19-step',
    //   renderType: 'form',
    //   title: 'Covid 19 Screening',
    //   formId: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
    //   skippable: true,
    // },
    // {
    //   id: 'conditions',
    //   renderType: 'conditions',
    //   title: 'Form Example Step',
    //   // dependencies: [
    //   //   {
    //   //     type: 'step',
    //   //     stepId: 'vitals',
    //   //     condition: {
    //   //       field: 'temperature',
    //   //       value: 38,
    //   //       operator: 'gt',
    //   //     },
    //   //   },
    //   //   { type: 'patient', condition: { field: 'age', value: 18, operator: 'gt' } },
    //   //   { type: 'provider', condition: { field: 'role', value: 'Clinican' } },
    //   // ],
    //   dependentOn: 'vitals',
    //   condition: {
    //     stepId: 'vitals',
    //     field: 'temperature',
    //     value: 38,
    //     operator: 'gt',
    //   },
    // },
    // {
    //   id: 'drugsStep',
    //   renderType: 'medications',
    //   title: 'Medications Example Step',
    //   skippable: false,
    // },
  ],
};

const DynamicWorkflowWorkspace: React.FC<WorkflowWorkspaceProps> = ({
  workflow,
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
}) => {
  return (
    <WorkflowProvider
      workflowConfig={workflowConfig}
      patientUuid={patientUuid}
      onCancel={closeWorkspace}
      onComplete={closeWorkspaceWithSavedChanges}>
      <WorkflowContainer />
    </WorkflowProvider>
  );
};

export default DynamicWorkflowWorkspace;
