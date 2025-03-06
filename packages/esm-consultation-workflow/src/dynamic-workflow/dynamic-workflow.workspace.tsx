import React from 'react';
import { WorkflowConfig, WorkflowWorkspaceProps } from './types';

import { WorkflowProvider } from './workflow-context';
import WorkflowContainer from './workflow-container.component';

// 0
// :
// {uuid: "96bc618e-4cb3-42df-8c59-c6c3247044a4", name: "Avaliação de adesão e efeitos secundários",…}
// 1
// :
// {uuid: "864fbf43-8bf9-4a3c-bda8-ead4a767d06b", name: "Avaliação nutricional - adulto",…}
// 2
// :
// {uuid: "7a596aad-38d5-3a40-84a5-8434eea6ca27", name: "FICHA APSS e PP",…}
// 3
// :
// {uuid: "def00657-7ed4-3f69-9f12-483122be5a66", name: "FICHA CLINICA",…}
// 4
// :
// {uuid: "c9610f46-e368-46c5-bd00-edc13d359afc", name: "Gravidez/Lactação/Planeamento familiar",…}
// 5
// :
// {uuid: "82816674-6120-450f-b659-9ddf6e1aaf51", name: "Infecções oportunistas",…}
// 6
// :
// {uuid: "631dc176-ab9c-4ed0-aaf7-4842f01905e8", name: "MDS",…}
// 7
// :
// {uuid: "a7f24579-4596-483c-8d03-46ff97ecfbeb", name: "Rastreio Tuberculose (TB)",…}
// 8

// {uuid: "f807726d-8e27-4e7c-8c04-5ef0c12d2db3", name: "Rastreio, diagnostico e TT ITS",…}
// 9

// {uuid: "5b165f97-e27b-44df-82df-f90da1ea6cc2", name: "Situação TARV",…}
const workflowConfig: WorkflowConfig = {
  name: 'APSS Workflow',
  steps: [
    {
      id: 'step-0-allergies',
      renderType: 'allergies',
      title: 'Alergias a medicamentos',
      skippable: true,
    },
    {
      id: 'step-1-ficha-clinica',
      renderType: 'form',
      title: 'Alergias a medicamentos',
      formId: 'def00657-7ed4-3f69-9f12-483122be5a66',
      skippable: true,
    },
    {
      id: 'step-2-condicoes-medicas-importantes',
      renderType: 'form',
      title: 'Condicoes Medicas Importantes',
      formId: 'def00657-7ed4-3f69-9f12-483122be5a66',
      skippable: true,
    },
    {
      id: 'step-3-situacao-tarv',
      renderType: 'form',
      title: 'Situação TARV',
      formId: '5b165f97-e27b-44df-82df-f90da1ea6cc2',
      skippable: true,
    },
    {
      id: 'step-4-adesao-efeitos-secundarios',
      renderType: 'form',
      title: 'Avaliação de adesão e efeitos secundários',
      formId: '96bc618e-4cb3-42df-8c59-c6c3247044a4',
      skippable: true,
    },
    {
      id: 'prescription',
      renderType: 'medications',
      title: 'Prescription',
      skippable: false,
    },
    {
      id: 'drugsStep',
      renderType: 'medications',
      title: 'Medications Example Step',
      skippable: false,
    },
    // {
    //   id: 'soap-note-step',
    //   renderType: 'form',
    //   title: 'Soap Note',
    //   formId: 'da5c6422-a1f3-47ca-a090-45a64f411cbe',
    //   skippable: true,
    // },

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
