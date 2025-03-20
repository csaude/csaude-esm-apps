import { FetchResponse, openmrsFetch, PatientIdentifierType, restBaseUrl } from '@openmrs/esm-framework';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import map from 'lodash-es/map';
import uniqBy from 'lodash-es/uniqBy';
import useSWR from 'swr';
import {
  ProgramEnrollment,
  type PatientIdentifier,
  type PatientProgram,
  type Program,
  type ProgramWorkflowState,
} from '../types';

type PatientIdentifierSource = {
  uuid: string;
};

// TODO load this configuration from the backend
const identifierSourceMap = new Map<string, [PatientIdentifierType, PatientIdentifierSource]>([
  // PREP
  [
    'ac7c5d2b-854a-48c4-a68f-0b8a92e11f4a',
    [{ uuid: 'bce7c891-27e9-42ec-abb0-aec3a641175e' }, { uuid: '99408167-97eb-47bb-966b-92324b0e4b7c' }],
  ],
  // TARV
  [
    'efe2481f-9e75-4515-8d5a-86bfde2b5ad3',
    [{ uuid: 'e2b966d0-1d5f-11e0-b929-000c29ad1d07' }, { uuid: '3d588067-790b-45af-8128-a6c1ffb52883' }],
  ],
  // CCR
  [
    '611f0a6b-68b7-4de7-bc7a-fd021330eef8',
    [{ uuid: 'e2b97b70-1d5f-11e0-b929-000c29ad1d07' }, { uuid: 'e930ed89-506b-41eb-8161-36c571edb363' }],
  ],
]);

export function getIdentifierTypeAndSource(program: string) {
  return identifierSourceMap.get(program);
}

export function hasIdentifier(program: string) {
  return identifierSourceMap.has(program);
}

// prettier-ignore
// eslint-disable-next-line prettier/prettier
export const customRepresentation =
  `custom:(
  patientProgram:(uuid,display,program,dateEnrolled,dateCompleted,
  location:(uuid,display),
  states:(startDate,endDate,voided,
    state:(uuid,
    concept:(uuid,display)))),
  patientIdentifier:(uuid,identifier,identifierType:(uuid,display))`;

export function useEnrollments(patientUuid: string) {
  const enrollmentsUrl = `${restBaseUrl}/csaudecore/programenrollment?patient=${patientUuid}&v=${customRepresentation.replace(/\s/g, '')}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    FetchResponse<{ results: ProgramEnrollment[] }>,
    Error
  >(patientUuid ? enrollmentsUrl : null, openmrsFetch);

  const formattedEnrollments =
    data?.data?.results.length > 0
      ? data?.data.results.sort((a, b) => (b.patientProgram.dateEnrolled > a.patientProgram.dateEnrolled ? 1 : -1))
      : null;

  const activeEnrollments = formattedEnrollments?.filter((enrollment) => !enrollment.patientProgram.dateCompleted);
  const unique: ProgramEnrollment[] = uniqBy(
    formattedEnrollments,
    (enrollment: ProgramEnrollment) => enrollment?.patientProgram.program?.uuid,
  );
  return {
    data: data ? unique : null,
    error,
    isLoading,
    isValidating,
    activeEnrollments,
    mutateEnrollments: mutate,
  };
}

export function useExistingPatientIdentifier(patientUuid: string, programUuid: string) {
  const enrollmentsUrl = `${restBaseUrl}/patient/${patientUuid}/identifier`;
  const identifierTypeAndSource = getIdentifierTypeAndSource(programUuid);
  const key = patientUuid && identifierTypeAndSource ? enrollmentsUrl : null;
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: PatientIdentifier[] }>, Error>(key, openmrsFetch);
  const identifierType = identifierTypeAndSource?.at(0);
  const sameTypeIdentifiers = data?.data?.results.filter(
    (identifier) => (identifier.identifierType as PatientIdentifierType)?.uuid === identifierType?.uuid,
  );
  const preferredIdentifier = sameTypeIdentifiers?.find((identifier) => identifier.preferred);
  const previousIdentifier = preferredIdentifier || sameTypeIdentifiers?.at(0);
  return {
    data: previousIdentifier,
    error,
    isLoading,
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

export async function createProgramEnrollment(payload, existingIdentifier: PatientIdentifier, abortController) {
  if (!payload) {
    return null;
  }
  const { program, patient, dateEnrolled, dateCompleted, location, states, identifier } = payload;

  try {
    return await openmrsFetch(`${restBaseUrl}/csaudecore/programenrollment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientProgram: { program, patient, dateEnrolled, dateCompleted, location, states },
        patientIdentifier: { ...(!!existingIdentifier && { uuid: existingIdentifier.uuid }), identifier },
      },
      signal: abortController.signal,
    });
  } catch (error) {
    const message = error.responseBody.error.message;
    throw new Error(message);
  }
}

export async function updateProgramEnrollment(
  currentEnrollment: ProgramEnrollment,
  existingIdentifier: PatientIdentifier,
  payload,
  abortController,
) {
  if (!payload && !payload.program) {
    return null;
  }
  const { dateEnrolled, dateCompleted, location, identifier, states } = payload;

  let patientIdentifier = {};
  if (currentEnrollment?.patientIdentifier) {
    patientIdentifier = { patientIdentifier: { uuid: currentEnrollment.patientIdentifier.uuid, identifier } };
  } else if (existingIdentifier) {
    patientIdentifier = { patientIdentifier: { uuid: existingIdentifier.uuid, identifier } };
  }

  const body = {
    patientProgram: { uuid: currentEnrollment.patientProgram.uuid, dateEnrolled, dateCompleted, location, states },
    ...patientIdentifier,
  };

  try {
    return await openmrsFetch(`${restBaseUrl}/csaudecore/programenrollment/${currentEnrollment.patientProgram.uuid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      signal: abortController.signal,
    });
  } catch (error) {
    const message = error.responseBody.error.message;
    throw new Error(message);
  }
}

export const usePrograms = (patientUuid: string) => {
  const {
    data: enrollments,
    error: enrollError,
    isLoading: enrolLoading,
    isValidating,
    activeEnrollments,
  } = useEnrollments(patientUuid);
  const { data: availablePrograms, eligiblePrograms } = useAvailablePrograms(
    enrollments ? enrollments.map(({ patientProgram }) => patientProgram) : null,
  );

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
