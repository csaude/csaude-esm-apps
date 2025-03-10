import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import ReceptionProgramsForm from './form/reception-programs-form.component';

interface ProgramsFormProps extends DefaultPatientWorkspaceProps {
  programEnrollmentId?: string;
}

const ProgramsForm: React.FC<ProgramsFormProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  patientUuid,
  programEnrollmentId,
  promptBeforeClosing,
}) => {
  return (
    <ReceptionProgramsForm
      patientUuid={patientUuid}
      programEnrollmentId={programEnrollmentId}
      onCancel={closeWorkspace}
      onSave={closeWorkspaceWithSavedChanges}
      onUnsavedData={promptBeforeClosing}
    />
  );
};

export default ProgramsForm;
