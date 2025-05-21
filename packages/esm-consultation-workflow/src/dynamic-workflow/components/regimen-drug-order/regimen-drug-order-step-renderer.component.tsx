import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@carbon/react';
import { openmrsFetch, useSession, useLayoutType } from '@openmrs/esm-framework';
import { ErrorType, handleError, displaySuccessSnackbar, validateFullForm } from './utils';
import { extractNID } from './utils/patient-utils';
import styles from './regimen-drug-order-step-renderer.scss';
import {
  ALLOWED_FREQUENCIES,
  ART_CHANGE_JUSTIFICATION_CONCEPT,
  CHANGE_LINE_CONCEPT,
  REGIMEN_CONCEPT,
  THERAPEUTIC_LINE_CONCEPT,
  THERAPEUTIC_LINES,
  CONCEPT_UUIDS,
  ENCOUNTER_TYPE_TARV,
  ENCOUNTER_ROLE,
  YES_CONCEPT,
  NO_CONCEPT,
  SYNC_STATUS_VALUE_PENDING,
  SYNC_STATUS_CONCEPT_UUID,
  DEFAULT_UUIDS,
} from './constants';
import { StepComponentHandle } from '../../step-registry';

// Import custom hooks
import {
  useRegimens,
  useTherapeuticLines,
  useAvailableDrugs,
  useJustifications,
  useDispenseTypes,
  useRegimenForm,
  usePrescriptionForm,
  useDispenseForm,
} from './hooks';

// Import presentational components
import { RegimenDataSection, PrescriptionList, DispenseTypeSection } from './components';

const RegimenDrugOrderStepRenderer = forwardRef<StepComponentHandle, any>(
  ({ patientUuid, stepId, encounterTypeUuid }, ref) => {
    const { t } = useTranslation();
    const isTablet = useLayoutType() === 'tablet';
    const session = useSession();

    // State for API interactions
    const [isSaving, setIsSaving] = useState(false);
    const [stepData, setStepData] = useState(null);

    // Use custom hooks for data fetching
    const { regimens, isLoading: isLoadingRegimens, error: regimensError } = useRegimens();

    // Use form management hooks
    const {
      selectedRegimen,
      selectedLine,
      changeLine,
      selectedJustification,
      regimenError,
      lineError,
      justificationError,
      handleRegimenChange,
      handleLineChange,
      handleChangeLineChange,
      handleJustificationChange,
      setError,
    } = useRegimenForm();

    const { lines, isLoading: isLoadingLines, error: linesError, defaultLine } = useTherapeuticLines(selectedRegimen);
    const { availableDrugs, isLoading: isLoadingDrugs, error: drugsError } = useAvailableDrugs(selectedRegimen);

    const {
      prescriptions,
      finalDuration,
      prescriptionError,
      addEmptyPrescription,
      removePrescription,
      updatePrescription,
      validatePrescriptionForm,
      calculateAndUpdateFinalDuration,
      setPrescriptionError,
    } = usePrescriptionForm(availableDrugs);

    const {
      justifications,
      isLoading: isLoadingJustifications,
      error: justificationsError,
    } = useJustifications(changeLine);

    const { dispenseTypes, isLoading: isLoadingDispenseTypes } = useDispenseTypes(finalDuration);

    const {
      selectedDispenseType,
      dispenseTypeError,
      handleDispenseTypeChange,
      validateDispenseForm,
      setDispenseTypeError,
    } = useDispenseForm();

    // Set the default line when it changes
    useEffect(() => {
      if (defaultLine && !selectedLine) {
        handleLineChange(defaultLine);
      }
    }, [defaultLine, selectedLine, handleLineChange]);

    // Calculate finalDuration whenever prescriptions change
    // This useEffect automatically updates the finalDuration when prescriptions change
    // by using the memoized calculation from the hook
    useEffect(() => {
      calculateAndUpdateFinalDuration();
    }, [calculateAndUpdateFinalDuration]);

    // Calculate max duration from prescriptions using useCallback for better performance
    const calculateMaxDuration = useCallback((prescriptions) => {
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
    }, []);

    // Use useMemo for observations that will be sent in the payload
    const observations = useMemo(
      () => [
        {
          concept: REGIMEN_CONCEPT,
          value: selectedRegimen?.uuid,
          formFieldNamespace: 'regimen-drug-order',
          formFieldPath: 'regimen-drug-order-regimeTarv',
        },
        {
          concept: THERAPEUTIC_LINE_CONCEPT,
          value: selectedLine?.uuid,
          formFieldNamespace: 'regimen-drug-order',
          formFieldPath: 'regimen-drug-order-linhaTerapeutica',
        },
        {
          concept: CHANGE_LINE_CONCEPT,
          value: changeLine === 'true' ? YES_CONCEPT : NO_CONCEPT,
          formFieldNamespace: 'regimen-drug-order',
          formFieldPath: 'regimen-drug-order-alterarLinhaTerapeutica',
        },
        {
          concept: SYNC_STATUS_CONCEPT_UUID,
          value: SYNC_STATUS_VALUE_PENDING,
        },
        ...(changeLine === 'true' && selectedJustification
          ? [
              {
                concept: ART_CHANGE_JUSTIFICATION_CONCEPT,
                value: selectedJustification.uuid,
                formFieldNamespace: 'regimen-drug-order',
                formFieldPath: 'regimen-drug-order-justification',
              },
            ]
          : []),
        ...prescriptions
          .filter((p) => p.frequency && p.amtPerTime)
          .map((p, index) => ({
            concept: CONCEPT_UUIDS.AMOUNT_PER_TIME,
            value: p.amtPerTime.toString(),
            formFieldNamespace: 'regimen-drug-order',
            formFieldPath: `regimen-drug-order-amtPerTime-${index}`,
            comment: `Drug: ${p.drug?.display || ''}, Frequency: ${p.frequency}`,
          })),
      ],
      [selectedRegimen, selectedLine, changeLine, selectedJustification, prescriptions],
    );

    // Use useMemo for orders that will be sent in the payload
    const orders = useMemo(
      () =>
        prescriptions.map((prescription) => {
          // Use optional chaining and fallbacks for all properties
          return {
            type: 'drugorder',
            drug: prescription.drug?.uuid,
            dose: prescription.drug?.strength || 0,
            doseUnits: CONCEPT_UUIDS.TABLET_DOSE_UNIT,
            route: CONCEPT_UUIDS.ORAL_ROUTE,
            frequency: prescription.frequency,
            quantity: prescription.drug?.strength || 0,
            quantityUnits: CONCEPT_UUIDS.TABLET_DOSE_UNIT,
            duration: prescription.durationUnit?.duration || 30,
            durationUnits: prescription.durationUnit?.mapsTo?.uuid || CONCEPT_UUIDS.DAYS_DURATION_UNIT,
            dosingInstructions: prescription.patientInstructions || '',
            numRefills: prescription.numRefills || 0,
            orderer: session.currentProvider?.uuid,
            careSetting: DEFAULT_UUIDS.CARE_SETTING,
          };
        }),
      [prescriptions, session.currentProvider?.uuid],
    );

    // Combined form validation using the centralized validation utility
    const validateForm = useCallback((): boolean => {
      const regimenFormState = {
        selectedRegimen,
        selectedLine,
        changeLine,
        selectedJustification,
      };

      // Use the imported validateFullForm utility
      const validation = validateFullForm(regimenFormState, prescriptions, selectedDispenseType, t);

      // Handle errors using the properly destructured setters
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          switch (error.field) {
            case 'regimenError':
            case 'lineError':
            case 'justificationError':
              setError(error.field, error.message);
              break;
            case 'prescriptionError':
              setPrescriptionError(error.message);
              break;
            case 'dispenseTypeError':
              setDispenseTypeError(error.message);
              break;
            default:
              console.warn('Unknown error field:', error.field);
          }
        });
      }

      return validation.isValid;
    }, [
      selectedRegimen,
      selectedLine,
      changeLine,
      selectedJustification,
      prescriptions,
      selectedDispenseType,
      t,
      setError,
      setPrescriptionError,
      setDispenseTypeError,
    ]);

    const sendToExternalSystem = useCallback(
      async (orderData) => {
        try {
          const encounterData = orderData.encounter;

          if (!encounterData) {
            console.error('Failed to retrieve encounter data for external system');
            return;
          }

          const patientResponse = await openmrsFetch(`/ws/rest/v1/patient/${patientUuid}?v=full`);
          const patientOrders = await openmrsFetch(
            `/ws/rest/v1/order?patient=${patientUuid}&v=custom:(uuid,drug:(uuid,display,strength))&excludeDiscontinueOrders=true`,
          );

          const patientData = patientResponse.data;
          const nid = patientData.identifiers
            ? patientData.identifiers.find((id) => id.display.includes('NID'))?.identifier || 'Unknown'
            : extractNID(encounterData.patient.display);

          const prescribedDrugs = encounterData.orders
            .filter((order) => order.type === 'drugorder')
            .map((order) => {
              const drugUuid = order.uuid;

              const prescription = orderData.prescriptions.find((p) => p.drug?.uuid === order.drug?.uuid);

              const duration = prescription?.duration;

              const drug = patientOrders.data.results.find((o) => o.uuid === drugUuid)?.drug;
              const originalPrescription = orderData.prescriptions.find((p) => p.drug?.uuid === drug?.uuid);
              return {
                orderUuid: drugUuid,
                drug: drug.uuid,
                drugName: drug?.display || '',
                prescribedQty: originalPrescription?.drug?.strength || 0,
                form: 'AB6442FF-6DA0-46F2-81E1-F28B1A44A31C',
                duration: originalPrescription.durationUnit?.duration || 30,
                durationUnit: 'Dia',
                amtPerTime: originalPrescription.amtPerTime,
                timesPerDay: ALLOWED_FREQUENCIES.find((af) => af.uuid === originalPrescription.frequency).timesPerDay,
              };
            });

          const maxDuration = calculateMaxDuration(orderData.prescriptions);

          const therapeuticLine = orderData.therapeuticLine?.uuid || '';
          const changeRegimenLine = orderData.changeLine ? 'Sim' : 'Não';

          const externalSystemPayload = {
            clinicalService: '80A7852B-57DF-4E40-90EC-ABDE8403E01F',
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
            regimenLineChangeReason: '',
            locationUuid: encounterData.location?.uuid || session.sessionLocation?.uuid,
            duration: finalDuration.uuid,
            notes: 'Dispensa TARV',
            prescribedDrugs: prescribedDrugs,
          };

          const externalSystemResponse = await openmrsFetch('/ws/rest/v1/csaudeinterop/prescription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: externalSystemPayload,
          });

          if (!externalSystemResponse.ok) {
            let errorMessage = `Failed to send data to external system: ${externalSystemResponse.status}`;

            try {
              if (externalSystemResponse.data) {
                errorMessage += ` - ${JSON.stringify(externalSystemResponse.data)}`;
              }
            } catch (parseError) {
              console.error('Error parsing error response:', parseError);
            }

            throw new Error(errorMessage);
          }

          displaySuccessSnackbar(t('externalSystemSuccess', 'Data sent to external system successfully'));
        } catch (error) {
          console.error('Error sending data to external system:', error);
          handleError(error, t, ErrorType.EXTERNAL_SYSTEM_ERROR);
        }
      },
      [patientUuid, session, selectedDispenseType, finalDuration, t, calculateMaxDuration],
    );

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        return null;
      }

      setIsSaving(true);
      let savedData = null;

      try {
        // Use memoized observations and orders from the current form state - these are now derived from the component state using useMemo
        const encounterPayload = {
          patient: patientUuid,
          encounterType: encounterTypeUuid || ENCOUNTER_TYPE_TARV,
          encounterDatetime: new Date().toISOString(),
          location: session.sessionLocation?.uuid,
          encounterProviders: [
            {
              provider: session.currentProvider?.uuid,
              encounterRole: ENCOUNTER_ROLE,
            },
          ],
          obs: observations,
          orders: orders,
          visit: '',
        };

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

        sendToExternalSystem({
          patientUuid,
          encounter: encounterResponse.data,
          regimen: selectedRegimen,
          therapeuticLine: selectedLine,
          changeLine: changeLine === 'true',
          prescriptions,
        });

        const drugOrderUuids = encounterResponse.data.orders.map((order) => order.uuid);

        setStepData({
          drugOrderUuids: drugOrderUuids,
          encounterUuid: createdEncounterUuid,
          prescriptionType: 'TARV',
          stepId,
        });

        displaySuccessSnackbar(t('saveSuccess', 'Regimen and prescriptions saved successfully'));

        return {
          drugOrderUuids: drugOrderUuids,
          encounterUuid: createdEncounterUuid,
          prescriptionType: 'TARV',
          stepId,
        };
      } catch (error) {
        console.error('Error saving regimen and prescriptions:', error);
        handleError(error, t, ErrorType.API_ERROR);

        return null;
      } finally {
        setIsSaving(false);
      }
    }, [
      validateForm,
      patientUuid,
      encounterTypeUuid,
      session,
      observations,
      orders,
      sendToExternalSystem,
      selectedRegimen,
      selectedLine,
      changeLine,
      prescriptions,
      stepId,
      t,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        async onStepComplete() {
          let returnData = {
            drugOrderUuids: [],
            encounterUuid: '',
            prescriptionType: 'TARV',
            stepId,
          };

          await handleSubmit().then((savedData) => {
            if (savedData) {
              returnData = savedData;
            }
          });

          return returnData;
        },
      }),
      [handleSubmit, stepId],
    );

    // extractNID utility function moved to patient-utils.ts

    return (
      <div className={styles.container}>
        <Form>
          <RegimenDataSection
            regimens={regimens}
            selectedRegimen={selectedRegimen}
            regimenError={regimenError}
            isLoadingRegimens={isLoadingRegimens}
            handleRegimenChange={handleRegimenChange}
            lines={lines}
            selectedLine={selectedLine}
            lineError={lineError}
            isLoadingLines={isLoadingLines}
            handleLineChange={handleLineChange}
            changeLine={changeLine}
            handleChangeLineChange={handleChangeLineChange}
            justifications={justifications}
            selectedJustification={selectedJustification}
            justificationError={justificationError}
            isLoadingJustifications={isLoadingJustifications}
            handleJustificationChange={handleJustificationChange}
          />

          <PrescriptionList
            prescriptions={prescriptions}
            availableDrugs={availableDrugs}
            isLoadingDrugs={isLoadingDrugs}
            selectedRegimen={selectedRegimen}
            prescriptionError={prescriptionError}
            updatePrescription={updatePrescription}
            removePrescription={removePrescription}
            addEmptyPrescription={addEmptyPrescription}
            isTablet={isTablet}
          />

          <DispenseTypeSection
            finalDuration={finalDuration}
            dispenseTypes={dispenseTypes}
            selectedDispenseType={selectedDispenseType}
            dispenseTypeError={dispenseTypeError}
            isLoadingDispenseTypes={isLoadingDispenseTypes}
            onDispenseTypeChange={handleDispenseTypeChange}
          />
        </Form>
      </div>
    );
  },
);

export default RegimenDrugOrderStepRenderer;
