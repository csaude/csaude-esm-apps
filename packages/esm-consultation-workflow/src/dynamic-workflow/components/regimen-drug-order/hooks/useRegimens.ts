import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import { ErrorType, handleError } from '../utils/error-utils';

/**
 * A hook that fetches available regimens using SWR
 * @returns Object containing regimens, loading state, and error state
 */
export function useRegimens(regimenConcept: string) {
  const { t } = useTranslation();

  const { data, error, isLoading } = useSWR(
    regimenConcept ? `/ws/rest/v1/concept/${regimenConcept}?v=full` : null,
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

  const regimenError = !regimenConcept ? new Error('Regimen concept is required') : error;

  return {
    regimens: data || [],
    isLoading,
    error: regimenError,
  };
}
