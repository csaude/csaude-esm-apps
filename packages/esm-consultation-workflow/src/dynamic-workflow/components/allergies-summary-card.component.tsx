import React from 'react';
import { useTranslation } from 'react-i18next';
import { Allergy } from '../hooks/useAllergies';
import styles from './components.scss';
import { Tag, FormLabel } from '@carbon/react';
import { AllergiesActionMenu } from './allergies-step-renderer.component';

interface AllergiesSummaryCardProps {
  allergies: Allergy[];
  patientUuid: string;
  isDesktop: boolean;
  mutate: () => void;
}

const AllergiesSummaryCard = ({ allergies, isDesktop, patientUuid, mutate }: AllergiesSummaryCardProps) => {
  const { t } = useTranslation();

  return (
    <>
      {allergies.map((allergy, i) => (
        <div
          className={isDesktop ? styles.desktopContainer : styles.tabletContainer}
          key={allergy.id}
          style={{
            backgroundColor: i % 2 == 0 ? '#f4f4f4' : undefined,
          }}>
          <div className={styles.headingContainer}>
            <div className={styles.heading}>
              <div className={styles.notes}>{allergy.display}Heading heres</div>
              <FormLabel>{allergy.reactionSeverity.toUpperCase()}</FormLabel>
            </div>
            <AllergiesActionMenu allergy={allergy} patientUuid={patientUuid} mutate={mutate} />
          </div>
          <div className={styles.cardBody}>
            <div>
              <FormLabel>{t('reacao', 'Reação')}:</FormLabel>
              <div>
                {allergy.reactionManifestations.map((m) => (
                  <Tag key={m}>{m}</Tag>
                ))}
              </div>
            </div>
            <div>
              <FormLabel>{t('comments', 'Comments')}:</FormLabel>
              <div className={styles.notes}>{allergy.note}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AllergiesSummaryCard;
