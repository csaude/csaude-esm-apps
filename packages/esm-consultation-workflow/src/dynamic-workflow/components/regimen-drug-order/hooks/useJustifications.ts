import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import { ART_CHANGE_JUSTIFICATION_CONCEPT } from '../constants';
import { ErrorType, handleError } from '../utils/error-utils';

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
  const isMounted = useRef(true);

  const fetchJustifications = useCallback(async () => {
    if (changeLine !== 'true' || !isMounted.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await openmrsFetch(`/ws/rest/v1/concept/${ART_CHANGE_JUSTIFICATION_CONCEPT}?v=full`);
      if (response.data && response.data.answers && isMounted.current) {
        setJustifications(response.data.answers);
      }
    } catch (err) {
      console.error('Error fetching line change justifications:', err);
      if (isMounted.current) {
        setError(err);
        handleError(err, t, ErrorType.API_ERROR);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [changeLine, t]);

  useEffect(() => {
    isMounted.current = true;
    fetchJustifications();

    if (changeLine !== 'true' && isMounted.current) {
      // Reset state when changeLine is not 'true'
      setJustifications([]);
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchJustifications, changeLine]);

  return { justifications, isLoading, error };
}
