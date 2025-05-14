import { useState, useEffect } from 'react';
import { DISPENSE_TYPES, AllowedDurationUnitType } from '../constants';

/**
 * A hook that provides dispense types
 * @param finalDuration - The final duration selected
 * @returns Object containing dispense types and loading state
 */
export function useDispenseTypes(finalDuration: AllowedDurationUnitType | null) {
  const [dispenseTypes, setDispenseTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      if (finalDuration) {
        setDispenseTypes(DISPENSE_TYPES.filter((type) => finalDuration.allowedDispenseTypes?.includes(type.uuid)));
      } else {
        setDispenseTypes(DISPENSE_TYPES);
      }
    } catch (error) {
      console.error('Error setting dispense types:', error);
    } finally {
      setIsLoading(false);
    }
  }, [finalDuration]);

  return { dispenseTypes, isLoading };
}
