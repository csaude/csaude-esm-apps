import { Stethoscope } from '@carbon/react/icons';
import { ActionMenuButton, useFeatureFlag } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib/src';
import React from 'react';
import { useTranslation } from 'react-i18next';

function ConsultationWorkflowActionButton() {
  const { t } = useTranslation();
  const launchConsultationWorkspace = useLaunchWorkspaceRequiringVisit('dynamic-workflow-workspace');
  const isConsultationWorkflowEnabled = useFeatureFlag('consultation-workflow');
  if (!isConsultationWorkflowEnabled) {
    return null;
  }
  return (
    <ActionMenuButton
      getIcon={() => <Stethoscope />}
      label={t('consultationWorkflow', 'Consulta clínica')}
      iconDescription={t('consultationWorkflow', 'Consulta clínica')}
      handler={() => launchConsultationWorkspace()}
      type={'consultation-workflow'}
    />
  );
}

export default ConsultationWorkflowActionButton;
