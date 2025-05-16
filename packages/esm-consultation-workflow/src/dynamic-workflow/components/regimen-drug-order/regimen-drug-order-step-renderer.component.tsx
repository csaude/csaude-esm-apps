import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from '@carbon/react';
import { showSnackbar, useConfig, openmrsFetch, useSession, useLayoutType } from '@openmrs/esm-framework';
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
  ({ patientUuid, stepId, encounterTypeUuid, onStepComplete }, ref) => {
    const { t } = useTranslation();
    const isTablet = useLayoutType() === 'tablet';
    const config = useConfig();
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
      validateRegimenForm,
    } = useRegimenForm();

    const { lines, isLoading: isLoadingLines, error: linesError, defaultLine } = useTherapeuticLines(selectedRegimen);
    const { availableDrugs, isLoading: isLoadingDrugs, error: drugsError } = useAvailableDrugs(selectedRegimen);

    const {
      prescriptions,
      currentDrugIndex,
      finalDuration,
      prescriptionError,
      emptyPrescription,
      addEmptyPrescription,
      removePrescription,
      updatePrescription,
      validatePrescriptionForm,
      calculateAndUpdateFinalDuration,
    } = usePrescriptionForm(availableDrugs);

    const {
      justifications,
      isLoading: isLoadingJustifications,
      error: justificationsError,
    } = useJustifications(changeLine);

    const { dispenseTypes, isLoading: isLoadingDispenseTypes } = useDispenseTypes(finalDuration);

    const { selectedDispenseType, dispenseTypeError, handleDispenseTypeChange, validateDispenseForm } =
      useDispenseForm();

    // Set the default line when it changes
    useEffect(() => {
      if (defaultLine && !selectedLine) {
        handleLineChange(defaultLine);
      }
    }, [defaultLine, selectedLine, handleLineChange]);

    // Calculate finalDuration whenever prescriptions change
    useEffect(() => {
      calculateAndUpdateFinalDuration();
    }, [prescriptions, calculateAndUpdateFinalDuration]);

    // Combined form validation
    const validateForm = useCallback((): boolean => {
      return validateRegimenForm(t) && validatePrescriptionForm(t) && validateDispenseForm(t);
    }, [validateRegimenForm, validatePrescriptionForm, validateDispenseForm, t]);

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
      },
      [patientUuid, session, selectedDispenseType, finalDuration, t],
    );

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        return null;
      }

      setIsSaving(true);
      let savedData = null;

      try {
        const observations = [
          {
            concept: REGIMEN_CONCEPT,
            value: selectedRegimen.uuid,
            formFieldNamespace: 'regimen-drug-order',
            formFieldPath: 'regimen-drug-order-regimeTarv',
          },
          {
            concept: THERAPEUTIC_LINE_CONCEPT,
            value: selectedLine.uuid,
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
        ];

        const orders = prescriptions.map((prescription) => {
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
        });

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

        showSnackbar({
          title: t('saveSuccess', 'Regimen and prescriptions saved successfully'),
          kind: 'success',
          isLowContrast: false,
        });

        return {
          drugOrderUuids: drugOrderUuids,
          encounterUuid: createdEncounterUuid,
          prescriptionType: 'TARV',
          stepId,
        };
      } catch (error) {
        console.error('Error saving regimen and prescriptions:', error);

        let errorTitle = t('saveFailed', 'Failed to save regimen and prescriptions');
        let errorMessage = '';

        if (error.responseBody) {
          try {
            const errorData = error.responseBody;

            if (errorData.error?.message?.includes('[Order.cannot.have.more.than.one]')) {
              errorTitle = t('duplicateOrderError', 'Medicamento duplicado');
              errorMessage = t(
                'duplicateOrderErrorMessage',
                'Um ou mais medicamentos já estão prescritos para este paciente. Verifique as prescrições existentes.',
              );
            } else if (errorData.message?.includes('already has an active order')) {
              const drugNameMatch = errorData.message.match(/for drug ([^(]+)/);
              const drugName = drugNameMatch ? drugNameMatch[1].trim() : 'selecionado';

              errorTitle = t('activeOrderError', 'Prescrição ativa existente');
              errorMessage = t(
                'activeOrderErrorMessage',
                `O medicamento ${drugName} já tem uma prescrição ativa para este paciente.`,
              );
            } else if (errorData.code && errorData.detail) {
              errorMessage = `${errorData.message} (${errorData.code})`;
            } else {
              errorMessage = errorData.message || error.message;
            }
          } catch (parseError) {
            errorMessage = error.message;
          }
        } else if (error.message?.includes('failed with status')) {
          errorMessage = t(
            'serverCommunicationError',
            'Erro de comunicação com o servidor. Verifique sua conexão e tente novamente.',
          );
        } else {
          errorMessage = error.message;
        }

        showSnackbar({
          title: errorTitle,
          subtitle: errorMessage,
          kind: 'error',
          isLowContrast: false,
        });

        return null;
      } finally {
        setIsSaving(false);
      }
    }, [
      validateForm,
      selectedRegimen,
      selectedLine,
      changeLine,
      selectedJustification,
      prescriptions,
      patientUuid,
      encounterTypeUuid,
      session.sessionLocation?.uuid,
      session.currentProvider?.uuid,
      sendToExternalSystem,
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

    const extractNID = (patientDisplay) => {
      if (!patientDisplay) {
        return 'Unknown';
      }

      const nidMatch = patientDisplay.match(/^([^\s-]+)/);
      return nidMatch ? nidMatch[1] : 'Unknown';
    };

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
            handleDispenseTypeChange={handleDispenseTypeChange}
          />
        </Form>
      </div>
    );
  },
);

export default RegimenDrugOrderStepRenderer;
