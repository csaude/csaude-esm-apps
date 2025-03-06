import React from 'react';
import { WorkflowConfig, WorkflowWorkspaceProps } from './types';

import { WorkflowProvider } from './workflow-context';
import WorkflowContainer from './workflow-container.component';

const workflowConfig: WorkflowConfig = {
  name: 'APSS Workflow',
  steps: [
    {
      id: 'step-1-allergies',
      renderType: 'allergies',
      title: 'Alergias a medicamentos',
      skippable: true,
    },
    {
      id: 'step-2-conditions',
      renderType: 'conditions',
      title: 'Condições Médicas Importantes',
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
      id: 'step-5-avaliacao-nutricional',
      renderType: 'form',
      title: 'Avaliação do Estado Nutricional',
      formId: '864fbf43-8bf9-4a3c-bda8-ead4a767d06b',
      skippable: true,
    },
    {
      id: 'step-6-rastreio-its',
      renderType: 'form',
      title: 'Rastreio e Diagnostico TT ITS',
      formId: 'f807726d-8e27-4e7c-8c04-5ef0c12d2db3',
      skippable: true,
    },
    // {
    //   id: 'step-7-gravidez',
    //   renderType: 'form',
    //   title: 'Gravidez / Lactação/ Planeamento Familiar',
    //   formId: 'c9610f46-e368-46c5-bd00-edc13d359afc',
    //   skippable: true,
    // },
    {
      id: 'step-8-rastreio-tb',
      renderType: 'form',
      title: 'Rastreio de TB',
      formId: 'a7f24579-4596-483c-8d03-46ff97ecfbeb',
      skippable: true,
    },
    // {
    //   id: 'step-9-medications',
    //   renderType: 'medications',
    //   title: 'Profilaxia TPT',
    //   skippable: false,
    // },
    {
      id: 'step-10-estadio-oms',
      renderType: 'form',
      title: 'Infecções Oportunistas e Estadio OMS',
      formId: '82816674-6120-450f-b659-9ddf6e1aaf51',
      skippable: true,
    },
    {
      id: 'step-11-avaliacao-mds',
      renderType: 'form',
      title: 'Avaliação MDS',
      formId: '631dc176-ab9c-4ed0-aaf7-4842f01905e8',
      skippable: true,
    },
    {
      id: 'step-12-lab-orders',
      renderType: 'form-workspace',
      title: 'Pedidos Laboratoriais',
      skippable: false,
    },
    {
      id: 'step-13-medications-arv',
      renderType: 'medications',
      title: 'Prescrição de Medicamentos-ARV',
      skippable: true,
    },
    {
      id: 'step-14-referrals',
      renderType: 'form',
      title: 'Referências',
      formId: 'd92c017b-d81c-4d73-9aec-a79e72feff10',
      skippable: true,
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
