import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AllergiesStepRenderer from './allergies-step-renderer.component';
import { closeWorkspace, useLayoutType, showModal } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

jest.mock('@openmrs/esm-framework', () => ({
  closeWorkspace: jest.fn(),
  useLayoutType: jest.fn(),
  formatDate: jest.fn(() => '01/01/2023'),
  parseDate: jest.fn((dateString) => new Date(dateString)),
  showModal: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ErrorState: jest.fn(() => <div data-testid="error-state"></div>),
  launchPatientWorkspace: jest.fn(),
}));

jest.mock('../hooks/useAllergies', () => ({
  useAllergies: jest.fn(),
}));

const mockAllergies = [
  {
    id: '1',
    display: 'Penicillin',
    reactionSeverity: 'severe',
    reactionManifestations: ['Rash', 'Fever'],
    lastUpdated: '2023-01-01T00:00:00.000Z',
    note: 'Patient experienced severe reaction',
  },
  {
    id: '2',
    display: 'Peanuts',
    reactionSeverity: 'moderate',
    reactionManifestations: ['Swelling', 'Hives'],
    lastUpdated: '2022-12-01T00:00:00.000Z',
    note: 'Avoid all peanut products',
  },
];

describe('AllergiesStepRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');

    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders empty state when allergies array is empty', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');

    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByText('Adicionar')).toBeInTheDocument();
  });

  it('renders AllergiesSummaryTable on tablet layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('tablet');

    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('allergies summary')).toBeInTheDocument();
    expect(screen.getByText('Penicillin')).toBeInTheDocument();
    expect(screen.getByText('Peanuts')).toBeInTheDocument();
  });

  it('renders AllergiesSummaryCard on desktop layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');

    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByText('SEVERE')).toBeInTheDocument();
    expect(screen.getByText('MODERATE')).toBeInTheDocument();
    expect(screen.getByText('Rash')).toBeInTheDocument();
    expect(screen.getByText('Fever')).toBeInTheDocument();
    expect(screen.getByText('Swelling')).toBeInTheDocument();
    expect(screen.getByText('Hives')).toBeInTheDocument();
  });

  it('launches allergies form when add button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const addButton = screen.getByText('Adicionar');
    fireEvent.click(addButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('patient-allergy-form-workspace', expect.any(Object));
  });

  it('launches edit allergies form when edit button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const editButtons = screen.getAllByLabelText('Editar');
    fireEvent.click(editButtons[0]);

    expect(launchPatientWorkspace).toHaveBeenCalledWith(
      'patient-allergy-form-workspace',
      expect.objectContaining({
        workspaceTitle: 'Edit an Allergy',
        formContext: 'editing',
      }),
    );
  });

  it('launches delete confirmation dialog when delete button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    render(
      <AllergiesStepRenderer
        stepId="step-1-allergies"
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const deleteButtons = screen.getAllByLabelText('Apagar');
    fireEvent.click(deleteButtons[0]);

    expect(showModal).toHaveBeenCalledWith(
      'allergy-delete-confirmation-dialog',
      expect.objectContaining({
        allergyId: '1',
        patientUuid: 'test-uuid',
      }),
    );
  });
});
