import React from 'react';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { openmrsFetch, closeWorkspace, ErrorState } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { InlineLoading, Tag } from '@carbon/react';
import styles from './../consultation-workflow.scss';

interface FHIRResponseInterface {
  entry: EntryInterface[];
}

interface EntryInterface {
  fullUrl: string;
  resource: {
    id: string;
    clinicalStatus: boolean;
    code: {
      text: string;
    };
  };
}

interface UseConditions {
  isLoading: boolean;
  error: Error;
  conditions: EntryInterface[];
  mutate: () => void;
}

function useConditions(patientUuid: string): UseConditions {
  const url = `/ws/fhir2/R4/Condition?patient=${patientUuid}`;
  const { data, error, isLoading, mutate } = useSWR<{ data: FHIRResponseInterface }, Error>(url, openmrsFetch);

  return {
    isLoading,
    error,
    conditions: data?.data.entry,
    mutate,
  };
}

function launchClinicalConditionsWorkspace({ onConditionsSave }: { onConditionsSave: () => void }): void {
  launchPatientWorkspace('conditions-form-workspace', {
    closeWorkspaceWithSavedChanges: () => {
      closeWorkspace('conditions-form-workspace', { ignoreChanges: true, onWorkspaceClose: onConditionsSave });
    },
  });
}

const ConditionsStep: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { isLoading, error, conditions, mutate } = useConditions(patientUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <InlineLoading />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle="Erro!" />;
  }

  if (!conditions) {
    return (
      <EmptyState
        displayText={t('conditions', 'Conditions')}
        headerTitle={t('conditions', 'Conditions')}
        launchForm={() => launchClinicalConditionsWorkspace({ onConditionsSave: mutate })}
      />
    );
  }

  return (
    <div className={styles.step}>
      <h4>{t('conditions', 'Conditions')}</h4>
      <div>
        {conditions.map((condition, index) => (
          <Tag key={index}>{condition.resource.code.text}</Tag>
        ))}
      </div>
    </div>
  );
};

export default ConditionsStep;
