import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface FHIRResponse {
  total: number;
  entry: FHIREntry[];
}

export interface FHIREntry {
  fullUrl: string;
  resource: ObservationResource;
}

interface ObservationResource {
  resourceType: string;
  id: string;
  status: string;
  effectiveDateTime: string;
  code: Code;
  valueQuantity?: ValueQuantity;
  valueCodeableConcept?: Code;
  encounter: {
    reference: string;
    type: string;
  };
}

interface Code {
  text: string;
  coding: {
    code: string;
    display: string;
  }[];
}

interface ValueQuantity {
  value: number;
  unit: string;
}

export interface UseObsHook {
  isLoading: boolean;
  error: Error;
  obs: FHIREntry[];
  mutate: () => void;
}

export const pageSize = 100;

export function useObs(patientUuid: string, observationUuid: string): UseObsHook {
  const url = `/ws/fhir2/R4/Observation?subject:Patient=${patientUuid}&code=${observationUuid}&_summary=data&_sort=-date&_count=${pageSize}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: FHIRResponse }, Error>(url, openmrsFetch);

  return {
    isLoading,
    error,
    obs: data?.data.total > 0 ? data?.data.entry : [],
    mutate,
  };
}

export function organizeEntries(entries: FHIREntry[]): { encounterReference: string; entries: FHIREntry[] }[] {
  /*
   * This function Groups entries by encounter reference
   * For each grouped encounter, sort entries by effective date in descending order
   * Return the final array of grouped and sorted entries
   */
  const groupedEntries = entries.reduce(
    (acc, entry) => {
      const reference = entry.resource.encounter.reference;
      if (!acc[reference]) {
        acc[reference] = [];
      }
      acc[reference].push(entry);
      return acc;
    },
    {} as { [key: string]: FHIREntry[] },
  );
  const organizedArray = Object.keys(groupedEntries).map((reference) => {
    const sortedEntries = groupedEntries[reference].sort(
      (a, b) => new Date(b.resource.effectiveDateTime).getTime() - new Date(a.resource.effectiveDateTime).getTime(),
    );
    return { encounterReference: reference, entries: sortedEntries };
  });
  return organizedArray;
}
