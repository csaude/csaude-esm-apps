import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Concept } from '../types';

export function useConcept(uuid: string): { isLoading: boolean; error: Error; concept: Concept } {
  const { isLoading, data, error } = useSWR<FetchResponse<Concept>, Error>(`ws/rest/v1/concept/${uuid}`, openmrsFetch);

  return {
    isLoading,
    error,
    concept: data?.data,
  };
}
