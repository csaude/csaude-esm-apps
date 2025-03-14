import { formatDate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Condition } from '../hooks/useConditions';
import styles from './components.scss';
import { FormLabel } from '@carbon/react';
import { ConditionsActionMenu } from './conditions-step-renderer.component';

interface ConditionsSummaryCardProps {
  conditions: Condition[];
  patientUuid: string;
  isDesktop: boolean;
  mutate: () => void;
}

const ConditionsSummaryCard = ({ conditions, isDesktop, patientUuid, mutate }: ConditionsSummaryCardProps) => {
  const { t } = useTranslation();

  const mapCondition = (condition: Condition): any => {
    return {
      id: condition.id,
      isSelected: false,
      isExpanded: false,
      disabled: false,
      cells: [
        {
          id: `${condition.id}:display`,
          value: condition.display,
          isEditable: false,
          isEditing: false,
          isValid: true,
          errors: null,
          hasAILabelHeader: false,
          info: {
            header: 'display',
          },
        },
      ],
    };
  };

  return (
    <>
      {conditions.map((condition, i) => (
        <div
          className={isDesktop ? styles.desktopContainer : styles.tabletContainer}
          key={condition.id}
          style={{
            backgroundColor: i % 2 == 0 ? '#f4f4f4' : undefined,
          }}>
          <div className={styles.headingContainer}>
            <div className={styles.heading}>
              <div className={styles.notes}>{condition.display}</div>
              <FormLabel>{condition.clinicalStatus.toUpperCase()}</FormLabel>
            </div>
            <ConditionsActionMenu patientUuid={patientUuid} condition={mapCondition(condition)} mutate={mutate} />
          </div>
          <div className={styles.cardBody}>
            <div>
              <FormLabel>{t('date', 'Data')}:</FormLabel>
              <div className={styles.notes}>{formatDate(parseDate(condition.onsetDateTime))}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ConditionsSummaryCard;
