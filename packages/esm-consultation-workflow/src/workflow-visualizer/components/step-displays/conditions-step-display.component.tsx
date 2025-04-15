import React, { useState, useEffect } from 'react';
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
import { openmrsFetch, restBaseUrl, formatDate } from '@openmrs/esm-framework';
import styles from './step-display.scss';

interface Condition {
  uuid: string;
  display: string;
  clinicalStatus: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
  code: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
  onsetDateTime: string;
  recordedDate: string;
}

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
  const [conditions, setConditions] = useState<Array<Condition>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConditionData = async () => {
      if (!step.dataReference) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // For conditions, the dataReference might be a single ID or an array of IDs
        let conditionIds: string[] = [];

        try {
          // Try to parse as JSON array first
          conditionIds = JSON.parse(step.dataReference);
          if (!Array.isArray(conditionIds)) {
            conditionIds = [step.dataReference]; // Use as single ID
          }
        } catch (e) {
          // If parsing fails, use as single ID
          conditionIds = [step.dataReference];
        }

        if (conditionIds.length === 0) {
          setConditions([]);
          setIsLoading(false);
          return;
        }

        const conditionsData = await Promise.all(
          conditionIds.map(async (id) => {
            const response = await openmrsFetch(`${restBaseUrl}/condition/${id}`);
            return response.data;
          }),
        );

        setConditions(conditionsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching condition data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch condition data'));
        setIsLoading(false);
      }
    };

    fetchConditionData();
  }, [step.dataReference]);

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

  if (conditions.length === 0) {
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
          {conditions.map((condition) => (
            <StructuredListRow key={condition.uuid}>
              <StructuredListCell>
                <div className={styles.conditionCell}>
                  <span>{condition.code?.coding?.[0]?.display || condition.display}</span>
                </div>
              </StructuredListCell>
              <StructuredListCell>
                {condition.clinicalStatus?.coding?.[0]?.display ? (
                  <Tag type={getClinicalStatusType(condition.clinicalStatus.coding[0].display)}>
                    {condition.clinicalStatus.coding[0].display}
                  </Tag>
                ) : (
                  <span className={styles.noData}>{t('notSpecified', 'Not specified')}</span>
                )}
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
