import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import styles from '../regimen-drug-order-step-renderer.scss';
import type { Regimen, TherapeuticLine, Justification } from '../hooks/types';
import RegimenSection from './regimen-section.component';
import TherapeuticLineSection from './therapeutic-line-section.component';
import JustificationSection from './justification-section.component';

interface RegimenDataSectionProps {
  regimens: Array<Regimen>;
  selectedRegimen: Regimen | null;
  regimenError: string | null;
  isLoadingRegimens: boolean;
  handleRegimenChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  lines: Array<TherapeuticLine>;
  selectedLine: TherapeuticLine | null;
  lineError: string | null;
  isLoadingLines: boolean;
  handleLineChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  changeLine: string;
  handleChangeLineChange: (value: string) => void;

  justifications: Array<Justification>;
  selectedJustification: Justification | null;
  justificationError: string | null;
  isLoadingJustifications: boolean;
  handleJustificationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const RegimenDataSection: React.FC<RegimenDataSectionProps> = ({
  regimens,
  selectedRegimen,
  regimenError,
  isLoadingRegimens,
  handleRegimenChange,
  lines,
  selectedLine,
  lineError,
  isLoadingLines,
  handleLineChange,
  changeLine,
  handleChangeLineChange,
  justifications,
  selectedJustification,
  justificationError,
  isLoadingJustifications,
  handleJustificationChange,
}) => {
  const { t } = useTranslation();

  return (
    <Tile className={styles.sectionTile}>
      <h4 className={styles.sectionHeader}>{t('regimenData', 'Dados do regime')}</h4>
      <div className={styles.prescriptionCard}>
        <div className={styles.prescriptionHeader}>
          <RegimenSection
            regimens={regimens}
            selectedRegimen={selectedRegimen}
            regimenError={regimenError}
            isLoadingRegimens={isLoadingRegimens}
            handleRegimenChange={handleRegimenChange}
          />

          <TherapeuticLineSection
            lines={lines}
            selectedLine={selectedLine}
            lineError={lineError}
            isLoadingLines={isLoadingLines}
            handleLineChange={handleLineChange}
            selectedRegimen={selectedRegimen}
            changeLine={changeLine}
          />

          <JustificationSection
            changeLine={changeLine}
            handleChangeLineChange={handleChangeLineChange}
            justifications={justifications}
            selectedJustification={selectedJustification}
            justificationError={justificationError}
            isLoadingJustifications={isLoadingJustifications}
            handleJustificationChange={handleJustificationChange}
          />
        </div>
      </div>
    </Tile>
  );
};

export default RegimenDataSection;
