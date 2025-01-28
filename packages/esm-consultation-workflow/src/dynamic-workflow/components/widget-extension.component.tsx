import React, { useEffect, useMemo } from 'react';
import { attach, getAssignedExtensions, ExtensionSlot } from '@openmrs/esm-framework';

interface WidgetExtensionProps {
  patientUuid: string;
  extensionId: string;
  stepId: string;
}

const WidgetExtension: React.FC<WidgetExtensionProps> = ({ patientUuid, extensionId, stepId }) => {
  useEffect(() => {
    const assignedExtensions = getAssignedExtensions(stepId);
    assignedExtensions.filter((ext) => ext.id === extensionId).length === 0 && attach(stepId, extensionId);
  }, []);

  return (
    <ExtensionSlot
      name={stepId}
      state={{
        onOrdersSaved: (data: any) => {
          console.log('Saved Orders ', data);
        },
      }}
    />
  );
};
export default WidgetExtension;
