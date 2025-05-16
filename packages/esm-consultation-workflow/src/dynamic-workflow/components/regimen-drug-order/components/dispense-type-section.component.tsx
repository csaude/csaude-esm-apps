import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, Select, SelectItem, Tile } from '@carbon/react';
import styles from '../regimen-drug-order-step-renderer.scss';
import { AllowedDurationUnitType } from '../constants';

interface DispenseTypeSectionProps {
  finalDuration: AllowedDurationUnitType | null;
  dispenseTypes: Array<any>;
  selectedDispenseType: string;
  dispenseTypeError: string | null;
  isLoadingDispenseTypes: boolean;
  handleDispenseTypeChange: (value: string) => void;
}

const DispenseTypeSection: React.FC<DispenseTypeSectionProps> = ({
  finalDuration,
  dispenseTypes,
  selectedDispenseType,
  dispenseTypeError,
  isLoadingDispenseTypes,
  handleDispenseTypeChange,
}) => {
  const { t } = useTranslation();

  return (
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
              onChange={(e) => handleDispenseTypeChange(e.target.value)}
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
  );
};

export default DispenseTypeSection;
