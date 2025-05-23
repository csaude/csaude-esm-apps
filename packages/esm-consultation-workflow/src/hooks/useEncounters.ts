import { openmrsFetch, restBaseUrl, type Encounter } from '@openmrs/esm-framework';
import useSWR from 'swr';

export function useEncounters(patientUuid: string, obsConceptUuid: string) {
  const url = `${restBaseUrl}/encounter?patient=${patientUuid}&obsConcept=${obsConceptUuid}&v=full`;
  const { data, error, mutate } = useSWR<{ data: { results: Array<Encounter> } }, Error>(url, openmrsFetch);

  return {
    data: data?.data?.results ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    mutate,
  };
}
