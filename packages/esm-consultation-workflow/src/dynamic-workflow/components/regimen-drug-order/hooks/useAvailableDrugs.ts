import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedRegimen) {
      const fetchDrugs = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await openmrsFetch(`/ws/rest/v1/concept/${selectedRegimen.uuid}?v=full`);
          if (response.data && response.data.answers) {
            setAvailableDrugs(response.data.answers);
          }
        } catch (err) {
          console.error('Error fetching drugs for regimen:', err);
          setError(err);
          showSnackbar({
            title: t('errorLoadingDrugs', 'Error loading drugs'),
            kind: 'error',
            isLowContrast: false,
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchDrugs();
    } else {
      // Reset state when regimen is not selected
      setAvailableDrugs([]);
    }
  }, [selectedRegimen, t]);

  return { availableDrugs, isLoading, error };
}
