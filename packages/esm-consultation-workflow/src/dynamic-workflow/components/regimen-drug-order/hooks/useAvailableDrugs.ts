import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { ErrorType, handleError } from '../utils/error-utils';

/**
 * A hook that fetches available drugs for a selected regimen using SWR
 * @param selectedRegimen - The selected regimen
 * @returns Object containing available drugs, loading state, and error state
 */
export function useAvailableDrugs(selectedRegimen) {
  const { t } = useTranslation();

  const fetchKey = selectedRegimen ? `/ws/rest/v1/concept/${selectedRegimen.uuid}?v=full` : null;

  const { data, error, isLoading } = useSWR(
    fetchKey,
    async (url) => {
      try {
        console.error('Fetching drugs for regimen:', selectedRegimen);
        const response = await openmrsFetch(url);
        return response.data?.answers || [];
      } catch (err) {
        console.error('Error fetching drugs for regimen:', err);
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

  return { availableDrugs: data || [], isLoading, error };
}
