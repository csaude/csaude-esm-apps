import { FetchResponse, openmrsFetch, PatientIdentifierType, restBaseUrl } from '@openmrs/esm-framework';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import uniqBy from 'lodash-es/uniqBy';
import useSWR from 'swr';
import { type PatientIdentifier, type PatientProgram, type Program, type ProgramWorkflowState } from '../types';

type PatientIdentifierSource = {
  uuid: string;
};

const identifierSourceMap = new Map<string, [PatientIdentifierType, PatientIdentifierSource]>([
  // SERVICO TARV - CUIDADO
  [
    '7b2e4a0a-d4eb-4df7-be30-78ca4b28ca99',
    [{ uuid: 'bce7c891-27e9-42ec-abb0-aec3a641175e' }, { uuid: '99408167-97eb-47bb-966b-92324b0e4b7c' }],
  ],
  // SERVICO TARV - TRATAMENTO
  [
    'efe2481f-9e75-4515-8d5a-86bfde2b5ad3',
    [{ uuid: 'e2b966d0-1d5f-11e0-b929-000c29ad1d07' }, { uuid: '3d588067-790b-45af-8128-a6c1ffb52883' }],
  ],
  // CCR
  [
    '611f0a6b-68b7-4de7-bc7a-fd021330eef8',
    [{ uuid: 'e2b97b70-1d5f-11e0-b929-000c29ad1d07' }, { uuid: 'e930ed89-506b-41eb-8161-36c571edb363' }],
  ],
  // TUBERCULOSE
  [
    '142d23c4-c29f-4799-8047-eb3af911fd21',
    [{ uuid: 'e2b97e40-1d5f-11e0-b929-000c29ad1d07' }, { uuid: 'af113b3f-8afc-4c8b-a4a4-65db53072072' }],
  ],
]);

export function getIdentifierSource(program: string) {
  return identifierSourceMap.get(program);
}

export function hasGenerator(program: string) {
  return identifierSourceMap.has(program);
}

// eslint-disable-next-line prettier/prettier
export const customRepresentation = `custom:(uuid,display,program,dateEnrolled,dateCompleted,
  location:(uuid,display),
  states:(startDate,endDate,voided,
    state:(uuid,
    concept:(uuid,display))))`;

export function useEnrollments(patientUuid: string) {
  const enrollmentsUrl = `${restBaseUrl}/programenrollment?patient=${patientUuid}&v=${customRepresentation.replace(/\s/g, '')}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<FetchResponse<{ results: PatientProgram[] }>, Error>(
    patientUuid ? enrollmentsUrl : null,
    openmrsFetch,
  );

  const formattedEnrollments =
    data?.data?.results.length > 0
      ? data?.data.results.sort((a, b) => (b.dateEnrolled > a.dateEnrolled ? 1 : -1))
      : null;

  const activeEnrollments = formattedEnrollments?.filter((enrollment) => !enrollment.dateCompleted);
  const unique: PatientProgram[] = uniqBy(formattedEnrollments, (program: PatientProgram) => program?.program?.uuid);
  return {
    data: data ? unique : null,
    error,
    isLoading,
    isValidating,
    activeEnrollments,
    mutateEnrollments: mutate,
  };
}

export function useAvailablePrograms(enrollments?: Array<PatientProgram>) {
  // eslint-disable-next-line prettier/prettier
  const custom = `custom:(uuid,display,name,
                    concept:(uuid,display),
                    allWorkflows:(uuid,retired,
                      concept:(uuid,display),
                      states:(uuid,
                        concept:(uuid,display)),
                    concept:(uuid,display))`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<Program> } }, Error>(
    `${restBaseUrl}/program?v=${custom.replace(/\s/g, '')}`,
    openmrsFetch,
  );

  const availablePrograms = data?.data?.results ?? null;

  const eligiblePrograms = filter(
    availablePrograms,
    (program) => !includes(map(enrollments, 'program.uuid'), program.uuid),
  );

  return {
    data: availablePrograms,
    error,
    isLoading,
    eligiblePrograms,
  };
}

export async function createProgramEnrollment(payload, abortController) {
  if (!payload) {
    return null;
  }
  const { program, patient, dateEnrolled, dateCompleted, location, states } = payload;

  const [identifierType, source] = identifierSourceMap.get(program);

  const identifier = payload.identifier || (await generateIdentifier(source)).data.identifier;
  const patientIdentifier = {
    identifier,
    identifierType: identifierType.uuid,
    location: location,
  };

  // TODO rollback this identifier if enrollment fails
  await addPatientIdentifier(patient, patientIdentifier);

  return openmrsFetch(`${restBaseUrl}/programenrollment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { program, patient, dateEnrolled, dateCompleted, location, states },
    signal: abortController.signal,
  });
}

export function updateProgramEnrollment(programEnrollmentUuid: string, payload, abortController) {
  if (!payload && !payload.program) {
    return null;
  }
  const { dateEnrolled, dateCompleted, location, states } = payload;
  return openmrsFetch(`${restBaseUrl}/programenrollment/${programEnrollmentUuid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { dateEnrolled, dateCompleted, location, states },
    signal: abortController.signal,
  });
}

export const usePrograms = (patientUuid: string) => {
  const {
    data: enrollments,
    error: enrollError,
    isLoading: enrolLoading,
    isValidating,
    activeEnrollments,
  } = useEnrollments(patientUuid);
  const { data: availablePrograms, eligiblePrograms } = useAvailablePrograms(enrollments);

  const status = { isLoading: enrolLoading, error: enrollError };
  return {
    enrollments,
    ...status,
    isValidating,
    activeEnrollments,
    availablePrograms,
    eligiblePrograms,
  };
};

export const findLastState = (states: ProgramWorkflowState[]): ProgramWorkflowState => {
  const activeStates = states.filter((state) => !state.voided);
  const ongoingState = activeStates.find((state) => !state.endDate);

  if (ongoingState) {
    return ongoingState;
  }

  return activeStates.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
};

function generateIdentifier(source: PatientIdentifierSource) {
  const abortController = new AbortController();

  return openmrsFetch<{ identifier: string }>(`${restBaseUrl}/idgen/identifiersource/${source.uuid}/identifier`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: {},
    signal: abortController.signal,
  });
}

async function addPatientIdentifier(patientUuid: string, patientIdentifier: PatientIdentifier) {
  const abortController = new AbortController();
  try {
    return await openmrsFetch(`${restBaseUrl}/patient/${patientUuid}/identifier/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
      body: patientIdentifier,
    });
  } catch (error) {
    const message = error.responseBody.error.message.split('reason: ')[1];
    throw new Error(message);
  }
}

export function usePatientIdentifiers(patientUuid: string) {
  const { data, error, isLoading } = useSWR<{ data: { results: Array<PatientIdentifier> } }, Error>(
    `${restBaseUrl}/patient/${patientUuid}/identifier`,
    openmrsFetch,
  );

  const patientIdentifierMap = new Map<string, PatientIdentifier>(
    data?.data?.results.map(
      (identifier) =>
        [(identifier.identifierType as PatientIdentifierType).uuid, identifier] as [string, PatientIdentifier],
    ),
  );

  return {
    data: patientIdentifierMap,
    error,
    isLoading,
  };
}
