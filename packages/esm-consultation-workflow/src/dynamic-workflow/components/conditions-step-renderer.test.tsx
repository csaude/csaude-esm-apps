import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConditionsStepRenderer from './conditions-step-renderer.component';
import { useConditions } from '../hooks/useConditions';
import { closeWorkspace, useLayoutType, showModal } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

jest.mock('@openmrs/esm-framework', () => ({
  closeWorkspace: jest.fn(),
  useLayoutType: jest.fn(),
  formatDate: jest.fn((date) => '01/01/2023'),
  parseDate: jest.fn((dateString) => new Date(dateString)),
  showModal: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ErrorState: jest.fn(() => <div data-testid="error-state"></div>),
  launchPatientWorkspace: jest.fn(),
}));

jest.mock('../hooks/useConditions', () => ({
  useConditions: jest.fn(),
}));

const mockConditions = [
  {
    id: '1',
    display: 'Hypertension',
    clinicalStatus: 'active',
    onsetDateTime: '2023-01-01T00:00:00.000Z',
    abatementDateTime: null,
  },
  {
    id: '2',
    display: 'Diabetes',
    clinicalStatus: 'inactive',
    onsetDateTime: '2022-01-01T00:00:00.000Z',
    abatementDateTime: '2023-01-01T00:00:00.000Z',
  },
];

describe('ConditionsStepRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useConditions as jest.Mock).mockReturnValue({
      conditions: null,
      error: null,
      isLoading: true,
      mutate: jest.fn(),
    });

    render(
      <ConditionsStepRenderer
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
    (useConditions as jest.Mock).mockReturnValue({
      conditions: null,
      error: new Error('Test error'),
      isLoading: false,
      mutate: jest.fn(),
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('renders empty state when conditions is empty', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useConditions as jest.Mock).mockReturnValue({
      conditions: [],
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );
    expect(screen.getByText('Adicionar')).toBeInTheDocument();
  });

  it('renders ConditionsSummaryTable on tablet layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('tablet');
    (useConditions as jest.Mock).mockReturnValue({
      conditions: mockConditions,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('conditions summary')).toBeInTheDocument();
    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
  });

  it('renders ConditionsSummaryCard on desktop layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useConditions as jest.Mock).mockReturnValue({
      conditions: mockConditions,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('launches conditions form when add button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    (useConditions as jest.Mock).mockReturnValue({
      conditions: mockConditions,
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const addButton = screen.getByText('Adicionar');
    fireEvent.click(addButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('conditions-form-workspace', expect.any(Object));
  });

  it('launches edit conditions form when edit button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    (useConditions as jest.Mock).mockReturnValue({
      conditions: mockConditions,
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const editButtons = screen.getAllByLabelText('Editar');
    fireEvent.click(editButtons[0]);

    expect(launchPatientWorkspace).toHaveBeenCalledWith(
      'conditions-form-workspace',
      expect.objectContaining({
        workspaceTitle: 'Editar Condição',
        formContext: 'editing',
      }),
    );
  });

  it('launches delete confirmation dialog when delete button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    (useConditions as jest.Mock).mockReturnValue({
      conditions: mockConditions,
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const deleteButtons = screen.getAllByLabelText('Apagar');
    fireEvent.click(deleteButtons[0]);

    expect(showModal).toHaveBeenCalledWith(
      'condition-delete-confirmation-dialog',
      expect.objectContaining({
        conditionId: '1',
        patientUuid: 'test-uuid',
      }),
    );
  });

  it('mutates data after edit form submission', async () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    (useConditions as jest.Mock).mockReturnValue({
      conditions: mockConditions,
      error: null,
      isLoading: false,
      mutate: mutateMock,
    });

    render(
      <ConditionsStepRenderer
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const editButtons = screen.getAllByLabelText('Editar');
    fireEvent.click(editButtons[0]);

    // Extract the closeWorkspaceWithSavedChanges function
    const launchArgs = (launchPatientWorkspace as jest.Mock).mock.calls[0][1];
    const closeWorkspaceWithSavedChanges = launchArgs.closeWorkspaceWithSavedChanges;

    // Simulate form submission
    closeWorkspaceWithSavedChanges();

    // Extract the onWorkspaceClose callback
    const closeArgs = (closeWorkspace as jest.Mock).mock.calls[0][1];
    const onWorkspaceClose = closeArgs.onWorkspaceClose;

    // Simulate workspace close
    onWorkspaceClose();

    expect(mutateMock).toHaveBeenCalled();
  });
});
