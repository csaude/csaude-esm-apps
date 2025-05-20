import React from 'react';
import { InlineNotification } from '@carbon/react';
import styles from '../regimen-drug-order-step-renderer.scss';

interface FormErrorDisplayProps {
  error: string | null;
  title?: string;
}

/**
 * A component to display form validation errors consistently
 * @param error The error message to display
 * @param title Optional title for the error notification
 * @returns React component
 */
const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ error, title = 'Error' }) => {
  if (!error) {
    return null;
  }

  return (
    <InlineNotification
      className={styles.errorNotification}
      kind="error"
      lowContrast={false}
      title={title}
      subtitle={error}
    />
  );
};

export default FormErrorDisplay;
