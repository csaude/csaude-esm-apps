import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import { ART_CHANGE_JUSTIFICATION_CONCEPT } from '../constants';
import { ErrorType, handleError } from '../utils/error-utils';
import type { RegimenTypeConfig } from '../config/regimen-config';

/**
 * A hook that fetches line change justifications
 * @param changeLine - Boolean flag indicating if line change is selected
 * @returns Object containing justifications, loading state, and error state
 */
export function useJustifications(changeLine: any, config: RegimenTypeConfig) {
  const { t } = useTranslation();
  const [justifications, setJustifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchJustifications = useCallback(async () => {
    // Only fetch if conditions are met
    if (!config.sections.justification || changeLine !== 'true' || !isMounted.current) {
      setJustifications([]);
      setIsLoading(false);
      setError(null);
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
  }, [changeLine, config.sections.justification, t]);

  useEffect(() => {
    isMounted.current = true;
    fetchJustifications();

    return () => {
      isMounted.current = false;
    };
  }, [fetchJustifications]);

  return { justifications, isLoading, error };
}
