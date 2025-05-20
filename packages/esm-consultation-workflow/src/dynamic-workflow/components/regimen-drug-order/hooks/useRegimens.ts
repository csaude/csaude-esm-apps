import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import { REGIMEN_CONCEPT } from '../constants';
import { ErrorType, handleError } from '../utils/error-utils';

/**
 * A hook that fetches available regimens
 * @returns Object containing regimens, loading state, and error state
 */
export function useRegimens() {
  const { t } = useTranslation();
  const [regimens, setRegimens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  // Use memoized fetch function to prevent re-creation on every render
  const fetchRegimens = useCallback(async () => {
    if (!isMounted.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await openmrsFetch(`/ws/rest/v1/concept/${REGIMEN_CONCEPT}?v=full`);
      if (response.data && response.data.answers && isMounted.current) {
        setRegimens(response.data.answers);
      }
    } catch (err) {
      console.error('Error fetching regimens:', err);
      if (isMounted.current) {
        setError(err);
        handleError(err, t, ErrorType.API_ERROR);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [t]);

  useEffect(() => {
    isMounted.current = true;
    fetchRegimens();

    return () => {
      isMounted.current = false;
    };
  }, [fetchRegimens]);

  return { regimens, isLoading, error };
}
