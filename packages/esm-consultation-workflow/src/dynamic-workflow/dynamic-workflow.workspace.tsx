import React from 'react';
import { WorkflowConfig, WorkflowWorkspaceProps } from './types';

import WorkflowContainer from './workflow-container.component';
import { WorkflowProvider } from './workflow-context';

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
      formId: 'e0ad6284-a1d6-3fc0-9547-d3004821e956',
      skippable: true,
    },
    {
      id: 'step-4-adesao-efeitos-secundarios',
      renderType: 'form',
      title: 'Avaliação de adesão e efeitos secundários',
      formId: '1eb6fc3f-7311-3113-b783-149dfff04182',
      skippable: true,
    },
    {
      id: 'step-5-avaliacao-nutricional',
      renderType: 'form',
      title: 'Avaliação do Estado Nutricional',
      formId: '00dde54f-eaac-3d8e-9906-ba498b747521',
      skippable: true,
    },
    {
      id: 'step-6-rastreio-its',
      renderType: 'form',
      title: 'Rastreio e Diagnostico TT ITS',
      formId: '6c9c370c-28f5-307c-b17a-3b1e303cb3c1',
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
      formId: 'bd2123f3-e588-3fd1-ba3b-79f2b20a2fc7',
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
      formId: 'cc49ad5f-5905-3484-a41e-90004aa3303b',
      skippable: true,
    },
    {
      id: 'step-11-avaliacao-mds',
      renderType: 'form',
      title: 'Avaliação MDS',
      formId: '28a9160e-373b-354c-b052-a2c24e2d482c',
      skippable: true,
    },
    // {
    //   id: 'step-12-lab-orders',
    //   renderType: 'form-workspace',
    //   title: 'Pedidos Laboratoriais',
    //   skippable: false,
    // },
    {
      id: 'step-13-medications-arv',
      renderType: 'medications',
      title: 'Prescrição de Medicamentos-ARV',
      skippable: true,
    },
    // {
    //   id: 'step-14-referrals',
    //   renderType: 'form',
    //   title: 'Referências',
    //   formId: 'd92c017b-d81c-4d73-9aec-a79e72feff10',
    //   skippable: true,
    // },
    // {
    //   id: 'step-15-agendamento-proxima-consulta',
    //   renderType: 'form',
    //   title: 'Agendar Próxima Consulta',
    //   formId: '699d67d5-6ab9-4de2-9785-079a5b65b59a',
    //   skippable: true,
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
