import React from 'react';
import { InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';

import { CloseWorkspaceOptions, useVisit, usePatient } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';

import { useClobdata } from '../hooks/useClobdata';
import { useConsultationWorkflow } from '../hooks/useConsultationWorkflow';

import WorkflowError from './components/workflow-error.component';
import WorkflowContainer from './workflow-container.component';
import { WorkflowProvider } from './workflow-context';
import { WorkflowConfig, WorkflowWorkspaceProps } from './types';

// const workflowConfig: WorkflowConfig = {
//   uuid: 'dummy-uuid',
//   name: 'APSS Workflow',
//   steps: [
//     {
//       id: 'step-1-allergies',
//       renderType: 'allergies',
//       title: 'Alergias a medicamentos',
//       skippable: true,
//     },
//     {
//       id: 'step-2-conditions',
//       renderType: 'conditions',
//       title: 'Condições Médicas Importantes',
//       skippable: true,
//     },
//     {
//       id: 'step-3-situacao-tarv',
//       renderType: 'form',
//       title: 'Situação TARV',
//       formId: 'e0ad6284-a1d6-3fc0-9547-d3004821e956',
//       skippable: true,
//     },
//     {
//       id: 'step-4-adesao-efeitos-secundarios',
//       renderType: 'form',
//       title: 'Avaliação de adesão e efeitos secundários',
//       formId: '1eb6fc3f-7311-3113-b783-149dfff04182',
//       skippable: true,
//     },
//     {
//       id: 'step-5-avaliacao-nutricional',
//       renderType: 'form',
//       title: 'Avaliação do Estado Nutricional',
//       formId: '00dde54f-eaac-3d8e-9906-ba498b747521',
//       skippable: true,
//     },
//     {
//       id: 'step-6-rastreio-its',
//       renderType: 'form',
//       title: 'Rastreio e Diagnostico TT ITS',
//       formId: '6c9c370c-28f5-307c-b17a-3b1e303cb3c1',
//       skippable: true,
//     },
//     // {
//     //   id: 'step-7-gravidez',
//     //   renderType: 'form',
//     //   title: 'Gravidez / Lactação/ Planeamento Familiar',
//     //   formId: 'c9610f46-e368-46c5-bd00-edc13d359afc',
//     //   skippable: true,
//     // },
//     {
//       id: 'step-8-rastreio-tb',
//       renderType: 'form',
//       title: 'Rastreio de TB',
//       formId: 'bd2123f3-e588-3fd1-ba3b-79f2b20a2fc7',
//       skippable: true,
//     },
//     // {
//     //   id: 'step-9-medications',
//     //   renderType: 'medications',
//     //   title: 'Profilaxia TPT',
//     //   skippable: false,
//     // },
//     {
//       id: 'step-10-estadio-oms',
//       renderType: 'form',
//       title: 'Infecções Oportunistas e Estadio OMS',
//       formId: 'cc49ad5f-5905-3484-a41e-90004aa3303b',
//       skippable: true,
//     },
//     {
//       id: 'step-11-avaliacao-mds',
//       renderType: 'form',
//       title: 'Avaliação MDS',
//       formId: '28a9160e-373b-354c-b052-a2c24e2d482c',
//       skippable: true,
//     },
//     // {
//     //   id: 'step-12-lab-orders',
//     //   renderType: 'form-workspace',
//     //   title: 'Pedidos Laboratoriais',
//     //   skippable: false,
//     // },
//     {
//       id: 'step-13-medications-arv',
//       renderType: 'medications',
//       title: 'Prescrição de Medicamentos-ARV',
//       skippable: true,
//     },
//     {
//       id: 'step-14-referrals',
//       renderType: 'form',
//       title: 'Referências',
//       formId: 'd7827228-9197-332f-be84-63e14f297793',
//       skippable: true,
//     },
//     // {
//     //   id: 'step-15-agendamento-proxima-consulta',
//     //   renderType: 'form',
//     //   title: 'Agendar Próxima Consulta',
//     //   formId: '699d67d5-6ab9-4de2-9785-079a5b65b59a',
//     //   skippable: true,
//     // },
//   ],
// };

const workflowConfig: WorkflowConfig = {
  uuid: 'dummy-uuid',
  name: 'APSS Workflow',
  description: 'Dummy description',
  version: '1.0',
  steps: [
    {
      id: 'step-3-situacao-tarv',
      renderType: 'form',
      title: 'Situação TARV',
      formId: 'e0ad6284-a1d6-3fc0-9547-d3004821e956',
      skippable: true,
      visibility: {
        conditions: [{ source: 'patient', field: 'age', operator: 'gt', value: 25 }],
      },
    },
    {
      id: 'step-1-allergies',
      renderType: 'allergies',
      title: 'Alergias a medicamentos',
      skippable: true,
      visibility: {
        conditions: [{ source: 'patient', field: 'age', operator: 'gte', value: 25 }],
      },
    },
    {
      id: 'step-13-medications-arv',
      renderType: 'medications',
      title: 'Prescrição de Medicamentos-ARV',
      skippable: true,
      visibility: {
        conditions: [{ source: 'patient', field: 'gender', operator: 'equals', value: 'female' }],
      },
    },
    {
      id: 'step-2-conditions',
      renderType: 'conditions',
      title: 'Condições Médicas Importantes',
      skippable: true,
      visibility: {
        conditions: [
          {
            source: 'step',
            stepId: 'step-3-situacao-tarv',
            field: 'alreadyInTarv',
            operator: 'equals',
            value: '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
        ],
      },
    },

    {
      id: 'step-4-adesao-efeitos-secundarios',
      renderType: 'form',
      title: 'Avaliação de adesão e efeitos secundários',
      formId: '96bc618e-4cb3-42df-8c59-c6c3247044a4',
      skippable: true,
      visibility: {
        conditions: [
          {
            source: 'step',
            stepId: 'step-3-situacao-tarv',
            field: 'alreadyInTarv',
            operator: 'equals',
            value: '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          },
        ],
      },
    },
  ],
};

const DynamicWorkflowWorkspace: React.FC<WorkflowWorkspaceProps> = ({
  workflow,
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
