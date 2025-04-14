import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel, TabPanels, Tag } from '@carbon/react';
import styles from './consultation-workflow-visualizer.scss';
import { useConsultationWorkflowData, ConsultationWorkflowData } from '../hooks/useConsultationWorkflowData';
import ConsultationWorkflowList from './components/consultation-workflow-list.component';
import WorkflowDetails from './components/workflow-details.component';

const ConsultationsWorkflowsVisualizer = () => {
  const { t } = useTranslation();
  const { patientUuid } = useParams();
  const [selectedWorkflow, setSelectedWorkflow] = useState<ConsultationWorkflowData | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // Fetch workflow data using our custom hook
  const { consultationWorkflows, isLoading, error } = useConsultationWorkflowData(
    patientUuid || 'c0b5e0b5-38ff-4913-8360-532b8ed2f328',
  );

  const handleWorkflowClick = (workflow: ConsultationWorkflowData) => {
    setSelectedWorkflow(workflow);
    setSelectedTabIndex(1); // Switch to the details tab
  };

  return (
    <div className={styles.container}>
      <Tabs selectedIndex={selectedTabIndex} onChange={({ selectedIndex }) => setSelectedTabIndex(selectedIndex)}>
        <TabList aria-label="Workflow tabs" contained>
          <Tab>{t('workflowList', 'Workflow List')}</Tab>
          <Tab disabled={!selectedWorkflow}>
            {selectedWorkflow
              ? `${t('workflowDetails', 'Details')}: ${selectedWorkflow.workflowConfig.name}`
              : t('selectWorkflow', 'Select a workflow to view details')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <ConsultationWorkflowList
              consultationWorkflows={consultationWorkflows}
              isLoading={isLoading}
              error={error}
              onWorkflowClick={handleWorkflowClick}
            />
          </TabPanel>
          <TabPanel>
            {selectedWorkflow && (
              <WorkflowDetails workflow={selectedWorkflow} onBackClick={() => setSelectedTabIndex(0)} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default ConsultationsWorkflowsVisualizer;
