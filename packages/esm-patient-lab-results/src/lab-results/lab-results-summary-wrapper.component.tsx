import React from 'react';
import styles from './lab-results.scss';
import LabResultsSummary from './lab-results-summary.component';
import { useTranslation } from 'react-i18next';

interface Props {
  patient: {
    id: string;
  };
}

const LabResultsSummaryWrapper: React.FC<Props> = ({ patient }) => {
  const { t } = useTranslation();
  const headerTitle = t('labResults', 'Resultados Laboratoriais');

  const LabResults = [
    {
      title: t('viralLoad', 'Carga Viral'),
      conceptUuids: ['e1d6247e-1d5f-11e0-b929-000c29ad1d07', 'e1da2704-1d5f-11e0-b929-000c29ad1d07'],
      hash: 'viral-load',
    },
    {
      title: t('cd4Absolute', 'CD4 Absoluto'),
      conceptUuids: ['e1dd5ab4-1d5f-11e0-b929-000c29ad1d07'],
      hash: 'cd4-absolute',
    },
    {
      title: t('genexpert', 'Genexpert'),
      conceptUuids: ['b08eb89b-c609-4d15-ab81-53ad7c745332'],
      hash: 'genexpert',
    },
    {
      title: t('tbLam', 'TB LAM'),
      conceptUuids: ['ef139cb2-97c1-4c0f-9189-5e0711a45b8f', '303a4480-f2b3-4192-a446-725a401ebb09'],
      hash: 'tb-lam',
    },
  ];

  return (
    <div>
      <div className={styles.wrapperHeader}>
        <h4>{headerTitle}</h4>
      </div>

      <div className={styles.wrapperBody}>
        {LabResults.map((labResult, index) => (
          <LabResultsSummary
            key={index}
            patientUuid={patient.id}
            conceptUuids={labResult.conceptUuids}
            title={labResult.title}
            hash={labResult.hash}
          />
        ))}
      </div>
    </div>
  );
};

export default LabResultsSummaryWrapper;
