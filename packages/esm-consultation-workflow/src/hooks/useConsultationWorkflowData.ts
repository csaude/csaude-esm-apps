import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

// Define the specific structure for workflow steps
interface WorkflowStep {
  stepId: string;
  stepName: string;
  renderType: string;
  completed: boolean;
  dataReference: string | null;
}

// Define the structure for workflow config
interface WorkflowConfigInfo {
  uuid: string;
  name: string;
}

interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

interface SimpleResource {
  uuid: string;
  display?: string;
  links: Link[];
}

interface ConceptName {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
  links: Link[];
  resourceVersion: string;
}

interface Concept {
  uuid: string;
  display: string;
  name: ConceptName;
  datatype: SimpleResource;
  conceptClass: SimpleResource;
  set: boolean;
  version: string | null;
  retired: boolean;
  names: {
    uuid: string;
    display: string;
    links: Link[];
  }[];
  descriptions: any[];
  mappings: {
    uuid: string;
    display: string;
    links: Link[];
  }[];
  answers: any[];
  setMembers: any[];
  attributes: any[];
  links: Link[];
  resourceVersion: string;
}

interface Observation {
  uuid: string;
  display: string;
  concept: SimpleResource;
  person: {
    uuid: string;
    display: string;
    links: Link[];
  };
  obsDatetime: string;
  accessionNumber: null;
  obsGroup: null;
  valueCodedName: null;
  groupMembers: null;
  comment: string;
  location: {
    uuid: string;
    display: string;
    links: Link[];
  };
  order: null;
  encounter: {
    uuid: string;
    display: string;
    links: Link[];
  };
  voided: boolean;
  value: Concept;
  valueModifier: null;
  formFieldPath: null;
  formFieldNamespace: null;
  status: string;
  interpretation: null;
  links: Link[];
  resourceVersion: string;
}

interface EncountersInfo {
  uuid: string;
  display: string;
  encounterDatetime: string;
  obs: Observation[];
}

// Define the structure for visit info
interface VisitInfo {
  uuid: string;
  display: string;
  encounters: EncountersInfo[];
  visitType: { uuid: string; display: string };
  location: { uuid: string; display: string };
}

// Define the structure for a single workflow data item
export interface ConsultationWorkflowData {
  uuid: string;
  workflowConfig: WorkflowConfigInfo;
  visit: VisitInfo;
  steps: WorkflowStep[];
  dateCreated: string;
  patientUuid: string;
}

// Define the API response type
interface ConsultationWorkflowDataResponse {
  results: Array<ConsultationWorkflowData>;
}

export function useConsultationWorkflowData(patientUuid: string) {
  const representation =
    'custom:uuid,workflowConfig,steps,dateCreated,visit:(uuid,encounters:(uuid,display,encounterDatetime,obs),location:(uuid,display),visitType)';
  const url = `${restBaseUrl}/consultationworkflow/workflowdata?v=${representation}&patient=${patientUuid}`;
  const { data, error, mutate } = useSWR<{ data: ConsultationWorkflowDataResponse }, Error>(url, openmrsFetch);

  return {
    consultationWorkflows:
      data?.data?.results.map((result) => ({
        uuid: result.uuid,
        workflowConfig: {
          uuid: result.workflowConfig.uuid,
          name: result.workflowConfig.name,
        },
        steps: result.steps,
        dateCreated: result.dateCreated,
        visit: {
          uuid: result.visit.uuid,
          display: result.visit.display,
          encounters: result.visit.encounters,
          visitType: result.visit.visitType,
          location: result.visit.location,
        },
        patientUuid: patientUuid,
      })) ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    mutate,
  };
}
