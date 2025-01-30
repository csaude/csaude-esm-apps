import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

interface FHIRResponse {
  entry: FHIREntry[];
}

interface FHIREntry {
  fullUrl: string;
  resource: {
    id: string;
    clinicalStatus: {
      coding: {
        code: string;
        system: string;
      }[];
    };
    onsetDateTime: string;
    code: {
      text: string;
    };
  };
}

export interface UseObservationsHook {
  isLoading: boolean;
  error: Error;
  observations: FHIREntry[];
  mutate: () => void;
}

export function useObservations(patientUuid: string, observationUuid: string): UseObservationsHook {
  const url = `/ws/fhir2/R4/Observation?subject:Patient=${patientUuid}&code=${observationUuid}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: FHIRResponse }, Error>(url, openmrsFetch);

  return {
    isLoading,
    error,
    observations: data?.data.entry,
    mutate,
  };
}
