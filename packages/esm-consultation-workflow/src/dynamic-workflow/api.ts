import { DrugOrderPost, useSystemVisitSetting, useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { DrugOrderBasketItem } from './types';
import { type FetchResponse, openmrsFetch, type OpenmrsResource, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { useMemo } from 'react';

// Copied from patient-orders because it is not exported from patient-commons-lib
export function prepMedicationOrderPostData(
  order: DrugOrderBasketItem,
  patientUuid: string,
  encounterUuid: string | null,
): DrugOrderPost {
  if (order.action === 'NEW' || order.action === 'RENEW') {
    return {
      action: 'NEW',
      patient: patientUuid,
      type: 'drugorder',
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      drug: order.drug.uuid,
      dose: order.dosage,
      doseUnits: order.unit?.valueCoded,
      route: order.route?.valueCoded,
      frequency: order.frequency?.valueCoded,
      asNeeded: order.asNeeded,
      asNeededCondition: order.asNeededCondition,
      numRefills: order.numRefills,
      quantity: order.pillsDispensed,
      quantityUnits: order.quantityUnits?.valueCoded,
      duration: order.duration,
      durationUnits: order.durationUnit?.valueCoded,
      dosingType: order.isFreeTextDosage
        ? 'org.openmrs.FreeTextDosingInstructions'
        : 'org.openmrs.SimpleDosingInstructions',
      dosingInstructions: order.isFreeTextDosage ? order.freeTextDosage : order.patientInstructions,
      concept: order.drug.concept.uuid,
      orderReasonNonCoded: order.indication,
    };
  } else if (order.action === 'REVISE') {
    return {
      action: 'REVISE',
      patient: patientUuid,
      type: 'drugorder',
      previousOrder: order.previousOrder,
      careSetting: order.careSetting,
      orderer: order.orderer,
      encounter: encounterUuid,
      drug: order.drug.uuid,
      dose: order.dosage,
      doseUnits: order.unit?.valueCoded,
      route: order.route?.valueCoded,
      frequency: order.frequency?.valueCoded,
      asNeeded: order.asNeeded,
      asNeededCondition: order.asNeededCondition,
      numRefills: order.numRefills,
      quantity: order.pillsDispensed,
      quantityUnits: order.quantityUnits?.valueCoded,
      duration: order.duration,
      durationUnits: order.durationUnit?.valueCoded,
      dosingType: order.isFreeTextDosage
        ? 'org.openmrs.FreeTextDosingInstructions'
        : 'org.openmrs.SimpleDosingInstructions',
      dosingInstructions: order.isFreeTextDosage ? order.freeTextDosage : order.patientInstructions,
      concept: order?.drug?.concept?.uuid,
      orderReasonNonCoded: order.indication,
    };
  } else if (order.action === 'DISCONTINUE') {
    return {
      action: 'DISCONTINUE',
      type: 'drugorder',
      previousOrder: order.previousOrder,
      patient: patientUuid,
      careSetting: order.careSetting,
      encounter: encounterUuid,
      orderer: order.orderer,
      concept: order.drug.concept.uuid,
      drug: order.drug.uuid,
      orderReasonNonCoded: null,
    };
  } else {
    throw new Error(`Unknown order action ${order.action}. This is a development error.`);
  }
}

// Copied from patient-orders because it is not exported from patient-commons-lib
export function useOrderEncounter(patientUuid: string): {
  activeVisitRequired: boolean;
  isLoading: boolean;
  error: Error;
  encounterUuid: string;
  mutate: Function;
} {
  const { systemVisitEnabled, isLoadingSystemVisitSetting, errorFetchingSystemVisitSetting } = useSystemVisitSetting();

  const now = new Date();
  const nowDateString = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const todayEncounter = useSWR<FetchResponse<{ results: Array<OpenmrsResource> }>, Error>(
    !isLoadingSystemVisitSetting && !systemVisitEnabled && patientUuid
      ? `${restBaseUrl}/encounter?patient=${patientUuid}&fromdate=${nowDateString}&limit=1`
      : null,
    openmrsFetch,
  );
  const visit = useVisitOrOfflineVisit(patientUuid);

  const results = useMemo(() => {
    if (isLoadingSystemVisitSetting || errorFetchingSystemVisitSetting) {
      return {
        activeVisitRequired: false,
        isLoading: isLoadingSystemVisitSetting,
        error: errorFetchingSystemVisitSetting,
        encounterUuid: null,
        mutate: () => {},
      };
    }
    return systemVisitEnabled
      ? {
          activeVisitRequired: true,
          isLoading: visit?.isLoading,
          encounterUuid: visit?.currentVisit?.encounters?.[0]?.uuid,
          error: visit?.error,
          mutate: visit?.mutate,
        }
      : {
          activeVisitRequired: false,
          isLoading: todayEncounter?.isLoading,
          encounterUuid: todayEncounter?.data?.data?.results?.[0]?.uuid,
          error: todayEncounter?.error,
          mutate: todayEncounter?.mutate,
        };
  }, [isLoadingSystemVisitSetting, errorFetchingSystemVisitSetting, visit, todayEncounter, systemVisitEnabled]);
  return results;
}
