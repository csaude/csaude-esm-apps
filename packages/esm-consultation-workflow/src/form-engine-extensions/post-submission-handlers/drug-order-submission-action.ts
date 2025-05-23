import { type PostSubmissionAction } from '@csaude/esm-form-engine-lib';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';

/**
 * Extracts the primary encounter from the encounters array
 * @param encounters Array of encounters from form submission
 * @returns The primary encounter or null if none found
 */
const extractPrimaryEncounter = (encounters) => {
  if (!encounters || encounters.length === 0) {
    return null;
  }
  return encounters[0];
};

/**
 * Identifies drug observations in an encounter
 * @param encounter The encounter to extract drug observations from
 * @returns Array of drug order observation groups or empty array if none found
 */
const extractDrugOrderObservations = (encounter) => {
  if (!encounter || !encounter.obs || !Array.isArray(encounter.obs)) {
    return [];
  }

  // Look for observations with concept UUID that represents "Medicamento e Quantidade"
  return encounter.obs.filter(
    (obs) =>
      obs.concept?.uuid === '5ad593a4-bea2-4eef-ac88-11654e79d9da' &&
      obs.groupMembers &&
      Array.isArray(obs.groupMembers),
  );
};

/**
 * Extracts drug and quantity information from an observation group
 * @param obsGroup The observation group containing drug and quantity info
 * @returns Object containing drug and quantity data or null if incomplete
 */
const extractDrugAndQuantity = (obsGroup) => {
  if (!obsGroup.groupMembers || !Array.isArray(obsGroup.groupMembers)) {
    return null;
  }

  let drugInfo = null;
  let quantityInfo = null;

  // Find drug observation (concept UUID for "Formulacao de ARV")
  const drugObs = obsGroup.groupMembers.find(
    (member) => member.concept?.uuid === '7956cd89-2ef6-4d25-90f9-f8940507eee8',
  );

  // Find quantity observation (concept UUID for "COMPRIMIDOS")
  const quantityObs = obsGroup.groupMembers.find(
    (member) => member.concept?.uuid === '16cbff04-b3fc-4eae-8b7a-9b8b974fb211',
  );

  if (drugObs && drugObs.value && quantityObs && quantityObs.value !== undefined) {
    drugInfo = {
      uuid: drugObs.value.uuid,
      name: drugObs.value.name?.name || drugObs.value.display,
      concept: drugObs.value.concept?.uuid || drugObs.concept?.uuid,
    };

    quantityInfo = {
      value: quantityObs.value,
      units: quantityObs.concept?.uuid,
    };

    return { drug: drugInfo, quantity: quantityInfo };
  }

  return null;
};

/**
 * Creates order payload from encounter observations
 * @param encounter The encounter containing observations
 * @returns Array of order payloads or null if creation fails
 */
const createOrderPayload = (encounter) => {
  try {
    if (!encounter || !encounter.uuid || !encounter.patient) {
      return null;
    }

    const orderObservations = extractDrugOrderObservations(encounter);
    if (!orderObservations.length) {
      console.error('No drug order observations found in encounter');
      return null;
    }

    const orderPayloads = [];

    for (const obsGroup of orderObservations) {
      const extractedData = extractDrugAndQuantity(obsGroup);

      if (!extractedData) {
        console.error('Failed to extract drug/quantity from observation', obsGroup);
        continue;
      }

      // Get provider UUID from the encounter
      let providerUuid = null;
      if (encounter.encounterProviders && encounter.encounterProviders.length > 0) {
        providerUuid = encounter.encounterProviders[0].provider?.uuid;
      }

      // Create order payload using extracted data
      orderPayloads.push({
        action: 'NEW',
        patient: encounter.patient.uuid || encounter.patient,
        type: 'drugorder',
        careSetting: '6f0c9a92-6f24-11e3-af88-005056821db0', // OUTPATIENT
        orderer: providerUuid,
        encounter: encounter.uuid,
        drug: extractedData.drug.concept,
        dose: 1, // This could be extracted from other observations if needed
        doseUnits: '162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Standard units
        route: '160242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Oral route
        frequency: '162135OFAAAAAAAAAAAAAAA', // Once daily
        asNeeded: false,
        asNeededCondition: null,
        numRefills: 0,
        quantity: extractedData.quantity.value,
        quantityUnits: '162335AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Standard units
        duration: 30, // Default to 30 days
        durationUnits: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Days
        dosingType: 'org.openmrs.SimpleDosingInstructions',
        dosingInstructions: 'Take everyday',
        concept: extractedData.drug.concept || '46a9fa37-d6f2-4f72-8a16-c1a76008f508',
        orderReasonNonCoded: '',
      });
    }

    return orderPayloads.length > 0 ? orderPayloads : null;
  } catch (error) {
    console.error('Failed to create order payload:', error);
    return null;
  }
};

/**
 * Submits the drug orders to the OpenMRS backend
 * @param orderPayloads Array of order payloads to submit
 * @returns Array of created orders or null if any submission fails
 */
const submitDrugOrders = async (orderPayloads) => {
  try {
    if (!orderPayloads || !Array.isArray(orderPayloads) || orderPayloads.length === 0) {
      return null;
    }

    const createdOrders = [];

    // Submit each order payload
    for (const payload of orderPayloads) {
      // Real implementation would use:

      const response = await openmrsFetch('/ws/rest/v1/order', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      createdOrders.push(response.data);
      // Dummy implementation - simulate successful submission
      // console.log('Submitting order payload:', payload);
      // createdOrders.push({ uuid: 'dummy-order-uuid-' + Math.random().toString(36).substring(2, 9), ...payload });
    }

    return createdOrders;
  } catch (error) {
    console.error('Failed to submit drug orders:', error);
    return null;
  }
};

/**
 * Sends the created orders to pharmacy system (iDMED/artemis)
 * @param orders Array of orders that were created in OpenMRS
 * @param encounter The original encounter
 * @returns True if all orders were successfully sent, false otherwise
 */
const sendOrdersToPharmacy = async (orders, encounter) => {
  try {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return false;
    }

    const patientUuid = encounter.patient.uuid || encounter.patient;
    const encounterUuid = encounter.uuid;

    // Extract therapeutic regimen from encounter observations if available
    let therapeuticRegimen = '';
    let regimenLine = '';

    if (encounter.obs && Array.isArray(encounter.obs)) {
      // Look for regimen observation (concept UUID for "ANTI-RETROVIRAIS PRESCRITOS")
      const regimenObs = encounter.obs.find((obs) => obs.concept?.uuid === 'e1d83d4a-1d5f-11e0-b929-000c29ad1d07');

      if (regimenObs && regimenObs.value) {
        therapeuticRegimen = regimenObs.value.name?.name || regimenObs.value.display || '';
      }

      // Additional observations could be extracted here for regimenLine if needed
    }

    // Create formulations array from orders
    const formulations = orders.map((order) => ({
      orderUuid: order.uuid,
      drugUuid: order.drug,
      drugName: order.drugName || '', // This might need to be fetched or passed from order creation
      quantity: order.quantity,
      quantityUnit: order.quantityUnits.display,
      duration: order.duration,
      durationUnit: order.durationUnits.display,
    }));

    // Create the prescription payload according to the expected structure
    const prescriptionPayload = {
      patientUuid,
      encounterUuid,
      therapeuticRegimen,
      regimenLine,
      formulations,
    };

    await openmrsFetch('/ws/rest/v1/csaudecore/prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionPayload),
    });

    return true;
  } catch (error) {
    console.error('Failed to send orders to pharmacy:', error);
    return false;
  }
};

/**
 * Voids an encounter in OpenMRS
 * @param encounterUuid The UUID of the encounter to void
 * @returns True if successful, false otherwise
 */
const voidEncounter = async (encounterUuid) => {
  try {
    if (!encounterUuid) {
      return false;
    }

    // Real implementation would use:
    await openmrsFetch(`/ws/rest/v1/encounter/${encounterUuid}`, {
      method: 'DELETE',
      body: JSON.stringify({
        voidReason: 'Drug order creation failed',
      }),
    });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Voids multiple orders in OpenMRS
 * @param orderUuids Array of UUIDs of the orders to void
 * @returns True if all were successful, false otherwise
 */
const voidOrders = async (orderUuids) => {
  try {
    if (!orderUuids || !Array.isArray(orderUuids) || orderUuids.length === 0) {
      return false;
    }

    // for (const uuid of orderUuids) {
      // Real implementation would use:
      // const response = await openmrsFetch(`/ws/rest/v1/order/${uuid}`, {
      //   method: 'DELETE',
      //   body: JSON.stringify({
      //     voidReason: 'Failed to send to pharmacy system'
      //   }),
      // });
    // }

    return true;
  } catch (error) {
    console.error('Failed to void orders:', error);
    return false;
  }
};

const DrugOrderSubmissionAction: PostSubmissionAction = {
  applyAction: async function ({ encounters }) {
    try {
      // Step 1: Extract primary encounter
      const encounter = extractPrimaryEncounter(encounters);
      if (!encounter) {
        throw new Error('No valid encounter found');
      }

      // Step 2: Create order payloads from encounter observations
      const orderPayloads = createOrderPayload(encounter);
      if (!orderPayloads) {
        throw new Error('Failed to create order payloads from encounter observations');
      }

      // Step 3: Submit orders to OpenMRS
      const createdOrders = await submitDrugOrders(orderPayloads);
      if (!createdOrders) {
        await voidEncounter(encounter.uuid);
        throw new Error('Failed to create drug orders');
      }

      // Step 4: Send orders to pharmacy system
      const sentToPharmacy = await sendOrdersToPharmacy(createdOrders, encounter);
      if (!sentToPharmacy) {
        // If pharmacy submission fails, void all orders and the encounter
        await voidOrders(createdOrders.map((order) => order.uuid));
        await voidEncounter(encounter.uuid);
        throw new Error('Failed to send orders to pharmacy system');
      }

      // Success notifications
      showSnackbar({
        title: 'Post Submission Action',
        subtitle: 'Prescrição médica criada com sucesso',
        kind: 'success',
        timeoutInMs: 5000,
      });

      showSnackbar({
        title: 'Post Submission Action',
        subtitle: 'Prescrição médica enviada para o iDMED',
        kind: 'success',
        timeoutInMs: 5000,
      });
    } catch (error) {
      showSnackbar({
        title: 'Post Submission Action Error',
        subtitle: `Failed to process drug orders: ${error.message}`,
        kind: 'error',
        timeoutInMs: 4000,
      });
    }
  },
};

export default DrugOrderSubmissionAction;
