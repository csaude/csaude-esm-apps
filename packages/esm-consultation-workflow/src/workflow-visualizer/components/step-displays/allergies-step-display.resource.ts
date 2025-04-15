import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface Link {
  rel: string;
  uri: string;
  resourceAlias: string;
}

export interface Concept {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Reaction {
  reaction: Concept;
  reactionNonCoded: string | null;
}

export interface Patient {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Allergen {
  allergenType: string;
  codedAllergen: Concept;
  nonCodedAllergen: string | null;
}

export interface Allergy {
  display: string;
  uuid: string;
  allergen: Allergen;
  severity: Concept;
  comment: string | null;
  reactions: Array<Reaction>;
  patient: Patient;
  links: Link[];
  resourceVersion: string;
}

export interface AllergiesResponse {
  results: Array<Allergy>;
}

export async function fetchPatientAllergies(patientUuid: string): Promise<AllergiesResponse> {
  const response = await openmrsFetch<AllergiesResponse>(`${restBaseUrl}/patient/${patientUuid}/allergy`);
  return response.data;
}

export function filterAllergiesByUuids(allergies: Array<Allergy>, uuids: Array<string>): Array<Allergy> {
  if (!Array.isArray(uuids) || uuids.length === 0) {
    return [];
  }

  return allergies.filter((allergy) => uuids.includes(allergy.uuid));
}
