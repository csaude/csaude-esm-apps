import { DrugOrderPost } from '@openmrs/esm-patient-common-lib/src';
import { DrugOrderBasketItem } from './types';

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
