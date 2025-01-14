import { InlineLoading, Tag } from '@carbon/react';
import { closeWorkspace, ErrorState } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './../consultation-workflow.scss';
import { useConditions } from './step-hooks';

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
