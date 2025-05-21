import { closeWorkspace, NullablePatient, showModal, useLayoutType, Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Condition, FHIRCondition } from '../hooks/useConditions';
import { WorkflowConfig, WorkflowStep } from '../types';
import { useWorkflow, WorkflowProvider } from '../workflow-context';
import ConditionsStepRenderer from './conditions-step-renderer.component';
import type { StepComponentHandle } from '../step-registry';

jest.mock('@openmrs/esm-framework', () => ({
  closeWorkspace: jest.fn(),
  useLayoutType: jest.fn(),
  formatDate: jest.fn((date) => '01/01/2023'),
  parseDate: jest.fn((dateString) => new Date(dateString)),
  showModal: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ErrorState: jest.fn(() => <div data-testid="error-state"></div>),
  EmptyState: jest.fn(() => <div data-testid="empty-state"></div>),
  launchPatientWorkspace: jest.fn(),
}));

jest.mock('../workflow-context', () => ({
  ...jest.requireActual('../workflow-context'),
  useWorkflow: jest.fn(),
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

const mockFhirCondition: FHIRCondition = {
  clinicalStatus: {
    coding: [],
    display: undefined,
  },
  code: {
    coding: [],
  },
  id: '',
  onsetDateTime: '',
  recordedDate: '',
  recorder: {
    display: '',
    reference: '',
    type: '',
  },
  resourceType: '',
  subject: {
    display: '',
    reference: '',
    type: '',
  },
  text: {
    div: '',
    status: '',
  },
};

const mockConditions: Condition[] = [
  {
    id: '1',
    display: 'Hypertension',
    clinicalStatus: 'active',
    onsetDateTime: '2023-01-01T00:00:00.000Z',
    abatementDateTime: null,
    conceptId: '',
    recordedDate: '',
  },
  {
    id: '2',
    display: 'Diabetes',
    clinicalStatus: 'inactive',
    onsetDateTime: '2022-01-01T00:00:00.000Z',
    abatementDateTime: '2023-01-01T00:00:00.000Z',
    conceptId: '',
    recordedDate: '',
  },
];

describe('ConditionsStepRenderer', () => {
  const stepId = 'step-1-conditions';

  const mockConditionsStepData = (conditions: Condition[]) => ({
    state: {
      stepsData: { [stepId]: { conditions } },
      config: {
        steps: [{ id: stepId }],
      },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when conditions is empty', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useWorkflow as jest.Mock).mockReturnValue(mockConditionsStepData([]));

    render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <ConditionsStepRenderer
          conditions={[]}
          initiallyOpen={false}
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
        />
      </WorkflowProvider>,
    );
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders ConditionsSummaryTable on tablet layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('tablet');
    (useWorkflow as jest.Mock).mockReturnValue(mockConditionsStepData(mockConditions));

    render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <ConditionsStepRenderer
          conditions={mockConditions}
          initiallyOpen={false}
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
        />
      </WorkflowProvider>,
    );

    expect(screen.getByLabelText('conditions summary')).toBeInTheDocument();
    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
  });

  it('renders ConditionsSummaryCard on desktop layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useWorkflow as jest.Mock).mockReturnValue(mockConditionsStepData(mockConditions));

    render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <ConditionsStepRenderer
          conditions={mockConditions}
          initiallyOpen={false}
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
        />
      </WorkflowProvider>,
    );

    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
    expect(screen.getByText('INACTIVE')).toBeInTheDocument();
  });

  it('launches conditions form when add button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    render(
      <ConditionsStepRenderer
        conditions={mockConditions}
        initiallyOpen={false}
        stepId={stepId}
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
      />,
    );

    const addButton = screen.getByText('Adicionar');
    fireEvent.click(addButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('conditions-form-workspace', expect.any(Object));
  });

  it('launches edit conditions form when edit button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');

    render(
      <ConditionsStepRenderer
        conditions={mockConditions}
        initiallyOpen={false}
        stepId={stepId}
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
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

    render(
      <ConditionsStepRenderer
        conditions={mockConditions}
        initiallyOpen={false}
        stepId={stepId}
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
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
    (useWorkflow as jest.Mock).mockReturnValue(mockConditionsStepData(mockConditions));

    // Mock the closeWorkspace to simulate form submission callback
    (closeWorkspace as jest.Mock).mockImplementation((workspaceName, options) => {
      if (workspaceName === 'conditions-form-workspace' && options.onWorkspaceClose) {
        options.onWorkspaceClose();
      }
    });

    // Create a ref to access the component instance
    const ref = React.createRef<StepComponentHandle>();

    const { rerender } = render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <ConditionsStepRenderer
          ref={ref}
          conditions={mockConditions}
          initiallyOpen={false}
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
        />
      </WorkflowProvider>,
    );

    // Find and click the edit button for the first condition
    const editButtons = screen.getAllByLabelText('Editar');
    fireEvent.click(editButtons[0]);

    expect(launchPatientWorkspace).toHaveBeenCalledWith(
      'conditions-form-workspace',
      expect.objectContaining({
        workspaceTitle: 'Editar Condição',
        formContext: 'editing',
      }),
    );

    // Simulate the form submission by extracting the callback from the launchPatientWorkspace call
    const launchWorkspaceCall = (launchPatientWorkspace as jest.Mock).mock.calls[0];
    const options = launchWorkspaceCall[1];

    // Create a mock FHIR condition that would be returned from the form
    const mockUpdatedFhirCondition: FHIRCondition = {
      ...mockFhirCondition,
      id: '1',
      code: {
        coding: [
          {
            display: 'Updated Hypertension',
            code: '',
          },
        ],
      },
      clinicalStatus: {
        coding: [
          {
            code: 'resolved',
            display: 'Resolved',
          },
        ],
        display: undefined,
      },
    };

    // Call the closeWorkspaceWithSavedChanges function to simulate form submission
    options.closeWorkspaceWithSavedChanges(mockUpdatedFhirCondition);

    // Rerender to reflect state updates
    rerender(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <ConditionsStepRenderer
          ref={ref}
          conditions={mockConditions}
          initiallyOpen={false}
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
        />
      </WorkflowProvider>,
    );

    // Access the updated conditions from the component's onStepComplete method
    const updatedConditions = ref.current.onStepComplete().conditions;

    // Verify that the condition was updated
    expect(updatedConditions).toHaveLength(2);
    expect(updatedConditions[0].id).toBe('1');
    // The exact expectation will depend on the implementation of mapConditionProperties
    // This is a guess based on the context
    expect(updatedConditions[0].display).toContain('Updated Hypertension');
  });
});
