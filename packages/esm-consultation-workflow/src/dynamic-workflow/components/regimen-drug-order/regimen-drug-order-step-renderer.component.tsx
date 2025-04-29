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
import { useLayoutType, showSnackbar, useConfig, openmrsFetch, useSession } from '@openmrs/esm-framework';
import styles from './regimen-drug-order-step-renderer.scss';
import { useOrderConfig } from './order-config';
import { duration } from 'dayjs';
import {
  ALLOWED_DURATIONS,
  ALLOWED_FREQUENCIES,
  AllowedDurationUnitType,
  CARE_SETTING,
  DISPENSE_TYPES,
  THERAPEUTIC_LINES,
} from './constants';
import { DurationUnitType } from 'dayjs/plugin/duration';

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
  strength?: string;
}

interface Justification {
  uuid: string;
  display: string;
}

interface DrugOrder {
  drug: Drug | null;
  dose: number;
  doseUnit: string;
  route: string;
  frequency: string;
  amtPerTime?: number; // Amount to take at once
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  duration: number;
  durationUnit: DurationUnit;
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
  code: string;
  display: string;
}

interface DurationUnit {
  uuid: string;
  display: string;
  mapsTo: {
    uuid: string;
    duration: number;
  };
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
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [selectedJustification, setSelectedJustification] = useState<Justification | null>(null);
  const [isLoadingJustifications, setIsLoadingJustifications] = useState(false);
  const [justificationError, setJustificationError] = useState('');
  const [availableDrugs, setAvailableDrugs] = useState<Drug[]>([]);
  const [prescriptions, setPrescriptions] = useState<DrugOrder[]>([]);
  const [currentDrugIndex, setCurrentDrugIndex] = useState<number | null>(null);
  const [finalDuration, setFinalDuration] = useState<AllowedDurationUnitType>(null);
  const { orderConfigObject, error: errorFetchingOrderConfig } = useOrderConfig();
  const session = useSession();

  // New state variables for the dispenseType
  const [dispenseTypes, setDispenseTypes] = useState<DispenseType[]>([]);
  const [selectedDispenseType, setSelectedDispenseType] = useState<string>('');

  // Error states for new fields
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
    durationUnit: null,
    quantity: 0,
    quantityUnit: '',
    numRefills: 0,
    indication: '',
    amtPerTime: 0,
  });

  // Add missing state variables
  const [regimens, setRegimens] = useState<Regimen[]>([]);
  const [lines, setLines] = useState<Line[]>([]);

  // State for API interactions
  const [isLoadingRegimens, setIsLoadingRegimens] = useState(false);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  const [isLoadingDrugs, setIsLoadingDrugs] = useState(false);
  const [isLoadingDispenseTypes, setIsLoadingDispenseTypes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Error states
  const [regimenError, setRegimenError] = useState('');
  const [lineError, setLineError] = useState('');
  const [prescriptionError, setPrescriptionError] = useState('');

  // Load dispense types on component mount
  useEffect(() => {
    const fetchDispenseTypes = async () => {
      setIsLoadingDispenseTypes(true);
      try {
        // Replace this later with an API call or configuration
        setDispenseTypes(DISPENSE_TYPES);
      } catch (error) {
        console.error('Error fetching dispense types:', error);
      } finally {
        setIsLoadingDispenseTypes(false);
      }
    };

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

            // Find the default line with the specified UUID
            const defaultLine = response.data.answers.find(
              (line) => line.uuid === 'a6bbe1ac-5243-40e4-98cb-7d4a1467dfbe',
            );

            // Set the default line if it exists
            if (defaultLine) {
              setSelectedLine(defaultLine);
            }
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

  // Fetch justifications when changeLine is "true"
  useEffect(() => {
    if (changeLine === 'true') {
      const fetchJustifications = async () => {
        setIsLoadingJustifications(true);
        try {
          const response = await openmrsFetch('/ws/rest/v1/concept/e1de8862-1d5f-11e0-b929-000c29ad1d07?v=full');
          if (response.data && response.data.answers) {
            setJustifications(response.data.answers);
          }
        } catch (error) {
          console.error('Error fetching line change justifications:', error);
          showSnackbar({
            title: t('errorLoadingJustifications', 'Error loading justifications'),
            kind: 'error',
            isLowContrast: false,
          });
        } finally {
          setIsLoadingJustifications(false);
        }
      };

      fetchJustifications();
    }
  }, [changeLine, t]);

  // Calculate finalDuration whenever prescriptions change
  useEffect(() => {
    if (prescriptions.length === 0) {
      setFinalDuration(null);
      return;
    }

    // Find the max duration from all prescriptions
    let maxDuration = 0;
    for (const prescription of prescriptions) {
      if (prescription.durationUnit?.uuid) {
        const currentDuration = ALLOWED_DURATIONS.find((unit) => unit.uuid === prescription.durationUnit.uuid);
        maxDuration = Math.max(maxDuration, currentDuration.duration);
      }
    }

    const theFinalDuration = ALLOWED_DURATIONS.find((unit) => unit.duration === maxDuration);
    setFinalDuration(theFinalDuration);

    // If we have duration and prescriptions, also set the dispense type accordingly
    if (maxDuration > 0 && prescriptions.length > 0) {
      setDispenseTypes(DISPENSE_TYPES.filter((type) => theFinalDuration.allowedDispenseTypes.includes(type.uuid)));
    }
  }, [prescriptions]);

  // Handle regimen selection
  const handleRegimenChange = (event) => {
    const selectedRegimenUuid = event.target.value;
    const regimen = regimens.find((r) => r.uuid === selectedRegimenUuid);
    setSelectedRegimen(regimen);
    setSelectedLine(null);
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

  // Handle justification selection
  const handleJustificationChange = (event) => {
    const selectedJustificationUuid = event.target.value;
    const justification = justifications.find((j) => j.uuid === selectedJustificationUuid);
    setSelectedJustification(justification);
    setJustificationError('');
  };

  // Handle dispense type selection - This is disabled since it will be calculated
  const handleDispenseTypeChange = (event) => {
    // This function remains in place for future calculation logic
    // but user input is disabled as requested
    setSelectedDispenseType(event.target.value);
    setDispenseTypeError('');
  };

  // Add a new empty prescription to the list
  const addEmptyPrescription = () => {
    // Set default duration to "Um Mês" (Monthly)
    const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');

    setPrescriptions([
      ...prescriptions,
      {
        ...emptyPrescription,
        durationUnit: defaultDuration || ALLOWED_DURATIONS[2], // Fallback to index 2 (Um Mês) if not found by name
      },
    ]);
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
        // Get default duration if the current prescription doesn't have one
        const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');

        updatedPrescriptions[index] = {
          ...updatedPrescriptions[index],
          drug: selectedDrug,
          // Ensure duration unit is set
          durationUnit: updatedPrescriptions[index].durationUnit || defaultDuration || ALLOWED_DURATIONS[2],
        };
      }
    } else if (field === 'amtPerTime') {
      // Special handling for amtPerTime to ensure it's always a valid number
      const numValue = value === '' || isNaN(Number(value)) ? 0 : Number(value);
      updatedPrescriptions[index] = {
        ...updatedPrescriptions[index],
        amtPerTime: numValue,
      };
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

    if (changeLine === 'true' && !selectedJustification) {
      setJustificationError(t('justificationRequired', 'Motivo da alteração é obrigatório'));
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

        if (!prescription.frequency) {
          setPrescriptionError(t('frequencyRequired', 'Por favor, selecione a toma para todas as prescrições'));
          isValid = false;
          break;
        }

        if (!prescription.durationUnit) {
          setPrescriptionError(t('durationRequired', 'Please select a duration for all prescriptions'));
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
        ...(changeLine === 'true' && selectedJustification
          ? [
              {
                concept: 'e1de8862-1d5f-11e0-b929-000c29ad1d07', // Justification concept
                value: selectedJustification.uuid,
                formFieldNamespace: 'regimen-drug-order',
                formFieldPath: 'regimen-drug-order-justification',
              },
            ]
          : []),
        // Add amtPerTime observations for each prescription that has frequency selected
        ...prescriptions
          .filter((p) => p.frequency && p.amtPerTime)
          .map((p, index) => ({
            concept: '16cbff04-b3fc-4eae-8b7a-9b8b974fb211', // Amount per time concept
            value: p.amtPerTime.toString(),
            formFieldNamespace: 'regimen-drug-order',
            formFieldPath: `regimen-drug-order-amtPerTime-${index}`,
            comment: `Drug: ${p.drug?.display || ''}, Frequency: ${p.frequency}`,
          })),
      ];

      // Prepare the orders array for the encounter payload
      const orders = prescriptions.map((prescription) => ({
        type: 'drugorder',
        drug: prescription.drug.uuid,
        dose: prescription.drug.strength,
        doseUnits: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // default for tablet
        route: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // default for oral route
        frequency: prescription.frequency,
        quantity: prescription.drug.strength,
        quantityUnits: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        duration: prescription.durationUnit.mapsTo.duration,
        durationUnits: prescription.durationUnit.mapsTo.uuid,
        dosingInstructions: prescription.patientInstructions,
        numRefills: prescription.numRefills,
        orderer: session.currentProvider?.uuid, // This should be updated with the actual provider UUID
        careSetting: CARE_SETTING, // this represent outpatient but can be made dynamic
      }));

      // Create a single encounter payload with all observations and orders
      const encounterPayload = {
        patient: patientUuid,
        encounterType: encounterTypeUuid || 'e2791f26-1d5f-11e0-b929-000c29ad1d07',
        encounterDatetime: new Date().toISOString(),
        location: session.sessionLocation?.uuid, // This should be updated with the actual location UUID
        encounterProviders: [
          {
            provider: session.currentProvider?.uuid, // This should be updated with the actual provider UUID
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

      // Handle specific error types
      let errorTitle = t('saveFailed', 'Failed to save regimen and prescriptions');
      let errorMessage = '';

      // Check if there's a structured error response
      if (error.responseBody) {
        try {
          const errorData = error.responseBody;

          // Handle specific error codes
          if (errorData.error?.message?.includes('[Order.cannot.have.more.than.one]')) {
            errorTitle = t('duplicateOrderError', 'Medicamento duplicado');
            errorMessage = t(
              'duplicateOrderErrorMessage',
              'Um ou mais medicamentos já estão prescritos para este paciente. Verifique as prescrições existentes.',
            );
          } else if (errorData.message?.includes('already has an active order')) {
            // Extract drug name if possible
            const drugNameMatch = errorData.message.match(/for drug ([^(]+)/);
            const drugName = drugNameMatch ? drugNameMatch[1].trim() : 'selecionado';

            errorTitle = t('activeOrderError', 'Prescrição ativa existente');
            errorMessage = t(
              'activeOrderErrorMessage',
              `O medicamento ${drugName} já tem uma prescrição ativa para este paciente.`,
            );
          } else if (errorData.code && errorData.detail) {
            // Generic error with code and details
            errorMessage = `${errorData.message} (${errorData.code})`;
          } else {
            // Fallback for other structured errors
            errorMessage = errorData.message || error.message;
          }
        } catch (parseError) {
          // If we can't parse the error, use the original error message
          errorMessage = error.message;
        }
      } else if (error.message?.includes('failed with status')) {
        // Handle network/HTTP errors
        errorMessage = t(
          'serverCommunicationError',
          'Erro de comunicação com o servidor. Verifique sua conexão e tente novamente.',
        );
      } else {
        // Use generic error message as fallback
        errorMessage = error.message;
      }

      showSnackbar({
        title: errorTitle,
        subtitle: errorMessage,
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
      const patientOrders = await openmrsFetch(
        `/ws/rest/v1/order?patient=${patientUuid}&v=custom:(uuid,drug:(uuid,display,strength))&excludeDiscontinueOrders=true`,
      );

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

          // Determine duration
          const duration = prescription?.duration;

          const drug = patientOrders.data.results.find((o) => o.uuid === drugUuid)?.drug;
          const originalPrescription = orderData.prescriptions.find((p) => p.drug?.uuid === drug?.uuid);
          return {
            orderUuid: drugUuid,
            drug: drug.uuid,
            drugName: drug?.display || '',
            prescribedQty: originalPrescription?.drug?.strength || 0,
            form: 'AB6442FF-6DA0-46F2-81E1-F28B1A44A31C', // default to tablets
            duration: originalPrescription.durationUnit.duration,
            durationUnit: 'Semanas', // Default to weeks
            amtPerTime: originalPrescription.amtPerTime,
            timesPerDay: ALLOWED_FREQUENCIES.find((af) => af.uuid === originalPrescription.frequency).timesPerDay,
          };
        });

      // Find the maximum duration from all prescribed drugs
      const maxDuration = calculateMaxDuration(orderData.prescriptions);

      // Map OpenMRS concepts to external system values
      const therapeuticLine = orderData.therapeuticLine?.uuid || '';
      const changeRegimenLine = orderData.changeLine ? 'Sim' : 'Não';

      // Build the payload for the external system
      const externalSystemPayload = {
        clinicalService: '80A7852B-57DF-4E40-90EC-ABDE8403E01F', // TARV (promote this to confi)
        patientUuid: patientUuid,
        nid: nid,
        prescriptionUuid: orderData.encounter.uuid,
        therapeuticRegimen: orderData.regimen?.uuid || '',
        therapeuticRegimenCode: orderData.regimen?.display || '',
        prescriptionDate: encounterData.encounterDatetime,
        providerUuid: encounterData.encounterProviders[0]?.provider?.uuid || session.currentProvider?.uuid,
        dispenseType: selectedDispenseType,
        therapeuticLine: THERAPEUTIC_LINES.find((e) => e.openMrsUuid === therapeuticLine)?.sourceUuid || '',
        changeRegimenLine: changeRegimenLine,
        regimenLineChangeReason: '', // This would need to be collected if required
        locationUuid: encounterData.location?.uuid || session.sessionLocation?.uuid,
        duration: finalDuration.uuid, // This would need to be mapped to the correct UUID format
        notes: 'Dispensa TARV',
        prescribedDrugs: prescribedDrugs,
      };

      // Send data to external system
      const externalSystemResponse = await openmrsFetch('/ws/rest/v1/csaudeinterop/prescription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: externalSystemPayload, // Pass object directly, openmrsFetch will stringify it
      });

      // Check for response issues
      if (!externalSystemResponse.ok) {
        let errorMessage = `Failed to send data to external system: ${externalSystemResponse.status}`;

        // Try to extract more detailed error information if available
        try {
          if (externalSystemResponse.data) {
            errorMessage += ` - ${JSON.stringify(externalSystemResponse.data)}`;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }

        throw new Error(errorMessage);
      }

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
                    text={isLoadingRegimens ? t('loading', 'Loading...') : t('selectRegimen', 'Selecione o regime')}
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
                  disabled={isLoadingLines || !selectedRegimen || changeLine !== 'true'}>
                  <SelectItem
                    text={isLoadingLines ? t('loading', 'Loading...') : t('selectLine', 'Selecione a linha')}
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

              {changeLine === 'true' && (
                <FormGroup
                  legendText={t('changeLineJustification', 'Motivo da alteração da linha')}
                  invalid={!!justificationError}
                  invalidText={justificationError}>
                  <Select
                    id="justification-select"
                    labelText=""
                    value={selectedJustification?.uuid || ''}
                    onChange={handleJustificationChange}
                    disabled={isLoadingJustifications}>
                    <SelectItem
                      text={
                        isLoadingJustifications
                          ? t('loading', 'Loading...')
                          : t('selectJustification', 'Selecione o motivo')
                      }
                      value=""
                    />
                    {justifications.map((justification) => (
                      <SelectItem key={justification.uuid} text={justification.display} value={justification.uuid} />
                    ))}
                  </Select>
                </FormGroup>
              )}
            </div>
          </div>
        </Tile>

        <Tile className={styles.sectionTile}>
          <h4 className={styles.sectionHeader}>{t('prescriptions', 'Formulações')}</h4>

          {prescriptionError && <div className={styles.errorText}>{prescriptionError}</div>}

          <div className={styles.prescriptionList}>
            {prescriptions.map((prescription, index) => (
              <div key={index} className={styles.prescriptionCard}>
                <div className={styles.prescriptionHeader}>
                  <Button
                    kind="ghost"
                    renderIcon={TrashCan}
                    iconDescription={t('remove', 'Remove')}
                    hasIconOnly
                    onClick={() => removePrescription(index)}
                    className={styles.removeButton}
                  />
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
                      {prescription.drug?.strength && (
                        <div className={styles.drugStrengthLabel}>
                          <span>
                            {t('nrTablets', 'Número de comprimidos')}: {prescription.drug.strength}
                          </span>
                        </div>
                      )}
                    </FormGroup>
                  </div>
                </div>

                <Accordion>
                  <AccordionItem
                    title={t('prescriptionDetails', 'Detalhes da prescrição')}
                    className={styles.prescriptionDetails}>
                    <div className={styles.formRow}>
                      <FormGroup legendText={t('frequency', 'Tomar')}>
                        <Select
                          id={`frequency-select-${index}`}
                          labelText=""
                          value={prescription.frequency || ''}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}>
                          <SelectItem text={t('selectFrequency', 'Selecione a toma')} value="" />
                          {ALLOWED_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.uuid} text={freq.display} value={freq.uuid} />
                          ))}
                        </Select>
                      </FormGroup>

                      {prescription.frequency && (
                        <FormGroup legendText={t('amtPerTime', 'Quantidade a tomar por vez')}>
                          <NumberInput
                            id={`amtPerTime-input-${index}`}
                            value={prescription.amtPerTime}
                            onChange={(e) => updatePrescription(index, 'amtPerTime', parseInt(e.target.value, 10))}
                            min={1}
                          />
                        </FormGroup>
                      )}
                    </div>

                    <div className={styles.formRow}>
                      <FormGroup legendText={t('duration', 'Duração')}>
                        <Select
                          id={`duration-select-${index}`}
                          labelText=""
                          value={prescription.durationUnit?.uuid || ''}
                          onChange={(e) => {
                            const selectedDuration = ALLOWED_DURATIONS.find((unit) => unit.uuid === e.target.value);
                            if (selectedDuration) {
                              updatePrescription(index, 'durationUnit', selectedDuration);
                            }
                          }}>
                          <SelectItem text={t('selectDuration', 'Selecione a duração')} value="" />
                          {ALLOWED_DURATIONS.map((unit) => (
                            <SelectItem key={unit.uuid} text={unit.display} value={unit.uuid} />
                          ))}
                        </Select>
                      </FormGroup>
                    </div>
                    <FormGroup legendText={t('patientInstructions', 'Instruções para o paciente')}>
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

        <Tile className={styles.sectionTile}>
          <h4 className={styles.sectionHeader}>{t('dispenseType', 'Tipo de dispensa')}</h4>
          <div className={styles.prescriptionCard}>
            <div className={styles.prescriptionHeader}>
              {finalDuration && (
                <div className={styles.drugStrengthLabel}>
                  <span>
                    {t('prescriptionDuration', 'Duração da prescrição')}: {finalDuration.display}
                  </span>
                </div>
              )}
              <FormGroup
                legendText={t('dispenseType', 'Tipo de dispensa')}
                invalid={!!dispenseTypeError}
                invalidText={dispenseTypeError}>
                <Select
                  id="dispense-type-select"
                  labelText=""
                  value={selectedDispenseType}
                  onChange={handleDispenseTypeChange}
                  disabled={finalDuration === null || dispenseTypes.length === 0}>
                  <SelectItem
                    text={
                      isLoadingDispenseTypes
                        ? t('loading', 'Loading...')
                        : t('selectDispenseType', 'Selecione o tipo de dispensa')
                    }
                    value=""
                  />
                  {dispenseTypes.map((type) => (
                    <SelectItem key={type.uuid} text={type.display} value={type.uuid} />
                  ))}
                </Select>
              </FormGroup>
            </div>
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
