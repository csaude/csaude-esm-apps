import React from 'react';
import LabResultsSummary from './lab-results-summary.component';

interface Props {
  patient: {
    id: string;
  };
}

const LabResultsSummaryWrapper: React.FC<Props> = ({ patient }) => {
  const LabResults = [
    {
      title: 'Viral Load',
      conceptUuids: ['e1d6247e-1d5f-11e0-b929-000c29ad1d07', 'e1da2704-1d5f-11e0-b929-000c29ad1d07'],
      link: 'viral-load',
    },
    {
      title: 'CD4 Absolute',
      conceptUuids: ['e1dd5ab4-1d5f-11e0-b929-000c29ad1d07'],
      link: 'cd4-absolute',
    },
    {
      title: 'Genexpert',
      conceptUuids: ['b08eb89b-c609-4d15-ab81-53ad7c745332'],
      link: 'genexpert',
    },
    {
      title: 'TB LAM',
      conceptUuids: ['ef139cb2-97c1-4c0f-9189-5e0711a45b8f', '5d11cf23-9c8b-4ee7-a2d4-b81993123d0d'],
      link: 'tb-lam',
    },
  ];

  return (
    <div>
      {LabResults.map((labResult, index) => (
        <LabResultsSummary
          key={index}
          patientUuid={patient.id}
          conceptUuids={labResult.conceptUuids}
          title={labResult.title}
          link={labResult.link}
        />
      ))}
    </div>
  );
};

export default LabResultsSummaryWrapper;
