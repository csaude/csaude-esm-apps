import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormGroup, Select, SelectItem, Accordion, AccordionItem, TextArea } from '@carbon/react';
import { TrashCan } from '@carbon/react/icons';
import styles from '../regimen-drug-order-step-renderer.scss';
import { Drug, Prescription } from '../hooks/types';
import { ALLOWED_FREQUENCIES, ALLOWED_DURATIONS } from '../constants';
import CustomNumberInput from './custom-number-input.component';

interface PrescriptionItemProps {
  prescription: Prescription;
  index: number;
  availableDrugs: Array<Drug>;
  isLoadingDrugs: boolean;
  updatePrescription: (index: number, field: string, value: any) => void;
  removePrescription: (index: number) => void;
  isTablet: boolean;
}

const PrescriptionItem: React.FC<PrescriptionItemProps> = ({
  prescription,
  index,
  availableDrugs,
  isLoadingDrugs,
  updatePrescription,
  removePrescription,
  isTablet,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.prescriptionCard}>
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
              onChange={(e) => {
                const drugUuid = e.target.value;
                if (!drugUuid) {
                  // If no drug selected, set drug to null
                  updatePrescription(index, 'drug', null);
                  return;
                }
                // Find the full drug object by UUID
                const selectedDrug = availableDrugs.find((drug) => drug.uuid === drugUuid);
                if (selectedDrug) {
                  // Pass the full drug object, not just the UUID
                  updatePrescription(index, 'drug', selectedDrug);
                }
              }}
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
  );
};

export default PrescriptionItem;
