import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { REGIMEN_CONCEPT } from '../constants';

/**
 * A hook that fetches available regimens
 * @returns Object containing regimens, loading state, and error state
 */
export function useRegimens() {
  const { t } = useTranslation();
  const [regimens, setRegimens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegimens = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await openmrsFetch(`/ws/rest/v1/concept/${REGIMEN_CONCEPT}?v=full`);
        if (response.data && response.data.answers) {
          setRegimens(response.data.answers);
        }
      } catch (err) {
        console.error('Error fetching regimens:', err);
        setError(err);
        showSnackbar({
          title: t('errorLoadingRegimens', 'Error loading regimens'),
          kind: 'error',
          isLowContrast: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegimens();
  }, [t]);

  return { regimens, isLoading, error };
}
