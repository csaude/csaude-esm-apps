import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Form,
  FormGroup,
  RadioButtonGroup,
  RadioButton,
  Select,
  SelectItem,
  Button,
  InlineLoading,
  NumberInput,
  Tile,
  Accordion,
  AccordionItem,
  TextArea,
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/react/icons';
import { useLayoutType, showSnackbar, useConfig, openmrsFetch } from '@openmrs/esm-framework';
import styles from './regimen-drug-order-step-renderer.scss';
import { useOrderConfig } from './order-config';
import { duration } from 'dayjs';

interface RegimenDrugOrderStepRendererProps {
  patientUuid: string;
  stepId: string;
  encounterUuid: string;
  encounterTypeUuid: string;
  visitUuid: string;
  onStepComplete: (data: any) => void;
  onStepDataChange?: (data: any) => void;
}

interface Regimen {
  uuid: string;
  display: string;
}

interface Line {
  uuid: string;
  display: string;
}

interface Drug {
  uuid: string;
  display: string;
  dosageForms?: Array<{
    uuid: string;
    display: string;
  }>;
}

interface DrugOrder {
  drug: Drug | null;
  dose: number;
  doseUnit: string;
  route: string;
  frequency: string;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  duration: number;
  durationUnit: string;
  quantity: number;
  quantityUnit: string;
  numRefills: number;
  indication: string;
}

// Clinical service options
interface ClinicalService {
  uuid: string;
  display: string;
}

// Dispense type options
interface DispenseType {
  uuid: string;
  display: string;
}

const RegimenDrugOrderStepRenderer: React.FC<RegimenDrugOrderStepRendererProps> = ({
  patientUuid,
  stepId,
  encounterUuid,
  encounterTypeUuid,
  onStepComplete,
  onStepDataChange,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig();

  // State for the form
  const [selectedRegimen, setSelectedRegimen] = useState<Regimen | null>(null);
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [changeLine, setChangeLine] = useState<string>('false');
  const [availableDrugs, setAvailableDrugs] = useState<Drug[]>([]);
  const [prescriptions, setPrescriptions] = useState<DrugOrder[]>([]);
  const [currentDrugIndex, setCurrentDrugIndex] = useState<number | null>(null);
  const { orderConfigObject, error: errorFetchingOrderConfig } = useOrderConfig();

  // New state variables for the clinicalService and dispenseType
  const [clinicalServices, setClinicalServices] = useState<ClinicalService[]>([]);
  const [dispenseTypes, setDispenseTypes] = useState<DispenseType[]>([]);
  const [selectedClinicalService, setSelectedClinicalService] = useState<string>('');
  const [selectedDispenseType, setSelectedDispenseType] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Error states for new fields
  const [clinicalServiceError, setClinicalServiceError] = useState('');
  const [dispenseTypeError, setDispenseTypeError] = useState('');

  // New state variables for the consolidated approach
  const [emptyPrescription, setEmptyPrescription] = useState<DrugOrder>({
    drug: null,
    dose: 0,
    doseUnit: '',
    route: '',
    frequency: '',
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: '',
    duration: 0,
    durationUnit: '',
    quantity: 0,
    quantityUnit: '',
    numRefills: 0,
    indication: '',
  });

  // Add missing state variables
  const [regimens, setRegimens] = useState<Regimen[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  // State for API interactions
  const [isLoadingRegimens, setIsLoadingRegimens] = useState(false);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(false);
  const [isLoadingClinicalServices, setIsLoadingClinicalServices] = useState(false);
  const [isLoadingDispenseTypes, setIsLoadingDispenseTypes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Error states
  const [regimenError, setRegimenError] = useState('');
  const [lineError, setLineError] = useState('');
  const [prescriptionError, setPrescriptionError] = useState('');

  // Load clinical services and dispense types on component mount
  useEffect(() => {
    const fetchClinicalServices = async () => {
      setIsLoadingClinicalServices(true);
      try {
        // This is a placeholder - we would need to replace with the actual API endpoint
        const response = await openmrsFetch('/ws/rest/v1/concept/C2AE49AE-FD70-4E6C-8C96?v=full');
        if (response.data && response.data.answers) {
          setClinicalServices(response.data.answers);
        } else {
          // Mock data for now
          setClinicalServices([
            { uuid: 'C2AE49AE-FD70-4E6C-8C96', display: 'TARV' },
            { uuid: 'D5755C99-353D-4FA9-A744', display: 'TB' },
            { uuid: '8BBFE8F8-1D75-4268-9168', display: 'SMI' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching clinical services:', error);
        // Mock data as fallback
        setClinicalServices([
          { uuid: 'C2AE49AE-FD70-4E6C-8C96', display: 'TARV' },
          { uuid: 'D5755C99-353D-4FA9-A744', display: 'TB' },
          { uuid: '8BBFE8F8-1D75-4268-9168', display: 'SMI' },
        ]);
      } finally {
        setIsLoadingClinicalServices(false);
      }
    };

    const fetchDispenseTypes = async () => {
      setIsLoadingDispenseTypes(true);
      try {
        // This is a placeholder - we would need to replace with the actual API endpoint
        const response = await openmrsFetch('/ws/rest/v1/concept/1234?v=full');
        if (response.data && response.data.answers) {
          setDispenseTypes(response.data.answers);
        } else {
          // Mock data for now
          setDispenseTypes([
            { uuid: 'DISPENSE_TYPE_DM', display: 'DM' },
            { uuid: 'DISPENSE_TYPE_DS', display: 'DS' },
            { uuid: 'DISPENSE_TYPE_DT', display: 'DT' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching dispense types:', error);
        // Mock data as fallback
        setDispenseTypes([
          { uuid: 'DISPENSE_TYPE_DM', display: 'DM' },
          { uuid: 'DISPENSE_TYPE_DS', display: 'DS' },
          { uuid: 'DISPENSE_TYPE_DT', display: 'DT' },
        ]);
      } finally {
        setIsLoadingDispenseTypes(false);
      }
    };

    fetchClinicalServices();
    fetchDispenseTypes();
  }, []);

  // Load regimens on component mount
  useEffect(() => {
    const fetchRegimens = async () => {
      setIsLoadingRegimens(true);
      try {
        const response = await openmrsFetch('/ws/rest/v1/concept/e1d83e4e-1d5f-11e0-b929-000c29ad1d07?v=full');
        if (response.data && response.data.answers) {
          setRegimens(response.data.answers);
        }
      } catch (error) {
        console.error('Error fetching regimens:', error);
        showSnackbar({
          title: t('errorLoadingRegimens', 'Error loading regimens'),
          kind: 'error',
          isLowContrast: false,
        });
      } finally {
        setIsLoadingRegimens(false);
      }
    };

    fetchRegimens();
  }, [t]);

  // Fetch therapeutic lines when regimen is selected
  useEffect(() => {
    if (selectedRegimen) {
      const fetchLines = async () => {
        setIsLoadingLines(true);
        try {
          const response = await openmrsFetch('/ws/rest/v1/concept/fdff0637-b36f-4dce-90c7-fe9f1ec586f0?&v=full');
          if (response.data && response.data.answers) {
            setLines(response.data.answers);
          }
        } catch (error) {
          console.error('Error fetching therapeutic lines:', error);
          showSnackbar({
            title: t('errorLoadingLines', 'Error loading therapeutic lines'),
            kind: 'error',
            isLowContrast: false,
          });
        } finally {
          setIsLoadingLines(false);
        }
      };

      fetchLines();
    }
  }, [selectedRegimen, t]);

  // Fetch drugs when regimen is selected
  useEffect(() => {
    if (selectedRegimen) {
      const fetchDrugs = async () => {
        setIsLoadingDrugs(true);
        try {
          const response = await openmrsFetch(`/ws/rest/v1/concept/${selectedRegimen.uuid}?v=full`);
          if (response.data && response.data.answers) {
            setAvailableDrugs(response.data.answers);
          }
        } catch (error) {
          console.error('Error fetching drugs for regimen:', error);
          showSnackbar({
            title: t('errorLoadingDrugs', 'Error loading drugs'),
            kind: 'error',
            isLowContrast: false,
          });
        } finally {
          setIsLoadingDrugs(false);
        }
      };

      fetchDrugs();
    }
  }, [selectedRegimen, t]);

  // Handle regimen selection
  const handleRegimenChange = (event) => {
    const selectedRegimenUuid = event.target.value;
    const regimen = regimens.find((r) => r.uuid === selectedRegimenUuid);
    setSelectedRegimen(regimen);
    setSelectedLine(null);
    setPrescriptions([]);
    setRegimenError('');
  };

  // Handle line selection
  const handleLineChange = (event) => {
    const selectedLineUuid = event.target.value;
    const line = lines.find((l) => l.uuid === selectedLineUuid);
    setSelectedLine(line);
    setLineError('');
  };

  // Handle change line radio button
  const handleChangeLineChange = (value) => {
    setChangeLine(value);
  };

  // Handle clinical service selection
  const handleClinicalServiceChange = (event) => {
    setSelectedClinicalService(event.target.value);
    setClinicalServiceError('');
  };

  // Handle dispense type selection
  const handleDispenseTypeChange = (event) => {
    setSelectedDispenseType(event.target.value);
    setDispenseTypeError('');
  };

  // Handle notes input
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  // Add a new empty prescription to the list
  const addEmptyPrescription = () => {
    setPrescriptions([...prescriptions, { ...emptyPrescription }]);
    setPrescriptionError('');
  };

  // Remove a prescription
  const removePrescription = (index: number) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions.splice(index, 1);
    setPrescriptions(updatedPrescriptions);
  };

  // Update a prescription
  const updatePrescription = (index: number, field: string, value: any) => {
    const updatedPrescriptions = [...prescriptions];

    if (field === 'drug') {
      const selectedDrug = availableDrugs.find((d) => d.uuid === value);
      if (selectedDrug) {
        updatedPrescriptions[index] = {
          ...updatedPrescriptions[index],
          drug: selectedDrug,
        };
      }
    } else {
      updatedPrescriptions[index] = {
        ...updatedPrescriptions[index],
        [field]: value,
      };
    }

    setPrescriptions(updatedPrescriptions);
  };

  // Validate the form
  const validateForm = (): boolean => {
    let isValid = true;

    if (!selectedRegimen) {
      setRegimenError(t('regimenRequired', 'Regime TARV is required'));
      isValid = false;
    }

    if (!selectedLine) {
      setLineError(t('lineRequired', 'Linha Terapêutica is required'));
      isValid = false;
    }

    if (!selectedClinicalService) {
      setClinicalServiceError(t('clinicalServiceRequired', 'Clinical Service is required'));
      isValid = false;
    }

    if (!selectedDispenseType) {
      setDispenseTypeError(t('dispenseTypeRequired', 'Dispense Type is required'));
      isValid = false;
    }

    if (prescriptions.length === 0) {
      setPrescriptionError(t('medicationRequired', 'At least one prescription is required'));
      isValid = false;
    } else {
      for (const prescription of prescriptions) {
        if (!prescription.drug) {
          setPrescriptionError(t('invalidPrescription', 'Please select a drug for all prescriptions'));
          isValid = false;
          break;
        }
      }
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Prepare the observations array for the encounter payload
      const observations = [
        {
          concept: 'e1d83e4e-1d5f-11e0-b929-000c29ad1d07', // Regimen concept
          value: selectedRegimen.uuid,
          formFieldNamespace: 'regimen-drug-order',
          formFieldPath: 'regimen-drug-order-regimeTarv',
        },
        {
          concept: 'fdff0637-b36f-4dce-90c7-fe9f1ec586f0', // Therapeutic line concept
          value: selectedLine.uuid,
          formFieldNamespace: 'regimen-drug-order',
          formFieldPath: 'regimen-drug-order-linhaTerapeutica',
        },
        {
          concept: 'e1d9f252-1d5f-11e0-b929-000c29ad1d07', // Change line concept
          value:
            changeLine === 'true' ? '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' : '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
          formFieldNamespace: 'regimen-drug-order',
          formFieldPath: 'regimen-drug-order-alterarLinhaTerapeutica',
        },
        // {
        //   concept: 'clinical-service-concept', // Clinical service concept
        //   value: selectedClinicalService,
        //   formFieldNamespace: 'regimen-drug-order',
        //   formFieldPath: 'regimen-drug-order-clinicalService',
        // },
        // {
        //   concept: 'dispense-type-concept', // Dispense type concept
        //   value: selectedDispenseType,
        //   formFieldNamespace: 'regimen-drug-order',
        //   formFieldPath: 'regimen-drug-order-dispenseType',
        // },
        // {
        //   concept: 'notes-concept', // Notes concept
        //   value: notes,
        //   formFieldNamespace: 'regimen-drug-order',
        //   formFieldPath: 'regimen-drug-order-notes',
        // },
      ];

      // Prepare the orders array for the encounter payload
      const orders = prescriptions.map((prescription) => ({
        type: 'drugorder',
        drug: prescription.drug.uuid,
        dose: prescription.dose,
        doseUnits: prescription.doseUnit,
        route: prescription.route,
        frequency: prescription.frequency,
        quantity: prescription.dose,
        quantityUnits: prescription.doseUnit,
        duration: prescription.duration,
        durationUnits: prescription.durationUnit,
        dosingInstructions: prescription.patientInstructions,
        numRefills: prescription.numRefills,
        orderer: 'a42d90ef-1587-460a-98db-f82f43cddc0f', // This should be updated with the actual provider UUID
        careSetting: '6f0c9a92-6f24-11e3-af88-005056821db0', // this represent outpatient but can be made dynamic
      }));

      // Create a single encounter payload with all observations and orders
      const encounterPayload = {
        patient: patientUuid,
        encounterType: encounterTypeUuid || 'e2791f26-1d5f-11e0-b929-000c29ad1d07',
        encounterDatetime: new Date().toISOString(),
        location: 'f03ff5ac-eef2-4586-a73f-7967e38ed8ee', // This should be updated with the actual location UUID
        encounterProviders: [
          {
            provider: 'a42d90ef-1587-460a-98db-f82f43cddc0f', // This should be updated with the actual provider UUID
            encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f', // Clinician role UUID - this might need to be configured
          },
        ],
        obs: observations,
        orders: orders,
        visit: '',
      };

      // Send the complete encounter payload in a single request
      const encounterResponse = await openmrsFetch('/ws/rest/v1/encounter', {
        method: 'POST',
        body: encounterPayload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!encounterResponse.ok) {
        throw new Error('Failed to create encounter');
      }

      const createdEncounterUuid = encounterResponse.data.uuid;

      // Placeholder for external system call
      sendToExternalSystem({
        patientUuid,
        encounter: encounterResponse.data,
        regimen: selectedRegimen,
        therapeuticLine: selectedLine,
        changeLine: changeLine === 'true',
        prescriptions,
      });

      // Complete step
      onStepComplete({
        regimen: selectedRegimen,
        therapeuticLine: selectedLine,
        changeLine: changeLine === 'true',
        prescriptions,
        encounterUuid: createdEncounterUuid,
        stepId,
      });

      showSnackbar({
        title: t('saveSuccess', 'Regimen and prescriptions saved successfully'),
        kind: 'success',
        isLowContrast: false,
      });
    } catch (error) {
      console.error('Error saving regimen and prescriptions:', error);
      showSnackbar({
        title: t('saveFailed', 'Failed to save regimen and prescriptions'),
        subtitle: error.message,
        kind: 'error',
        isLowContrast: false,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Integration with external system
  const sendToExternalSystem = async (orderData) => {
    try {
      const encounterData = orderData.encounter;

      if (!encounterData) {
        console.error('Failed to retrieve encounter data for external system');
        return;
      }

      // Get patient details to extract NID
      const patientResponse = await openmrsFetch(`/ws/rest/v1/patient/${patientUuid}?v=full`);
      const patientData = patientResponse.data;
      const nid = patientData.identifiers
        ? patientData.identifiers.find((id) => id.display.includes('NID'))?.identifier || 'Unknown'
        : extractNID(encounterData.patient.display);

      // Prepare prescribedDrugs from orders
      const prescribedDrugs = encounterData.orders
        .filter((order) => order.type === 'drugorder')
        .map((order) => {
          // Extract drug ID from the order
          const drugUuid = order.uuid;

          // Find the corresponding prescription from our local state for additional details
          const prescription = orderData.prescriptions.find((p) => p.drug?.uuid === order.drug?.uuid);

          // Parse frequency to get amtPerTime and timesPerDay
          const { amtPerTime, timesPerDay } = parseFrequency(prescription?.frequency, orderConfigObject);

          // Get dosing unit name
          const dosingUnit =
            orderConfigObject.drugDosingUnits.find((unit) => unit.valueCoded === prescription?.doseUnit)?.value ||
            'Tablet(s)';

          // Determine duration
          const duration = prescription?.duration || 30; // Default to 30 days

          return {
            orderUuid: drugUuid,
            drug: order.drug?.uuid || null,
            drugName: order.drug?.display || '',
            prescribedQty: prescription?.dose || 0,
            form: dosingUnit,
            duration: duration,
            durationUnit: 'Days',
            amtPerTime: amtPerTime,
            timesPerDay: timesPerDay,
          };
        });

      // Find the maximum duration from all prescribed drugs
      const maxDuration = calculateMaxDuration(orderData.prescriptions);

      // Map OpenMRS concepts to external system values
      const therapeuticLine = orderData.therapeuticLine?.display || '';
      const changeRegimenLine = orderData.changeLine ? 'Sim' : 'Não';

      // Build the payload for the external system
      const externalSystemPayload = {
        clinicalService: selectedClinicalService,
        patientUuid: patientUuid,
        nid: nid,
        prescriptionUuid: orderData.encounterUuid,
        therapeuticRegimen: orderData.regimen?.uuid || '',
        prescriptionDate: encounterData.encounterDatetime,
        providerUuid: encounterData.encounterProviders[0]?.provider?.uuid || 'a42d90ef-1587-460a-98db-f82f43cddc0f',
        dispenseType: selectedDispenseType,
        therapeuticLine: therapeuticLine,
        changeRegimenLine: changeRegimenLine,
        regimenLineChangeReason: '', // This would need to be collected if required
        locationUuid: encounterData.location?.uuid || 'f03ff5ac-eef2-4586-a73f-7967e38ed8ee',
        duration: `DURATION${maxDuration}`, // This would need to be mapped to the correct UUID format
        notes: notes,
        prescribedDrugs: prescribedDrugs,
      };

      // Send data to external system
      // This is where you would make the actual API call to the external system
      // For now, we'll just log the payload

      const externalSystemResponse = await openmrsFetch('/ws/rest/v1/csaudecore/prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(externalSystemPayload),
      });

      if (!externalSystemResponse.ok) {
        throw new Error(`Failed to send data to external system: ${externalSystemResponse.status}`);
      }

      const externalSystemResult = await externalSystemResponse.json();

      // Show success notification
      showSnackbar({
        title: t('externalSystemSuccess', 'Data sent to external system successfully'),
        kind: 'success',
        isLowContrast: true,
      });
    } catch (error) {
      console.error('Error sending data to external system:', error);
      showSnackbar({
        title: t('externalSystemError', 'Failed to send data to external system'),
        subtitle: error.message,
        kind: 'error',
        isLowContrast: false,
      });
    }
  };

  // Helper functions for the external system integration

  // Calculate the maximum duration from all prescribed drugs
  const calculateMaxDuration = (prescriptions) => {
    if (!prescriptions || prescriptions.length === 0) {
      return 0;
    }

    let maxDuration = 0;
    for (const prescription of prescriptions) {
      if (prescription.duration && prescription.duration > maxDuration) {
        maxDuration = prescription.duration;
      }
    }
    return maxDuration;
  };

  // Parse frequency to get amtPerTime and timesPerDay
  const parseFrequency = (frequency, orderConfigObject) => {
    if (!frequency || !orderConfigObject) {
      return { amtPerTime: 1, timesPerDay: 1 };
    }

    // Find the frequency object
    const frequencyObj = orderConfigObject.orderFrequencies.find((f) => f.valueCoded === frequency);

    if (!frequencyObj) {
      return { amtPerTime: 1, timesPerDay: 1 };
    }

    const frequencyDisplay = frequencyObj.value.toLowerCase();

    // Default values
    let amtPerTime = 1;
    let timesPerDay = 1;

    // Parse frequency based on common patterns
    if (frequencyDisplay.includes('once') || frequencyDisplay.includes('daily')) {
      timesPerDay = 1;
    } else if (
      frequencyDisplay.includes('twice') ||
      frequencyDisplay.includes('two times') ||
      frequencyDisplay.includes('bid')
    ) {
      timesPerDay = 2;
    } else if (
      frequencyDisplay.includes('three times') ||
      frequencyDisplay.includes('thrice') ||
      frequencyDisplay.includes('tid')
    ) {
      timesPerDay = 3;
    } else if (frequencyDisplay.includes('four times') || frequencyDisplay.includes('qid')) {
      timesPerDay = 4;
    }

    // If we have specific amount information in the frequency
    if (frequencyDisplay.match(/\d+\s*(tablet|pill|cap|ml|mg)/i)) {
      const match = frequencyDisplay.match(/(\d+)\s*(tablet|pill|cap|ml|mg)/i);
      if (match && match[1]) {
        amtPerTime = parseInt(match[1], 10);
      }
    }

    return { amtPerTime, timesPerDay };
  };

  // Extract patient identifier (NID) from patient display
  const extractNID = (patientDisplay) => {
    if (!patientDisplay) {
      return 'Unknown';
    }

    // Assuming the format is like "0111010201/2025/00150 - Artistides Jose Paruque"
    const nidMatch = patientDisplay.match(/^([^\s-]+)/);
    return nidMatch ? nidMatch[1] : 'Unknown';
  };

  return (
    <div className={styles.container}>
      <Form>
        <Tile className={styles.sectionTile}>
          <h4 className={styles.sectionHeader}>{t('generalInformation', 'General Information')}</h4>
          <div className={styles.prescriptionCard}>
            <div className={styles.prescriptionHeader}>
              <div className={styles.formRow}>
                <FormGroup
                  legendText={t('clinicalService', 'Clinical Service')}
                  invalid={!!clinicalServiceError}
                  invalidText={clinicalServiceError}>
                  <Select
                    id="clinical-service-select"
                    labelText=""
                    value={selectedClinicalService}
                    onChange={handleClinicalServiceChange}
                    disabled={isLoadingClinicalServices}>
                    <SelectItem
                      text={
                        isLoadingClinicalServices
                          ? t('loading', 'Loading...')
                          : t('selectClinicalService', 'Select a clinical service')
                      }
                      value=""
                    />
                    {clinicalServices.map((service) => (
                      <SelectItem key={service.uuid} text={service.display} value={service.uuid} />
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup
                  legendText={t('dispenseType', 'Dispense Type')}
                  invalid={!!dispenseTypeError}
                  invalidText={dispenseTypeError}>
                  <Select
                    id="dispense-type-select"
                    labelText=""
                    value={selectedDispenseType}
                    onChange={handleDispenseTypeChange}
                    disabled={isLoadingDispenseTypes}>
                    <SelectItem
                      text={
                        isLoadingDispenseTypes
                          ? t('loading', 'Loading...')
                          : t('selectDispenseType', 'Select a dispense type')
                      }
                      value=""
                    />
                    {dispenseTypes.map((type) => (
                      <SelectItem key={type.uuid} text={type.display} value={type.uuid} />
                    ))}
                  </Select>
                </FormGroup>
              </div>

              <FormGroup legendText={t('notes', 'Notes')}>
                <TextArea
                  id="notes-input"
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder={t('notesPlaceholder', 'Enter any additional notes or instructions here')}
                />
              </FormGroup>
            </div>
          </div>
        </Tile>

        <Tile className={styles.sectionTile}>
          <h4 className={styles.sectionHeader}>{t('regimenData', 'Dados do regime')}</h4>
          <div className={styles.prescriptionCard}>
            <div className={styles.prescriptionHeader}>
              <FormGroup
                legendText={t('regimenTarv', 'Regime TARV')}
                invalid={!!regimenError}
                invalidText={regimenError}>
                <Select
                  id="regimen-select"
                  labelText=""
                  value={selectedRegimen?.uuid || ''}
                  onChange={handleRegimenChange}
                  disabled={isLoadingRegimens}>
                  <SelectItem
                    text={isLoadingRegimens ? t('loading', 'Loading...') : t('selectRegimen', 'Select a regimen')}
                    value=""
                  />
                  {regimens.map((regimen) => (
                    <SelectItem key={regimen.uuid} text={regimen.display} value={regimen.uuid} />
                  ))}
                </Select>
              </FormGroup>

              <FormGroup
                legendText={t('therapeuticLine', 'Linha Terapêutica')}
                invalid={!!lineError}
                invalidText={lineError}>
                <Select
                  id="line-select"
                  labelText=""
                  value={selectedLine?.uuid || ''}
                  onChange={handleLineChange}
                  disabled={isLoadingLines || !selectedRegimen}>
                  <SelectItem
                    text={isLoadingLines ? t('loading', 'Loading...') : t('selectLine', 'Select a line')}
                    value=""
                  />
                  {lines.map((line) => (
                    <SelectItem key={line.uuid} text={line.display} value={line.uuid} />
                  ))}
                </Select>
              </FormGroup>

              <FormGroup legendText={t('changeLine', 'Alterar Linha Terapêutica')}>
                <RadioButtonGroup
                  name="change-line"
                  orientation="horizontal"
                  valueSelected={changeLine}
                  onChange={handleChangeLineChange}>
                  <RadioButton id="change-line-yes" labelText={t('yes', 'Sim')} value="true" />
                  <RadioButton id="change-line-no" labelText={t('no', 'Não')} value="false" />
                </RadioButtonGroup>
              </FormGroup>
            </div>
          </div>
        </Tile>

        <Tile className={styles.sectionTile}>
          <h4 className={styles.sectionHeader}>{t('prescriptions', 'Prescrições')}</h4>

          {prescriptionError && <div className={styles.errorText}>{prescriptionError}</div>}

          <div className={styles.prescriptionList}>
            {prescriptions.map((prescription, index) => (
              <div key={index} className={styles.prescriptionCard}>
                <div className={styles.prescriptionHeader}>
                  <div className={styles.fullWidthRow}>
                    <FormGroup legendText={t('drug', 'Medicamento')}>
                      <Select
                        id={`drug-select-${index}`}
                        labelText=""
                        value={prescription.drug?.uuid || ''}
                        onChange={(e) => updatePrescription(index, 'drug', e.target.value)}
                        disabled={isLoadingDrugs}>
                        <SelectItem
                          text={isLoadingDrugs ? t('loading', 'Loading...') : t('selectDrug', 'Select a drug')}
                          value=""
                        />
                        {availableDrugs.map((drug) => (
                          <SelectItem key={drug.uuid} text={drug.display} value={drug.uuid} />
                        ))}
                      </Select>
                    </FormGroup>
                  </div>

                  <div className={styles.doseRow}>
                    <FormGroup legendText={t('dose', 'Dose')}>
                      <NumberInput
                        id={`dose-input-${index}`}
                        value={prescription.dose || 0}
                        onChange={(e) => updatePrescription(index, 'dose', parseFloat(e.target.value))}
                        min={0}
                        step={0.1}
                      />
                    </FormGroup>

                    <FormGroup legendText={t('doseUnits', 'Units')}>
                      <Select
                        id={`dose-units-select-${index}`}
                        labelText=""
                        value={prescription.doseUnit || ''}
                        onChange={(e) => updatePrescription(index, 'doseUnit', e.target.value)}>
                        <SelectItem text={t('selectUnit', 'Select unit')} value="" />
                        {orderConfigObject.drugDosingUnits.map((unit) => (
                          <SelectItem key={unit.valueCoded} text={unit.value} value={unit.valueCoded} />
                        ))}
                      </Select>
                    </FormGroup>
                  </div>

                  <Button
                    kind="ghost"
                    renderIcon={TrashCan}
                    iconDescription={t('remove', 'Remove')}
                    hasIconOnly
                    onClick={() => removePrescription(index)}
                    className={styles.removeButton}
                  />
                </div>

                <Accordion>
                  <AccordionItem
                    title={t('prescriptionDetails', 'Detalhes da prescrição')}
                    className={styles.prescriptionDetails}>
                    <div className={styles.formRow}>
                      <FormGroup legendText={t('route', 'Route')}>
                        <Select
                          id={`route-select-${index}`}
                          labelText=""
                          value={prescription.route || ''}
                          onChange={(e) => updatePrescription(index, 'route', e.target.value)}>
                          <SelectItem text={t('selectRoute', 'Select route')} value="" />
                          {orderConfigObject.drugRoutes.map((route) => (
                            <SelectItem key={route.valueCoded} text={route.value} value={route.valueCoded} />
                          ))}
                        </Select>
                      </FormGroup>

                      <FormGroup legendText={t('frequency', 'Frequency')}>
                        <Select
                          id={`frequency-select-${index}`}
                          labelText=""
                          value={prescription.frequency || ''}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}>
                          <SelectItem text={t('selectFrequency', 'Select frequency')} value="" />
                          {orderConfigObject.orderFrequencies.map((freq) => (
                            <SelectItem key={freq.valueCoded} text={freq.value} value={freq.valueCoded} />
                          ))}
                        </Select>
                      </FormGroup>
                    </div>

                    <div className={styles.formRow}>
                      <FormGroup legendText={t('duration', 'Duration')}>
                        <NumberInput
                          id={`duration-input-${index}`}
                          value={prescription.duration || 0}
                          onChange={(e) => updatePrescription(index, 'duration', parseInt(e.target.value))}
                          min={0}
                        />
                      </FormGroup>

                      <FormGroup legendText={t('durationUnits', 'Duration Units')}>
                        <Select
                          id={`duration-units-select-${index}`}
                          labelText=""
                          value={prescription.durationUnit || ''}
                          onChange={(e) => updatePrescription(index, 'durationUnit', e.target.value)}>
                          <SelectItem text={t('selectDurationUnit', 'Select unit')} value="" />
                          {orderConfigObject.durationUnits.map((unit) => (
                            <SelectItem key={unit.valueCoded} text={unit.value} value={unit.valueCoded} />
                          ))}
                        </Select>
                      </FormGroup>
                    </div>
                    <FormGroup legendText={t('patientInstructions', 'Patient Instructions')}>
                      <TextArea
                        id={`instructions-input-${index}`}
                        value={prescription.patientInstructions || ''}
                        onChange={(e) => updatePrescription(index, 'patientInstructions', e.target.value)}
                      />
                    </FormGroup>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}

            <Button
              kind="tertiary"
              renderIcon={Add}
              onClick={addEmptyPrescription}
              disabled={!selectedRegimen || isLoadingDrugs || availableDrugs.length === 0}
              className={styles.addPrescriptionButton}>
              {t('addMedication', 'Adicionar Medicamento')}
            </Button>
          </div>
        </Tile>

        <div className={styles.formButtons}>
          <Button kind="primary" onClick={handleSubmit} disabled={isSaving || prescriptions.length === 0}>
            {isSaving ? <InlineLoading description={t('saving', 'Saving...')} /> : t('save', 'Save')}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RegimenDrugOrderStepRenderer;
