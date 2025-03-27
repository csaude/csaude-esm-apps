import React from 'react';
import styles from './consultation-workflows.scss';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import ConsultationsWorkflowsDashboard from './consultation-workflows-dashboard.component';

export default function ConsultationWorkflowsWorkspace(props: DefaultPatientWorkspaceProps) {
  return (
    <div className={styles.container}>
      <ConsultationsWorkflowsDashboard {...props} />
    </div>
  );
}
