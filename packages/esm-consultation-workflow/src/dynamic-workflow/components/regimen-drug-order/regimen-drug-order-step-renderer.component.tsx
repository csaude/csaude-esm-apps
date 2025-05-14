import React, { useState, useEffect, ChangeEvent, useCallback, forwardRef, useImperativeHandle } from 'react';
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
  IconButton,
  TextInput,
} from '@carbon/react';
import { Add, Subtract, TrashCan } from '@carbon/react/icons';
import { useLayoutType, showSnackbar, useConfig, openmrsFetch, useSession, AddIcon } from '@openmrs/esm-framework';
import styles from './regimen-drug-order-step-renderer.scss';
import { useOrderConfig } from './order-config';
import { duration } from 'dayjs';
import {
  ALLOWED_DURATIONS,
  ALLOWED_FREQUENCIES,
  AllowedDurationUnitType,
  ART_CHANGE_JUSTIFICATION_CONCEPT,
  CARE_SETTING,
  CHANGE_LINE_CONCEPT,
  DISPENSE_TYPES,
  REGIMEN_CONCEPT,
  THERAPEUTIC_LINE_CONCEPT,
  THERAPEUTIC_LINES,
  CLINICAL_SERVICES,
  CONCEPT_UUIDS,
  API_PATHS,
  DEFAULT_UUIDS,
  TherapeuticLine,
  DispenseType,
  ENCOUNTER_TYPE_TARV,
  ENCOUNTER_ROLE,
  YES_CONCEPT,
  NO_CONCEPT,
  SYNC_STATUS_VALUE_PENDING,
  SYNC_STATUS_CONCEPT_UUID,
} from './constants';
import {
  DrugOrderBasketItem,
  DrugOrderTemplate,
  OrderTemplate,
  DosingInstructions,
  MedicationDosage,
  MedicationFrequency,
  MedicationRoute,
  MedicationInstructions,
  DosingUnit,
  QuantityUnit,
  DurationUnit,
  CommonMedicationValueCoded,
} from './types';
import { StepComponentHandle } from '../../step-registry';
import { useRegimens, useTherapeuticLines, useAvailableDrugs, useJustifications, useDispenseTypes } from './hooks';

const CustomNumberInput = ({ setValue = () => {}, value, onChange, labelText, isTablet, ...inputProps }) => {
  const { t } = useTranslation();
  const responsiveSize = isTablet ? 'lg' : 'sm';

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^\d]/g, '').slice(0, 2);
      onChange(val ? parseInt(val) : 0);
    },
    [onChange],
  );

  const increment = () => {
    onChange(Number(value) + 1);
  };

  const decrement = () => {
    onChange(Math.max(Number(value) - 1, 0));
  };

  return (
    <div className={styles.customElement}>
      <span className="cds--label">{labelText}</span>
      <div className={styles.customNumberInput}>
        <IconButton onClick={decrement} label={t('decrement', 'Decrement')} size={responsiveSize}>
          <Subtract size={16} />
        </IconButton>
        <TextInput
          onChange={handleChange}
          className={styles.customInput}
          value={!!value ? value : '--'}
          size={responsiveSize}
          {...inputProps}
        />
        <IconButton onClick={increment} label={t('increment', 'Increment')} size={responsiveSize}>
          <AddIcon size={16} />
        </IconButton>
      </div>{' '}
    </div>
  );
};

const RegimenDrugOrderStepRenderer = forwardRef<StepComponentHandle, any>(
  ({ patientUuid, stepId, encounterTypeUuid, onStepComplete }, ref) => {
    const { t } = useTranslation();
    const isTablet = useLayoutType() === 'tablet';
    const config = useConfig();

    // State for the form
    const [selectedRegimen, setSelectedRegimen] = useState(null);
    const [selectedLine, setSelectedLine] = useState(null);
    const [changeLine, setChangeLine] = useState<string>('false');
    const [selectedJustification, setSelectedJustification] = useState(null);
    const [justificationError, setJustificationError] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [currentDrugIndex, setCurrentDrugIndex] = useState<number | null>(null);
    const [finalDuration, setFinalDuration] = useState(null);
    const [stepData, setStepData] = useState<any>(null);
    const session = useSession();

    // New state variables for the dispenseType
    const [selectedDispenseType, setSelectedDispenseType] = useState<string>('');

    // Error states for new fields
    const [dispenseTypeError, setDispenseTypeError] = useState('');

    // New state variables for the consolidated approach
    const [emptyPrescription, setEmptyPrescription] = useState({
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

    // Use custom hooks for data fetching
    const { regimens, isLoading: isLoadingRegimens, error: regimensError } = useRegimens();
    const { lines, isLoading: isLoadingLines, error: linesError, defaultLine } = useTherapeuticLines(selectedRegimen);
    const { availableDrugs, isLoading: isLoadingDrugs, error: drugsError } = useAvailableDrugs(selectedRegimen);
    const {
      justifications,
      isLoading: isLoadingJustifications,
      error: justificationsError,
    } = useJustifications(changeLine);
    const { dispenseTypes, isLoading: isLoadingDispenseTypes } = useDispenseTypes(finalDuration);

    // State for API interactions
    const [isSaving, setIsSaving] = useState(false);

    // Error states
    const [regimenError, setRegimenError] = useState('');
    const [lineError, setLineError] = useState('');
    const [prescriptionError, setPrescriptionError] = useState('');

    // Set the default line when it changes
    useEffect(() => {
      if (defaultLine && !selectedLine) {
        setSelectedLine(defaultLine);
      }
    }, [defaultLine, selectedLine]);

    // Calculate finalDuration whenever prescriptions change
    useEffect(() => {
      if (prescriptions.length === 0) {
        setFinalDuration(null);
        return;
      }

      let maxDuration = 0;
      for (const prescription of prescriptions) {
        if (prescription.durationUnit?.uuid) {
          const currentDuration = ALLOWED_DURATIONS.find((unit) => unit.uuid === prescription.durationUnit.uuid);
          maxDuration = Math.max(maxDuration, currentDuration.duration);
        }
      }

      const theFinalDuration = ALLOWED_DURATIONS.find((unit) => unit.duration === maxDuration);
      setFinalDuration(theFinalDuration);

      // Dispense types are now handled by the useDispenseTypes hook
    }, [prescriptions]);

    const handleRegimenChange = (event) => {
      const selectedRegimenUuid = event.target.value;
      const regimen = regimens.find((r) => r.uuid === selectedRegimenUuid);
      setSelectedRegimen(regimen);
      setSelectedLine(null);
      setSelectedLine(null);
      setPrescriptions([]);
      setRegimenError('');
    };

    const handleLineChange = (event) => {
      const selectedLineUuid = event.target.value;
      const line = lines.find((l) => l.uuid === selectedLineUuid);
      setSelectedLine(line);
      setLineError('');
    };

    const handleChangeLineChange = (value) => {
      setChangeLine(value);
    };

    const handleJustificationChange = (event) => {
      const selectedJustificationUuid = event.target.value;
      const justification = justifications.find((j) => j.uuid === selectedJustificationUuid);
      setSelectedJustification(justification);
      setJustificationError('');
    };

    const handleDispenseTypeChange = (event) => {
      setSelectedDispenseType(event.target.value);
      setDispenseTypeError('');
    };

    const addEmptyPrescription = () => {
      const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');

      setPrescriptions([
        ...prescriptions,
        {
          ...emptyPrescription,
          durationUnit: defaultDuration || ALLOWED_DURATIONS[2],
        },
      ]);
      setPrescriptionError('');
    };

    const removePrescription = (index: number) => {
      const updatedPrescriptions = [...prescriptions];
      updatedPrescriptions.splice(index, 1);
      setPrescriptions(updatedPrescriptions);
    };

    const updatePrescription = (index: number, field: string, value: any) => {
      const updatedPrescriptions = [...prescriptions];

      if (field === 'drug') {
        const selectedDrug = availableDrugs.find((d) => d.uuid === value);
        if (selectedDrug) {
          const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');

          updatedPrescriptions[index] = {
            ...updatedPrescriptions[index],
            drug: selectedDrug,
            durationUnit: updatedPrescriptions[index].durationUnit || defaultDuration || ALLOWED_DURATIONS[2],
          };
        }
      } else if (field === 'amtPerTime') {
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

    const validateForm = useCallback((): boolean => {
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
    }, [selectedRegimen, selectedLine, changeLine, selectedJustification, selectedDispenseType, prescriptions, t]);

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
                duration: originalPrescription.durationUnit.duration,
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

        const orders = prescriptions.map((prescription) => ({
          type: 'drugorder',
          drug: prescription.drug.uuid,
          dose: prescription.drug.strength,
          doseUnits: CONCEPT_UUIDS.TABLET_DOSE_UNIT,
          route: CONCEPT_UUIDS.ORAL_ROUTE,
          frequency: prescription.frequency,
          quantity: prescription.drug.strength,
          quantityUnits: CONCEPT_UUIDS.TABLET_DOSE_UNIT,
          duration: prescription.durationUnit.mapsTo.duration,
          durationUnits: prescription.durationUnit.mapsTo.uuid,
          dosingInstructions: prescription.patientInstructions,
          numRefills: prescription.numRefills,
          orderer: session.currentProvider?.uuid,
          careSetting: CARE_SETTING,
        }));

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
                            <CustomNumberInput
                              value={prescription.amtPerTime}
                              onChange={(value) => updatePrescription(index, 'amtPerTime', value)}
                              labelText=""
                              isTablet={isTablet}
                              id={`amtPerTime-input-${index}`}
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
        </Form>
      </div>
    );
  },
);

export default RegimenDrugOrderStepRenderer;
