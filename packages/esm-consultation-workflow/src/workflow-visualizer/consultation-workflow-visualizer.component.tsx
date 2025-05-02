import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel, TabPanels, Tag } from '@carbon/react';
import styles from './consultation-workflow-visualizer.scss';
import { useConsultationWorkflowData, ConsultationWorkflowData } from '../hooks/useConsultationWorkflowData';
import ConsultationWorkflowList from './components/consultation-workflow-list.component';
import ConsultationWorkflowDetails from './components/consultation-workflow-details.component';

interface Props {
  patientUuid: string;
}

const ConsultationsWorkflowsVisualizer = ({ patientUuid }: Props) => {
  const { t } = useTranslation();
  const [selectedWorkflow, setSelectedWorkflow] = useState<ConsultationWorkflowData | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // Fetch workflow data using our custom hook
  const { consultationWorkflows, isLoading, error } = useConsultationWorkflowData(patientUuid);

  const handleWorkflowClick = (workflow: ConsultationWorkflowData) => {
    setSelectedWorkflow(workflow);
    setSelectedTabIndex(1); // Switch to the details tab
  };

  return (
    <div className={styles.container}>
      <Tabs selectedIndex={selectedTabIndex} onChange={({ selectedIndex }) => setSelectedTabIndex(selectedIndex)}>
        <TabList aria-label="Workflow tabs" contained>
          <Tab>{t('workflowList', 'Lista de Fluxos')}</Tab>
          <Tab disabled={!selectedWorkflow}>
            {selectedWorkflow
              ? `${t('workflowDetails', 'Detalhes')}: ${selectedWorkflow.workflowConfig.name}`
              : t('selectWorkflow', 'Selecione um fluxo para ver os detalhes')}
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
              <ConsultationWorkflowDetails workflow={selectedWorkflow} onBackClick={() => setSelectedTabIndex(0)} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default ConsultationsWorkflowsVisualizer;
