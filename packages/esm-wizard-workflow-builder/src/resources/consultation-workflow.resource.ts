import { openmrsFetch, type FetchResponse, restBaseUrl } from '@openmrs/esm-framework';
import { ConsultationWorkflow, Criteria, Schema } from '../types';

interface SavePayload {
  name: string;
  description?: string;
  version?: string;
  published?: boolean;
  criteria?: Criteria[];
}

export async function deleteConsultationWorkflow(uuid: string): Promise<FetchResponse<Record<string, never>>> {
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/consultationworkflow/workflowconfig/${uuid}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
}

export async function updateConsultationWorkflow(
  consultationWorkflowUuid: string,
  name: string,
  version: string,
  description: string,
  resourceValueReference?: string,
  criteria?: Criteria[],
): Promise<FetchResponse<Schema>> {
  const abortController = new AbortController();
  const body = {
    name: name,
    version: version,
    description: description,
    resourceValueReference: resourceValueReference,
    criteria: criteria,
  };

  const response: FetchResponse = await openmrsFetch(
    `${restBaseUrl}/consultationworkflow/workflowconfig/${consultationWorkflowUuid}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      signal: abortController.signal,
    },
  );

  return response;
}

export async function saveNewConsultationWorkflow(
  name: string,
  version: string,
  published?: boolean,
  description?: string,
  criteria?: Criteria[],
): Promise<ConsultationWorkflow> {
  const abortController = new AbortController();

  const body: SavePayload = {
    name: name,
    version: version,
    published: published ?? false,
    description: description ?? '',
    criteria: criteria,
  };

  const headers = {
    'Content-Type': 'application/json',
  };

  const response: FetchResponse<ConsultationWorkflow> = await openmrsFetch(
    `${restBaseUrl}/consultationworkflow/workflowconfig`,
    {
      method: 'POST',
      headers: headers,
      body: body,
      signal: abortController.signal,
    },
  );

  return response.data;
}

export async function publishConsultationWorkflow(uuid: string): Promise<FetchResponse<ConsultationWorkflow>> {
  const body = { published: true };
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/consultationworkflow/workflowconfig/${uuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  });
  return response;
}

export async function unpublishConsultationWorkflow(uuid: string): Promise<FetchResponse<ConsultationWorkflow>> {
  const body = { published: false };
  const response: FetchResponse = await openmrsFetch(`${restBaseUrl}/consultationworkflow/workflowconfig/${uuid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body,
  });
  return response;
}
