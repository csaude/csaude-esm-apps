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

interface RegimenDrugOrderStepRendererProps {
  patientUuid: string;
  stepId: string;
  encounterUuid: string;
  encounterTypeUuid: string;
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
  const [isSaving, setIsSaving] = useState(false);

  // Error states
  const [regimenError, setRegimenError] = useState('');
  const [lineError, setLineError] = useState('');
  const [prescriptionError, setPrescriptionError] = useState('');

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

  // Add a new empty prescription to the list
  const addEmptyPrescription = () => {
    // if (availableDrugs.length === 0) {
    //   setPrescriptionError(t('noDrugsAvailable', 'No drugs available for this regimen'));
    //   return;
    // }

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
      const encounterResponse = await openmrsFetch('/ws/rest/v1/encounter', {
        method: 'POST',
        body: {
          patient: patientUuid,
          encounterType: encounterTypeUuid || '8d5b27bc-c2cc-11de-8d13-0010c6dffd0f',
          encounterDatetime: new Date().toISOString(),
          location: sessionStorage.getItem('sessionLocationUuid'),
        },
      });

      if (!encounterResponse.ok) {
        throw new Error('Failed to create encounter');
      }

      const createdEncounterUuid = encounterResponse.data.uuid;

      // Add observations for regimen data
      await openmrsFetch('/ws/rest/v1/obs', {
        method: 'POST',
        body: {
          person: patientUuid,
          encounter: createdEncounterUuid,
          concept: 'REGIMEN_CONCEPT_UUID',
          value: selectedRegimen.uuid,
        },
      });

      await openmrsFetch('/ws/rest/v1/obs', {
        method: 'POST',
        body: {
          person: patientUuid,
          encounter: createdEncounterUuid,
          concept: 'THERAPEUTIC_LINE_CONCEPT_UUID',
          value: selectedLine.uuid,
        },
      });

      await openmrsFetch('/ws/rest/v1/obs', {
        method: 'POST',
        body: {
          person: patientUuid,
          encounter: createdEncounterUuid,
          concept: 'CHANGE_LINE_CONCEPT_UUID',
          value: changeLine === 'true' ? 'true' : 'false',
        },
      });

      // Add drug orders
      for (const prescription of prescriptions) {
        await openmrsFetch('/ws/rest/v1/order', {
          method: 'POST',
          body: {
            patient: patientUuid,
            encounter: createdEncounterUuid,
            type: 'drugorder',
            drug: prescription.drug.uuid,
            dose: prescription.dose,
            doseUnits: prescription.doseUnit,
            route: prescription.route,
            frequency: prescription.frequency,
            quantity: prescription.quantity,
            quantityUnits: prescription.quantityUnit,
            numRefills: prescription.numRefills,
            orderer: 'CURRENT_PROVIDER_UUID',
            careSetting: 'OUTPATIENT',
          },
        });
      }

      // Placeholder for external system call
      sendToExternalSystem({
        patientUuid,
        encounterUuid: createdEncounterUuid,
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

  // Placeholder for external system integration
  const sendToExternalSystem = (orderPayload) => {
    console.error('Sending to external system:', orderPayload);
    // Implementation to be added later
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
              disabled={!selectedRegimen || isLoadingDrugs}
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
