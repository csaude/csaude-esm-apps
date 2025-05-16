import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import styles from '../regimen-drug-order-step-renderer.scss';
import type { Drug, Prescription } from '../hooks/types';
import PrescriptionItem from './prescription-item.component';

interface PrescriptionListProps {
  prescriptions: Array<Prescription>;
  availableDrugs: Array<Drug>;
  isLoadingDrugs: boolean;
  selectedRegimen: any;
  prescriptionError: string | null;
  updatePrescription: (index: number, field: string, value: any) => void;
  removePrescription: (index: number) => void;
  addEmptyPrescription: () => void;
  isTablet: boolean;
}

const PrescriptionList: React.FC<PrescriptionListProps> = ({
  prescriptions,
  availableDrugs,
  isLoadingDrugs,
  selectedRegimen,
  prescriptionError,
  updatePrescription,
  removePrescription,
  addEmptyPrescription,
  isTablet,
}) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.sectionTile}>
      <h4 className={styles.sectionHeader}>{t('prescriptions', 'Formulações')}</h4>

      {prescriptionError && <div className={styles.errorText}>{prescriptionError}</div>}

      <div className={styles.prescriptionList}>
        {prescriptions.map((prescription, index) => (
          <PrescriptionItem
            key={index}
            prescription={prescription}
            index={index}
            availableDrugs={availableDrugs}
            isLoadingDrugs={isLoadingDrugs}
            updatePrescription={updatePrescription}
            removePrescription={removePrescription}
            isTablet={isTablet}
          />
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
  );
};

export default PrescriptionList;
