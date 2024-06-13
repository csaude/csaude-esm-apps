import { FetchResponse, openmrsFetch, parseDate, toOmrsIsoString } from '@openmrs/esm-framework';
import useSWR from 'swr';
import {
  age,
  ccrTreatment,
  childPresumptiveDiagnosis,
  confidantAddress,
  confidantName,
  confidantPhone,
  familyStatus,
  fichaResumoEncounterTypeUuid,
  fichaResumoForm,
  hivCare,
  hivTest,
  hivTestType,
  hivTestingSite,
  openingDate,
  otherRelationship,
  preTarvBookLine,
  preTarvBookNumber,
  preTarvBookPage,
  relationship,
  relativeName,
  relativeNid,
  tarvBookLine,
  tarvBookNumber,
  tarvBookPage,
  unknownEncounterRole,
} from './constants';
import { type FichaResumoFormData } from './ficha-resumo-form.component';

export interface Concept {
  uuid: string;
  display: string;
  answers?: Concept[];
}

interface Obs {
  uuid: string;
  display: string;
  value: number | string | Date | Concept;
  concept: Concept;
  groupMembers?: Array<Obs>;
}

interface Encounter {
  uuid: string;
  encounterDatetime: string;
  obs: Array<Obs>;
}

interface EncounterData {
  results: Array<Encounter>;
}

export interface FamilyStatus {
  obsUuid: string;
  relativeName?: Obs;
  relationship?: Obs;
  otherRelationship?: Obs;
  age?: Obs;
  hivTest?: Obs;
  hivCare?: Obs;
  ccr?: Obs;
  relativeNid?: Obs;
}

/**
 * Map all family status properties except obsUuid, to respective concept uuids.
 */
type FamilyStatusConcepts = {
  [Property in keyof FamilyStatus as Exclude<Property, 'obsUuid'>]-?: string;
};
const familyStatusConcepts: FamilyStatusConcepts = {
  relativeName,
  relationship,
  otherRelationship,
  age,
  hivTest,
  hivCare,
  ccr: ccrTreatment,
  relativeNid,
};

export interface FichaResumo {
  encounterUuid: string;
  encounterDatetime: Date;
  preTarvBookNumber?: Obs;
  preTarvBookPage?: Obs;
  preTarvBookLine?: Obs;
  tarvBookNumber?: Obs;
  tarvBookPage?: Obs;
  tarvBookLine?: Obs;
  openingDate: Obs;
  confidantName?: Obs;
  confidantRelationship?: Obs;
  confidantPhone1?: Obs;
  confidantPhone2?: Obs;
  confidantAddress?: Obs;
  familyStatus: Array<FamilyStatus>;
  hivTestType?: Obs;
  hivTestingSite?: Obs;
  childPresumptiveDiagnosis?: Obs;
}

type FichaResumoConcepts = {
  [Property in keyof FichaResumo as Exclude<Property, 'encounterUuid' | 'encounterDatetime'>]-?: string;
};

const fichaResumoConcepts: FichaResumoConcepts = {
  preTarvBookNumber,
  preTarvBookPage,
  preTarvBookLine,
  tarvBookNumber,
  tarvBookPage,
  tarvBookLine,
  openingDate,
  confidantName,
  confidantRelationship: relationship,
  confidantPhone1: confidantPhone,
  confidantPhone2: confidantPhone,
  confidantAddress,
  familyStatus,
  hivTestType,
  hivTestingSite,
  childPresumptiveDiagnosis,
};

export function useFichaResumo(patientUuid: string) {
  const representation = 'custom:uuid,encounterDatetime,obs:(uuid,display,value,concept:(uuid,display),groupMembers)';
  const url = `ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${fichaResumoEncounterTypeUuid}&v=${representation}`;

  const { data, error: swrError, isLoading, mutate } = useSWR<{ data: EncounterData }, Error>(url, openmrsFetch);

  let manyEncountersError: Error;
  if (data?.data.results.length > 1) {
    manyEncountersError = new Error('More than one Ficha Resumo');
  }

  const error = manyEncountersError || swrError;

  let fichaResumo: FichaResumo;
  if (data?.data.results[0]) {
    fichaResumo = mapFichaResumo(data.data.results[0]);
  }

  return {
    fichaResumo,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Fetch the concepts required to fill in the Ficha Resumo form.
 */
export function useFichaResumoConcepts() {
  const fetcher = (url: string) =>
    Promise.all([
      openmrsFetch<Concept>(`${url}/${relationship}`),
      openmrsFetch<Concept>(`${url}/${hivTest}`),
      openmrsFetch<Concept>(`${url}/${hivCare}`),
      openmrsFetch<Concept>(`${url}/${ccrTreatment}`),
      openmrsFetch<Concept>(`${url}/${hivTestType}`),
      openmrsFetch<Concept>(`${url}/${hivTestingSite}`),
    ]);

  const { data, error, isLoading } = useSWR(`ws/rest/v1/concept`, fetcher);

  return {
    concepts: data ? new Map(data.map((d) => [d.data.uuid, d.data])) : null,
    isLoading,
    error,
  };
}

export function updateFichaResumo(
  patientUuid: string,
  fichaResumo: FichaResumo,
  formData: FichaResumoFormData,
  dirtyFields: object,
  abortController: AbortController,
) {
  // TODO: Should we update the provider here?

  if (Object.keys(dirtyFields).length === 0) {
    return Promise.resolve([]);
  }

  const obsToUpdate = [];
  const obsToCreate = [];
  const obsToDelete = [];

  const getObsPayload = (concept: Concept, value) => ({
    concept,
    value,
  });

  const exceptObsUuid = (subfiled: string) => subfiled !== 'obsUuid';

  // TODO handle empty submission
  const processObsGroup = (property: string, dirty: Array<object>) => {
    // First time adding an obsgroup
    if (fichaResumo[property].length === 0) {
      dirty.forEach((subfields: object, i) => {
        createObsGroup(property, i, subfields);
      });
    } else {
      // There already exists an obsgroup
      dirty.forEach((subfields: object, i: number) => {
        // Check if obs group has been removed
        if (!formData[property].at(i)) {
          obsToDelete.push({ uuid: fichaResumo[property].at(i).obsUuid });
        } else if (!fichaResumo[property].at(i)) {
          createObsGroup(property, i, subfields);
        } else {
          Object.keys(subfields)
            .filter(exceptObsUuid)
            .forEach((s) => {
              const current = fichaResumo[property][i][s];
              const submitted = formData[property][i][s];
              // There is no current obs for this subfield
              if (!current && submitted) {
                obsToUpdate.push({
                  uuid: fichaResumo[property][i].obsUuid,
                  payload: {
                    groupMembers: [
                      {
                        person: patientUuid,
                        concept: familyStatusConcepts[s],
                        value: getObsValue(submitted),
                        obsDatetime: toOmrsIsoString(new Date()),
                      },
                    ],
                  },
                });
                // There is a current obs
              } else if (current && current.value !== submitted) {
                // Value has been removed
                if (!submitted) {
                  obsToDelete.push({ uuid: current.uuid });
                } else {
                  obsToUpdate.push({
                    uuid: current.uuid,
                    payload: { value: getObsValue(submitted) },
                  });
                }
              }
            });
        }
      });
    }
  };

  const processTopLevelFields = (property: string) => {
    if (!fichaResumo[property]) {
      obsToCreate.push(getObsPayload(fichaResumoConcepts[property], getObsValue(formData[property])));
    } else if (fichaResumo[property].value !== formData[property]) {
      if (!formData[property]) {
        obsToDelete.push({ uuid: fichaResumo[property].uuid });
      } else {
        obsToUpdate.push({
          uuid: fichaResumo[property].uuid,
          payload: { value: getObsValue(formData[property]) },
        });
      }
    }
  };

  Object.entries(dirtyFields).forEach(([property, dirty]) => {
    if (!formData[property] && !fichaResumo[property]) {
      return;
    }

    if (Array.isArray(fichaResumo[property])) {
      processObsGroup(property, dirty);
    } else {
      processTopLevelFields(property);
    }
  });

  const createObsRequest = () =>
    openmrsFetch(`ws/rest/v1/encounter/${fichaResumo.encounterUuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify({ obs: obsToCreate }),
    });

  const updateObsRequests = obsToUpdate.map(({ uuid, payload }) =>
    openmrsFetch(`ws/rest/v1/obs/${uuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify(payload),
    }),
  );

  const deleteObsRequests = obsToDelete.map(({ uuid }) =>
    openmrsFetch(`ws/rest/v1/obs/${uuid}`, {
      method: 'DELETE',
      signal: abortController.signal,
    }),
  );

  const requests = [...updateObsRequests, ...deleteObsRequests];
  if (obsToCreate.length > 0) {
    requests.push(createObsRequest());
  }

  return Promise.all(requests);

  function createObsGroup(property: string, i: number, subfields: object) {
    const groupMembers = Object.keys(subfields)
      .filter(exceptObsUuid)
      .map((s) => {
        const value = formData[property][i][s];
        return value ? getObsPayload(familyStatusConcepts[s], value) : null;
      })
      .filter(Boolean);

    if (groupMembers.length > 0) {
      obsToCreate.push({ concept: familyStatus, groupMembers });
    }
  }
}

function getObsValue(value: string | Date) {
  return value instanceof Date ? toOmrsIsoString(value) : value;
}

export function createFichaResumo(
  patientUuid: string,
  locationUuid: string,
  providerUuid: string,
  formData: FichaResumoFormData,
  abortController: AbortController,
): Promise<FetchResponse<void>> {
  type Payload = {
    patient: string;
    location: string;
    encounterProviders: Array<{
      provider: string;
      encounterRole: string;
    }>;
    encounterType: string;
    form: string;
    obs: Array<{
      concept: string;
      value?: string | number;
      groupMembers?: Array<object>;
    }>;
  };

  const payload: Payload = {
    patient: patientUuid,
    location: locationUuid,
    encounterProviders: [{ provider: providerUuid, encounterRole: unknownEncounterRole }],
    encounterType: fichaResumoEncounterTypeUuid,
    form: fichaResumoForm,
    obs: [
      {
        concept: openingDate,
        value: toOmrsIsoString(formData.openingDate),
      },
    ],
  };

  if (formData.preTarvBookNumber) {
    payload.obs.push({
      concept: preTarvBookNumber,
      value: formData.preTarvBookNumber,
    });
  }
  if (formData.preTarvBookPage) {
    payload.obs.push({
      concept: preTarvBookPage,
      value: formData.preTarvBookPage,
    });
  }
  if (formData.preTarvBookLine) {
    payload.obs.push({
      concept: preTarvBookLine,
      value: formData.preTarvBookLine,
    });
  }
  if (formData.tarvBookNumber) {
    payload.obs.push({
      concept: tarvBookNumber,
      value: formData.tarvBookNumber,
    });
  }
  if (formData.tarvBookPage) {
    payload.obs.push({ concept: tarvBookPage, value: formData.tarvBookPage });
  }
  if (formData.tarvBookLine) {
    payload.obs.push({ concept: tarvBookLine, value: formData.tarvBookLine });
  }
  if (formData.confidantName) {
    payload.obs.push({ concept: confidantName, value: formData.confidantName });
  }
  if (formData.confidantRelationship) {
    payload.obs.push({
      concept: relationship,
      value: formData.confidantRelationship,
    });
  }
  if (formData.confidantPhone1) {
    payload.obs.push({
      concept: confidantPhone,
      value: formData.confidantPhone1,
    });
  }
  if (formData.confidantPhone2) {
    payload.obs.push({
      concept: confidantPhone,
      value: formData.confidantPhone2,
    });
  }
  if (formData.confidantAddress) {
    payload.obs.push({
      concept: confidantAddress,
      value: formData.confidantAddress,
    });
  }

  if (formData.familyStatus[0]) {
    const famStatus = {
      concept: familyStatus,
      groupMembers: Object.entries(formData.familyStatus[0])
        .filter(([, value]) => value !== null)
        .map(([prop, value]) => ({
          concept: familyStatusConcepts[prop],
          value,
        })),
    };

    if (famStatus.groupMembers.length > 0) {
      payload.obs.push(famStatus);
    }
  }

  return openmrsFetch(`ws/rest/v1/encounter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: payload,
  });
}

function mapFichaResumo(encounter: Encounter) {
  // TODO check if parsing for number types is really necessary
  const fichaResumo: FichaResumo = {
    encounterUuid: encounter.uuid,
    encounterDatetime: parseDate(encounter.encounterDatetime),
    openingDate: null,
    familyStatus: [],
  };
  for (const obs of encounter.obs) {
    switch (obs.concept.uuid) {
      case openingDate:
        fichaResumo.openingDate = {
          ...obs,
          value: parseDate(obs.value.toString()),
        };
        break;
      case preTarvBookNumber:
        fichaResumo.preTarvBookNumber = {
          ...obs,
          value: parseInt(obs.value.toString()),
        };
        break;
      case preTarvBookPage:
        fichaResumo.preTarvBookPage = {
          ...obs,
          value: parseInt(obs.value.toString()),
        };
        break;
      case preTarvBookLine:
        fichaResumo.preTarvBookLine = {
          ...obs,
          value: parseInt(obs.value.toString()),
        };
        break;
      case tarvBookNumber:
        fichaResumo.tarvBookNumber = {
          ...obs,
          value: parseInt(obs.value.toString()),
        };
        break;
      case tarvBookPage:
        fichaResumo.tarvBookPage = {
          ...obs,
          value: parseInt(obs.value.toString()),
        };
        break;
      case tarvBookLine:
        fichaResumo.tarvBookLine = {
          ...obs,
          value: parseInt(obs.value.toString()),
        };
        break;
      case confidantName:
        fichaResumo.confidantName = obs;
        break;
      case relationship:
        fichaResumo.confidantRelationship = obs;
        break;
      case confidantPhone:
        if (!fichaResumo.confidantPhone1) {
          fichaResumo.confidantPhone1 = obs;
        } else {
          fichaResumo.confidantPhone2 = obs;
        }
        break;
      case confidantAddress:
        fichaResumo.confidantAddress = obs;
        break;
      case familyStatus:
        fichaResumo.familyStatus.push(mapFamilyStatus(obs));
        break;
      case hivTestType:
        fichaResumo.hivTestType = obs;
        break;
      case hivTestingSite:
        fichaResumo.hivTestingSite = obs;
        break;
      case childPresumptiveDiagnosis:
        fichaResumo.childPresumptiveDiagnosis = obs;
        break;
      default:
        console.info(`Concept ${obs.concept.uuid} has not been mapped in ficha resumo.`);
        break;
    }
  }
  return fichaResumo;
}

function mapFamilyStatus(obs: Obs): FamilyStatus {
  const familyStatus: FamilyStatus = {
    obsUuid: obs.uuid,
    relativeName: null,
    relationship: null,
    otherRelationship: null,
    age: null,
    hivTest: null,
    hivCare: null,
    ccr: null,
    relativeNid: null,
  };
  for (const o of obs.groupMembers) {
    switch (o.concept.uuid) {
      case relativeName:
        familyStatus.relativeName = o;
        break;
      case relationship:
        familyStatus.relationship = o;
        break;
      case otherRelationship:
        familyStatus.otherRelationship = o;
        break;
      case age:
        familyStatus.age = o;
        break;
      case hivTest:
        familyStatus.hivTest = o;
        break;
      case hivCare:
        familyStatus.hivCare = o;
        break;
      case ccrTreatment:
        familyStatus.ccr = o;
        break;
      case relativeNid:
        familyStatus.relativeNid = o;
        break;
      default:
        break;
    }
  }
  return familyStatus;
}
