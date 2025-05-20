import React, { useEffect } from 'react';
import { attach, getAssignedExtensions, ExtensionSlot } from '@openmrs/esm-framework';

interface WidgetExtensionProps {
  patientUuid: string;
  extensionId: string;
  stepId: string;
}

const WidgetExtension: React.FC<WidgetExtensionProps> = ({ extensionId, stepId }) => {
  useEffect(() => {
    const assignedExtensions = getAssignedExtensions(stepId);
    assignedExtensions.filter((ext) => ext.id === extensionId).length === 0 && attach(stepId, extensionId);
  }, [extensionId, stepId]);

  return (
    <ExtensionSlot name={stepId} />
  );
};
export default WidgetExtension;
