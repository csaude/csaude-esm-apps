import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface DataResponse {
  name: string;
  uuid: string;
}

export function useCriteriaValues(uri: string) {
  const url = `${restBaseUrl}/${uri}`;
  const { data, error, isValidating, mutate } = useSWR<{ data: { results: Array<DataResponse> } }, Error>(
    url,
    openmrsFetch,
  );

  const newData =
    data?.data?.results.map((form) => ({
      label: form.name,
      value: form.uuid,
    })) ?? [];

  return {
    data: newData,
    error: error,
    isLoading: (!data && !error) || false,
    isValidating,
    mutate,
  };
}
