import { NullablePatient, showModal, useLayoutType, Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Allergy } from '../hooks/useAllergies';
import type { WorkflowConfig, WorkflowStep } from '../types';
import { useWorkflow, WorkflowProvider } from '../workflow-context';
import AllergiesStepRenderer from './allergies-step-renderer.component';

jest.mock('../types');

jest.mock('@openmrs/esm-framework', () => ({
  closeWorkspace: jest.fn(),
  useLayoutType: jest.fn(),
  formatDate: jest.fn(() => '01/01/2023'),
  parseDate: jest.fn((dateString) => new Date(dateString)),
  showModal: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ErrorState: jest.fn(() => <div data-testid="error-state"></div>),
  EmptyState: jest.fn(() => <div data-testid="empty-state"></div>),
  launchPatientWorkspace: jest.fn(),
}));

const mockSteps: WorkflowStep[] = [
  {
    id: 'step-1',
    title: 'Step 1',
    renderType: 'form',
    weight: 1,
    formId: 'form-1',
  },
  {
    id: 'step-2',
    title: 'Step 2',
    renderType: 'medications',
    weight: 2,
  },
  {
    id: 'step-3',
    title: 'Step 3',
    renderType: 'conditions',
    weight: 1,
  },
];
const mockConfig: WorkflowConfig = {
  uuid: 'workflow-1',
  name: 'Test Workflow',
  steps: mockSteps,
  description: '',
  version: '1.0',
};
let visit: jest.Mocked<Visit>;
let patient: jest.Mocked<NullablePatient>;
const mockWorkflowProviderProps = {
  workflowConfig: mockConfig,
  patientUuid: 'patient-uuid',
  visit: visit,
  patient: patient,
  onCancel: jest.fn(),
  onComplete: jest.fn(),
};

const mockAllergies: Allergy[] = [
  {
    uuid: '1',
    display: 'Penicillin',
    severity: { uuid: 'severity-1-uuid', display: 'severe' },
    reactions: [
      { reaction: { uuid: 'reaction-1-uuid', display: 'Rash' } },
      { reaction: { uuid: 'reaction-2-uuid', display: 'Fever' } },
    ],
    lastUpdated: '2023-01-01T00:00:00.000Z',
    note: 'Patient experienced severe reaction',
    clinicalStatus: '',
    criticality: '',
    recordedDate: '',
    recordedBy: '',
    recorderType: '',
    reactionToSubstance: '',
  },
  {
    uuid: '2',
    display: 'Peanuts',
    severity: { uuid: 'severity-2-uuid', display: 'moderate' },
    reactions: [
      { reaction: { uuid: 'reaction-3-uuid', display: 'Swelling' } },
      { reaction: { uuid: 'reaction-4-uuid', display: 'Hives' } },
    ],
    lastUpdated: '2022-12-01T00:00:00.000Z',
    note: 'Avoid all peanut products',
    clinicalStatus: '',
    criticality: '',
    recordedDate: '',
    recordedBy: '',
    recorderType: '',
    reactionToSubstance: '',
  },
];

jest.mock('../workflow-context', () => ({
  ...jest.requireActual('../workflow-context'),
  useWorkflow: jest.fn(),
}));

describe('AllergiesStepRenderer', () => {
  const stepId = 'step-1-allergies';

  const mockAllergyStepData = (allergies: Allergy[]) => ({
    state: { stepsData: { [stepId]: { allergies } } },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when allergies array is empty', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useWorkflow as jest.Mock).mockReturnValue(mockAllergyStepData([]));

    render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <AllergiesStepRenderer
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
          onStepComplete={jest.fn()}
        />
      </WorkflowProvider>,
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders AllergiesSummaryTable on tablet layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('tablet');
    (useWorkflow as jest.Mock).mockReturnValue(mockAllergyStepData(mockAllergies));

    render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <AllergiesStepRenderer
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
          onStepComplete={jest.fn()}
        />
      </WorkflowProvider>,
    );

    expect(screen.getByLabelText('allergies summary')).toBeInTheDocument();
    expect(screen.getByText('Penicillin')).toBeInTheDocument();
    expect(screen.getByText('Peanuts')).toBeInTheDocument();
  });

  it('renders AllergiesSummaryCard on desktop layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useWorkflow as jest.Mock).mockReturnValue(mockAllergyStepData(mockAllergies));

    render(
      <AllergiesStepRenderer
        stepId={stepId}
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
        stepId={stepId}
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
        stepId={stepId}
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
        stepId={stepId}
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
