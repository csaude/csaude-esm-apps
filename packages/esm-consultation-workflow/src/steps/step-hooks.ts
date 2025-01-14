import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface FHIRResponse {
  entry: FHIREntry[];
}

interface FHIREntry {
  fullUrl: string;
  resource: {
    id: string;
    clinicalStatus: boolean;
    code: {
      text: string;
    };
  };
}

export interface UseConditionsHook {
  isLoading: boolean;
  error: Error;
  conditions: FHIREntry[];
  mutate: () => void;
}

export function useConditions(patientUuid: string): UseConditionsHook {
  const url = `/ws/fhir2/R4/Condition?patient=${patientUuid}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: FHIRResponse }, Error>(url, openmrsFetch);

  return {
    isLoading,
    error,
    conditions: data?.data.entry,
    mutate,
  };
}
