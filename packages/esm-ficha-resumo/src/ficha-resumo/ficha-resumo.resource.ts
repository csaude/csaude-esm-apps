import {
  FetchResponse,
  openmrsFetch,
  parseDate,
  toOmrsIsoString,
} from "@openmrs/esm-framework";
import useSWR from "swr";
import {
  age,
  ccrTreatment,
  confidantAddress,
  confidantName,
  confidantPhone,
  familyStatus,
  fichaResumoEncounterTypeUuid,
  fichaResumoForm,
  hivCare,
  hivTest,
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
} from "./constants";
import { type FichaResumoFormData } from "./ficha-resumo-form.component";

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

interface FamilyStatus {
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
  [Property in keyof FamilyStatus as Exclude<Property, "obsUuid">]-?: string;
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
}

type FichaResumoConcepts = {
  [Property in keyof FichaResumo as Exclude<
    Property,
    "encounterUuid" | "encounterDatetime"
  >]-?: string;
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
};

export function useFichaResumo(patientUuid: string) {
  const representation =
    "custom:uuid,encounterDatetime,obs:(uuid,display,value,concept:(uuid,display),groupMembers)";
  const url = `ws/rest/v1/encounter?patient=${patientUuid}&encounterType=${fichaResumoEncounterTypeUuid}&v=${representation}`;

  const {
    data,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<{ data: EncounterData }, Error>(url, openmrsFetch);

  let manyEncountersError: Error;
  if (data?.data.results.length > 1) {
    manyEncountersError = new Error("More than one Ficha Resumo");
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
      default:
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
  abortController: AbortController
) {
  // TODO: Should we update the provider here?

  const obsToUpdate = [];
  const obsToCreate = [];

  // Iterate over all touched form fields
  for (const [property, dirty] of Object.entries(dirtyFields)) {
    // Skip this dirty field if there is no value
    if (!formData[property]) {
      break;
    }

    // Handle family status obs group in a generic manner
    if (fichaResumo[property] instanceof Array) {
      // First time adding family status obsgroup
      if (fichaResumo.familyStatus.length === 0) {
        for (const [i, subfields] of dirty.entries()) {
          const groupMembers = [];
          for (const s of Object.keys(subfields)) {
            const value = formData[property].at(i)[s];
            if (value) {
              groupMembers.push({
                concept: familyStatusConcepts[s],
                value,
              });
            }
          }
          if (groupMembers.length > 0) {
            obsToCreate.push({
              concept: familyStatus,
              groupMembers,
            });
          }
        }
        break;
      }
      // There already exists a family status obsgroup
      for (const [i, subfields] of dirty.entries()) {
        for (const s of Object.keys(subfields)) {
          const current: Obs = fichaResumo[property].at(i)[s];
          const updated = formData[property].at(i)[s];
          // There is no current obs for this subfield
          if (!current) {
            obsToUpdate.push({
              uuid: fichaResumo[property].at(i).obsUuid,
              payload: {
                groupMembers: [
                  {
                    person: patientUuid,
                    concept: familyStatusConcepts[s],
                    value: getObsValue(updated),
                    obsDatetime: toOmrsIsoString(new Date()),
                  },
                ],
              },
            });
            // There is a current obs
          } else if (current.value !== updated) {
            obsToUpdate.push({
              uuid: current.uuid,
              payload: { value: getObsValue(updated) },
            });
          }
        }
      }
    } else {
      // Handle top-level ficha resumo fields
      if (!fichaResumo[property]) {
        obsToCreate.push({
          concept: fichaResumoConcepts[property],
          value: getObsValue(formData[property]),
        });
      } else if (fichaResumo[property].value !== formData[property]) {
        obsToUpdate.push({
          uuid: fichaResumo[property].uuid,
          payload: { value: getObsValue(formData[property]) },
        });
      }
    }
  }

  const requests = obsToUpdate.map(({ uuid, payload }) =>
    openmrsFetch(`ws/rest/v1/obs/${uuid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController.signal,
      body: JSON.stringify(payload),
    })
  );

  if (obsToCreate.length > 0) {
    const create = openmrsFetch(
      `ws/rest/v1/encounter/${fichaResumo.encounterUuid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortController.signal,
        body: JSON.stringify({
          obs: obsToCreate.map((obs) => obs),
        }),
      }
    );
    requests.push(create);
  }

  // TODO: One of the requests might fail, leaving the ficha resumo partially
  // updated. Decide how to handle these cases.
  return Promise.all(requests);
}

function getObsValue(value: string | Date) {
  return value instanceof Date ? toOmrsIsoString(value) : value;
}

export function createFichaResumo(
  patientUuid: string,
  locationUuid: string,
  providerUuid: string,
  formData: FichaResumoFormData,
  abortController: AbortController
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
    encounterProviders: [
      { provider: providerUuid, encounterRole: unknownEncounterRole },
    ],
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

  // TODO: set provider
  return openmrsFetch(`ws/rest/v1/encounter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: payload,
  });
}
