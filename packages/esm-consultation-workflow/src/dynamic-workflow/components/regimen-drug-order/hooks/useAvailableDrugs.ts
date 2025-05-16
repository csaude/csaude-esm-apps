import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';

/**
 * A hook that fetches available drugs for a selected regimen
 * @param selectedRegimen - The selected regimen
 * @returns Object containing available drugs, loading state, and error state
 */
export function useAvailableDrugs(selectedRegimen) {
  const { t } = useTranslation();
  const [availableDrugs, setAvailableDrugs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchDrugs = useCallback(async () => {
    if (!selectedRegimen || !isMounted.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.error('Fetching drugs for regimen:', selectedRegimen);
      const response = await openmrsFetch(`/ws/rest/v1/concept/${selectedRegimen.uuid}?v=full`);
      if (response.data && response.data.answers && isMounted.current) {
        setAvailableDrugs(response.data.answers);
      }
    } catch (err) {
      console.error('Error fetching drugs for regimen:', err);
      if (isMounted.current) {
        setError(err);
        showSnackbar({
          title: t('errorLoadingDrugs', 'Error loading drugs'),
          kind: 'error',
          isLowContrast: false,
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [selectedRegimen, t]);

  useEffect(() => {
    isMounted.current = true;
    fetchDrugs();

    return () => {
      isMounted.current = false;
    };
  }, [fetchDrugs]);

  return { availableDrugs, isLoading, error };
}
