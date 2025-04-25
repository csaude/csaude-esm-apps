import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  InlineLoading,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Tag,
} from '@carbon/react';
import { formatDate, usePatient } from '@openmrs/esm-framework';
import styles from './step-display.scss';
import { useConditions } from './conditions-step-display.resource';

interface ConditionsStepDisplayProps {
  step: {
    stepId: string;
    stepName: string;
    renderType: string;
    completed: boolean;
    dataReference: string | null;
  };
}

const ConditionsStepDisplay: React.FC<ConditionsStepDisplayProps> = ({ step }) => {
  const { t } = useTranslation();
  const { patientUuid } = usePatient();
  const { conditions, isLoading, error } = useConditions(patientUuid);

  // Parse dataReference to get specific condition IDs if available
  let targetConditionIds: string[] = [];
  if (step.dataReference) {
    try {
      const parsed = JSON.parse(step.dataReference);
      targetConditionIds = Array.isArray(parsed) ? parsed : [step.dataReference];
    } catch (e) {
      targetConditionIds = [step.dataReference];
    }
  }

  // Filter conditions based on dataReference if IDs are specified
  const displayConditions =
    targetConditionIds.length > 0 && conditions
      ? conditions.filter((condition) => targetConditionIds.includes(condition.id))
      : conditions;

  if (isLoading) {
    return <InlineLoading description={t('loadingConditions', 'Loading conditions...')} />;
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {t('errorLoadingConditions', 'Error loading conditions: {{message}}', { message: error.message })}
      </div>
    );
  }

  if (!displayConditions || displayConditions.length === 0) {
    return (
      <div className={styles.emptyState}>{t('noConditionsRecorded', 'No conditions were recorded for this step.')}</div>
    );
  }

  const getClinicalStatusType = (status: string): 'green' | 'red' | 'purple' | 'gray' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active')) {
      return 'green';
    }
    if (statusLower.includes('resolved') || statusLower.includes('inactive')) {
      return 'purple';
    }
    if (statusLower.includes('recurrence')) {
      return 'red';
    }
    return 'gray';
  };

  return (
    <div className={styles.stepDisplayContainer}>
      <StructuredListWrapper className={styles.structuredList}>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>{t('condition', 'Condition')}</StructuredListCell>
            <StructuredListCell head>{t('status', 'Status')}</StructuredListCell>
            <StructuredListCell head>{t('onsetDate', 'Onset Date')}</StructuredListCell>
            <StructuredListCell head>{t('recordedDate', 'Recorded Date')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {displayConditions.map((condition) => (
            <StructuredListRow key={condition.id}>
              <StructuredListCell>
                <div className={styles.conditionCell}>
                  <span>{condition.display}</span>
                </div>
              </StructuredListCell>
              <StructuredListCell>
                <Tag type={getClinicalStatusType(condition.clinicalStatus)}>{condition.clinicalStatus}</Tag>
              </StructuredListCell>
              <StructuredListCell>
                {condition.onsetDateTime ? (
                  formatDate(new Date(condition.onsetDateTime))
                ) : (
                  <span className={styles.noData}>{t('notSpecified', 'Not specified')}</span>
                )}
              </StructuredListCell>
              <StructuredListCell>
                {condition.recordedDate ? (
                  formatDate(new Date(condition.recordedDate))
                ) : (
                  <span className={styles.noData}>{t('notSpecified', 'Not specified')}</span>
                )}
              </StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
};

export default ConditionsStepDisplay;
