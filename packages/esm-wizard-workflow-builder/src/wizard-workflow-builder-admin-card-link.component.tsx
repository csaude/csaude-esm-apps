import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';

const WizardWorkflowBuilderCardLink: React.FC = () => {
  const { t } = useTranslation();
  const header = t('manageForms', 'Manage Dynamic Wizard Workflow');
  return (
    <Layer>
      <ClickableTile href={`${window.spaBase}/wizard-workflow-builder`} target="_blank" rel="noopener noreferrer">
        <div>
          <div className="heading">{header}</div>
          <div className="content">{t('wizardWorkflowBuilder', 'Wizard Workflow Builder')}</div>
        </div>
        <div className="iconWrapper">
          <ArrowRight size={16} />
        </div>
      </ClickableTile>
    </Layer>
  );
};

export default WizardWorkflowBuilderCardLink;
