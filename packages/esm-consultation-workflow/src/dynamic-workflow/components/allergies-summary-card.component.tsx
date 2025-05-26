import { FormLabel, Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Allergy } from '../hooks/useAllergies';
import { AllergiesActionMenu } from './allergies-step-renderer.component';
import styles from './components.scss';

interface AllergiesSummaryCardProps {
  allergies: Allergy[];
  onDelete: (allergyId: string) => void;
  patientUuid: string;
  isDesktop: boolean;
}

const AllergiesSummaryCard = ({ allergies, isDesktop, patientUuid, onDelete }: AllergiesSummaryCardProps) => {
  const { t } = useTranslation();

  return (
    <>
      {allergies.map((allergy, i) => (
        <div
          className={isDesktop ? styles.desktopContainer : styles.tabletContainer}
          key={allergy.uuid}
          style={{
            backgroundColor: i % 2 == 0 ? '#f4f4f4' : undefined,
          }}>
          <div className={styles.headingContainer}>
            <div className={styles.heading}>
              <div className={styles.notes}>{allergy.display}</div>
              <FormLabel>{allergy.severity.display.toUpperCase()}</FormLabel>
            </div>
            <AllergiesActionMenu allergy={allergy} patientUuid={patientUuid} onDelete={onDelete} />
          </div>
          <div className={styles.cardBody}>
            <div>
              <FormLabel>{t('reacao', 'Reação')}:</FormLabel>
              <div>
                {allergy.reactions.map(({ reaction }) => (
                  <Tag key={reaction.uuid}>{reaction.display}</Tag>
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
