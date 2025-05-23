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
import styles from './step-display.scss';
import { fetchPatientAllergies, filterAllergiesByUuids, type Allergy } from './allergies-step-display.resource';

interface AllergiesStepDisplayProps {
  step: {
    stepId: string;
    stepName: string;
    renderType: string;
    completed: boolean;
    dataReference: string | null;
    patientUuid: string;
  };
}

const AllergiesStepDisplay: React.FC<AllergiesStepDisplayProps> = ({ step }) => {
  const { t } = useTranslation();
  const [allergies, setAllergies] = useState<Array<Allergy>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllergyData = async () => {
      if (!step.dataReference) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Parse the allergyIds from the dataReference
        const allergyIds = JSON.parse(step.dataReference);

        if (!Array.isArray(allergyIds) || allergyIds.length === 0) {
          setAllergies([]);
          setIsLoading(false);
          return;
        }

        // Fetch all patient allergies
        const allergiesResponse = await fetchPatientAllergies(step.patientUuid);

        // Filter to only include the allergies in the dataReference
        const filteredAllergies = filterAllergiesByUuids(allergiesResponse.results, allergyIds);

        setAllergies(filteredAllergies);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching allergy data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch allergy data'));
        setIsLoading(false);
      }
    };

    fetchAllergyData();
  }, [step.dataReference, step.patientUuid]);

  if (isLoading) {
    return <InlineLoading description={t('loadingAllergies', 'Loading allergies...')} />;
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {t('errorLoadingAllergies', 'Error loading allergies: {{message}}', { message: error.message })}
      </div>
    );
  }

  if (allergies.length === 0) {
    return (
      <div className={styles.emptyState}>{t('noAllergiesRecorded', 'No allergies were recorded for this step.')}</div>
    );
  }

  return (
    <div className={styles.stepDisplayContainer}>
      <StructuredListWrapper className={styles.structuredList}>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>{t('allergen', 'Allergen')}</StructuredListCell>
            <StructuredListCell head>{t('reactions', 'Reactions')}</StructuredListCell>
            <StructuredListCell head>{t('severity', 'Severity')}</StructuredListCell>
            <StructuredListCell head>{t('comments', 'Comments')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {allergies.map((allergy) => (
            <StructuredListRow key={allergy.uuid}>
              <StructuredListCell>
                <div className={styles.allergenCell}>
                  <span>{allergy.allergen?.codedAllergen?.display || allergy.display}</span>
                  <Tag type="gray" className={styles.smallTag}>
                    {allergy.allergen?.allergenType || t('notSpecified', 'Not specified')}
                  </Tag>
                </div>
              </StructuredListCell>
              <StructuredListCell>
                {allergy.reactions?.length ? (
                  <div className={styles.reactionsCell}>
                    {allergy.reactions.map((reaction, index) => (
                      <Tag key={index} className={styles.reactionTag}>
                        {reaction.reaction?.display}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <span className={styles.noData}>{t('noneRecorded', 'None recorded')}</span>
                )}
              </StructuredListCell>
              <StructuredListCell>
                {allergy.severity?.display ? (
                  <Tag type={getSeverityTagType(allergy.severity.display)}>{allergy.severity.display}</Tag>
                ) : (
                  <span className={styles.noData}>{t('notSpecified', 'Not specified')}</span>
                )}
              </StructuredListCell>
              <StructuredListCell>
                {allergy.comment ? (
                  <span>{allergy.comment}</span>
                ) : (
                  <span className={styles.noData}>{t('noneRecorded', 'None recorded')}</span>
                )}
              </StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
};

// Helper function to determine tag type based on severity
function getSeverityTagType(severity: string): 'red' | 'yellow' | 'green' | 'gray' {
  const lowerSeverity = severity.toLowerCase();
  if (lowerSeverity.includes('severe') || lowerSeverity.includes('fatal')) {
    return 'red';
  } else if (lowerSeverity.includes('moderate')) {
    return 'yellow';
  } else if (lowerSeverity.includes('mild')) {
    return 'green';
  }
  return 'gray';
}

export default AllergiesStepDisplay;
