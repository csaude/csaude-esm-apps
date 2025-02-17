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

export function useObs(patientUuid: string, observationUuid: string): UseObsHook {
  const url = `/ws/fhir2/R4/Observation?subject:Patient=${patientUuid}&code=${observationUuid}&_summary=data&_sort=-date&_count=100`;
  const { data, error, isLoading, mutate } = useSWR<{ data: FHIRResponse }, Error>(url, openmrsFetch);

  return {
    isLoading,
    error,
    obs: data?.data.total > 0 ? data?.data.entry : [],
    mutate,
  };
}
