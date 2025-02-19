import React from 'react';
import { render, screen } from '@testing-library/react';
import LabResults from './lab-results-summary.component';
import { useObs } from './lab-results.resources';

jest.mock('./lab-results-hooks', () => ({
  useObs: jest.fn(),
}));

jest.mock('@carbon/react', () => ({
  InlineLoading: () => <div>Loading...</div>,
  Tag: ({ children }) => <div>{children}</div>,
}));

const mockObservations = [
  {
    fullUrl: 'https://example.com/observation1',
    resource: {
      resourceType: 'Observation',
      id: '1',
      status: 'final',
      effectiveDateTime: '2025-02-15T00:00:00Z',
      code: {
        text: 'Blood Pressure',
        coding: [{ code: '123', display: 'Blood Pressure' }],
      },
      valueQuantity: {
        value: 120,
        unit: 'mmHg',
      },
    },
  },
  {
    fullUrl: 'https://example.com/observation1',
    resource: {
      resourceType: 'Observation',
      id: '2',
      status: 'final',
      effectiveDateTime: '2025-02-15T00:00:00Z',
      code: {
        text: 'Carga Viral',
        coding: [{ code: '124', display: 'Carga Viral' }],
      },
      valueCodeableConcept: {
        coding: [
          {
            code: '124',
            display: 'CARGA VIRAL INDETECTAVEL',
          },
        ],
        text: 'CARGA VIRAL INDETECTAVEL',
      },
    },
  },
  {
    fullUrl: 'https://example.com/observation2',
    resource: {
      resourceType: 'Observation',
      id: '3',
      status: 'final',
      effectiveDateTime: '2025-02-14T00:00:00Z',
      code: {
        text: 'Heart Rate',
        coding: [{ code: '125', display: 'Heart Rate' }],
      },
      valueQuantity: {
        value: 80,
        unit: 'bpm',
      },
    },
  },
];

describe('LabResults', () => {
  it('should display loader when data is loading', () => {
    (useObs as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      obs: [],
    });

    render(<LabResults patientUuid="123" title="Lab Results" conceptUuids={['concept-01']} link="/lab-results" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error message when there is an error', () => {
    (useObs as jest.Mock).mockReturnValue({
      isLoading: false,
      error: { message: 'Failed to fetch' },
      obs: [],
    });

    render(<LabResults patientUuid="123" title="Lab Results" conceptUuids={['concept-01']} link="/lab-results" />);
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('should display no data message when no observations are found', () => {
    (useObs as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      obs: [],
    });

    render(<LabResults patientUuid="123" title="Lab Results" conceptUuids={['concept-01']} link="/lab-results" />);
    expect(screen.getByText('Nenhum dado foi registado para este utente')).toBeInTheDocument();
  });

  it('should display the latest observation', async () => {
    (useObs as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      obs: mockObservations,
    });

    render(<LabResults patientUuid="123" title="Lab Results" conceptUuids={['concept-01']} link="/lab-results" />);
    expect(screen.getByText('Blood Pressure')).toBeInTheDocument();
    expect(screen.getByText('CARGA VIRAL INDETECTAVEL')).toBeInTheDocument();
  });
});
