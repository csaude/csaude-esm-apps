import { Stethoscope } from '@carbon/react/icons';
import { ActionMenuButton } from '@openmrs/esm-framework';
import { useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib/src';
import React from 'react';
import { useTranslation } from 'react-i18next';

function ConsultationWorkflowActionButton() {
  const { t } = useTranslation();
  const launchConsultationWorkspace = useLaunchWorkspaceRequiringVisit('consultation-workflow-workspace');
  return (
    <ActionMenuButton
      getIcon={() => <Stethoscope />}
      label={t('consultationWorkflow', 'Consultation workflow')}
      iconDescription={t('consultationWorkflow', 'Consultation workflow')}
      handler={() => launchConsultationWorkspace()}
      type={'consultation-workflow'}
    />
  );
}

export default ConsultationWorkflowActionButton;
