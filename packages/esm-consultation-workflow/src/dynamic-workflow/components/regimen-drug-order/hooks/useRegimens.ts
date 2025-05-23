import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import { REGIMEN_CONCEPT } from '../constants';
import { ErrorType, handleError } from '../utils/error-utils';

/**
 * A hook that fetches available regimens using SWR
 * @returns Object containing regimens, loading state, and error state
 */
export function useRegimens() {
  const { t } = useTranslation();

  const { data, error, isLoading } = useSWR(
    `/ws/rest/v1/concept/${REGIMEN_CONCEPT}?v=full`,
    async (url) => {
      try {
        const response = await openmrsFetch(url);
        return response.data?.answers || [];
      } catch (err) {
        console.error('Error fetching regimens:', err);
        handleError(err, t, ErrorType.API_ERROR);
        throw err;
      }
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    regimens: data || [],
    isLoading,
    error,
  };
}
