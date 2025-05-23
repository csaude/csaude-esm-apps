import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import { THERAPEUTIC_LINE_CONCEPT, DEFAULT_UUIDS } from '../constants';
import { ErrorType, handleError } from '../utils/error-utils';

/**
 * A hook that fetches therapeutic lines
 * @param selectedRegimen - The selected regimen
 * @returns Object containing lines, loading state, error state, and default line
 */
export function useTherapeuticLines(selectedRegimen) {
  const { t } = useTranslation();
  const [lines, setLines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [defaultLine, setDefaultLine] = useState(null);
  const isMounted = useRef(true);

  const fetchLines = useCallback(async () => {
    if (!selectedRegimen || !isMounted.current) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await openmrsFetch(`/ws/rest/v1/concept/${THERAPEUTIC_LINE_CONCEPT}?&v=full`);
      if (response.data && response.data.answers && isMounted.current) {
        setLines(response.data.answers);

        const foundDefaultLine = response.data.answers.find((line) => line.uuid === DEFAULT_UUIDS.DEFAULT_LINE);

        if (foundDefaultLine) {
          setDefaultLine(foundDefaultLine);
        }
      }
    } catch (err) {
      console.error('Error fetching therapeutic lines:', err);
      if (isMounted.current) {
        setError(err);
        handleError(err, t, ErrorType.API_ERROR);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [selectedRegimen, t]);

  useEffect(() => {
    isMounted.current = true;
    fetchLines();

    return () => {
      isMounted.current = false;
    };
  }, [fetchLines]);

  return { lines, isLoading, error, defaultLine };
}
