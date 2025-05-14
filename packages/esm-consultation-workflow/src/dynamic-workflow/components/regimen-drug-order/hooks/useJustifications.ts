import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { ART_CHANGE_JUSTIFICATION_CONCEPT } from '../constants';

/**
 * A hook that fetches line change justifications
 * @param changeLine - Boolean flag indicating if line change is selected
 * @returns Object containing justifications, loading state, and error state
 */
export function useJustifications(changeLine) {
  const { t } = useTranslation();
  const [justifications, setJustifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (changeLine === 'true') {
      const fetchJustifications = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await openmrsFetch(`/ws/rest/v1/concept/${ART_CHANGE_JUSTIFICATION_CONCEPT}?v=full`);
          if (response.data && response.data.answers) {
            setJustifications(response.data.answers);
          }
        } catch (err) {
          console.error('Error fetching line change justifications:', err);
          setError(err);
          showSnackbar({
            title: t('errorLoadingJustifications', 'Error loading justifications'),
            kind: 'error',
            isLowContrast: false,
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchJustifications();
    } else {
      // Reset state when changeLine is not 'true'
      setJustifications([]);
    }
  }, [changeLine, t]);

  return { justifications, isLoading, error };
}
