import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormStepRenderer from './form-step-renderer.component';
import useFormSchema from '../hooks/useFormSchema';
import { useWorkflow } from '../workflow-context';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { emptyState, type WorkflowStep } from '../types';

jest.mock('../hooks/useFormSchema');
jest.mock('../workflow-context');
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: jest.fn(),
}));

const mockUseFormSchema = useFormSchema as jest.MockedFunction<typeof useFormSchema>;
const mockUseWorkflow = useWorkflow as jest.MockedFunction<typeof useWorkflow>;
const mockLaunchPatientWorkspace = launchPatientWorkspace as jest.MockedFunction<typeof launchPatientWorkspace>;

jest.mock('@csaude/esm-form-engine-lib', () => ({
  FormEngine: jest
    .fn()
    .mockImplementation(() => React.createElement('div', { 'data-testid': 'openmrs form' }, 'FORM ENGINE LIB')),
  FormError: jest
    .fn()
    .mockImplementation(() =>
      React.createElement('div', { 'data-testid': 'openmrs form error' }, 'FORM ENGINE LIB ERROR'),
    ),
}));

describe('FormRenderer', () => {
  const formUuid = 'test-form-uuid';
  const patientUuid = 'test-patient-uuid';
  const encounterUuid = 'test-encounter-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseFormSchema.mockReturnValue({ schema: null, error: null, isLoading: true });
    mockUseWorkflow.mockReturnValue({
      getStepsByRenderType: jest.fn(),
      state: {
        completedSteps: new Set(),
        stepsData: {},
        currentStepIndex: 0,
        progress: 0,
        config: undefined,
        patientUuid: undefined,
        isLastStep: false,
        patient: undefined,
        visit: undefined,
        visibleSteps: [],
      },
      dispatch: function (): void {
        throw new Error('Function not implemented.');
      },
      getCurrentStep: function (): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getStepById: function (): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getAllSteps: function (): WorkflowStep[] {
        throw new Error('Function not implemented.');
      },
      onCancel: function (): void {
        throw new Error('Function not implemented.');
      },
      onComplete: function (): void {
        throw new Error('Function not implemented.');
      },
      visibleSteps: false,
      isLastStep: false,
    });

    render(
      <FormStepRenderer
        formUuid={formUuid}
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        initiallyOpen={false}
        encounterTypeUuid={''}
      />,
    );

    expect(screen.getByText(/Loading \.\.\.|A carregar \.\.\./)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFormSchema.mockReturnValue({ schema: null, error: new Error('Test error'), isLoading: false });
    mockUseWorkflow.mockReturnValue({
      getStepsByRenderType: jest.fn(),
      state: {
        completedSteps: new Set(),
        stepsData: {},
        currentStepIndex: 0,
        progress: 0,
        patient: undefined,
        isLastStep: false,
        visit: undefined,
        config: undefined,
        patientUuid: undefined,
        visibleSteps: [],
      },
      dispatch: function (): void {
        throw new Error('Function not implemented.');
      },
      getCurrentStep: function (): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getStepById: function (): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getAllSteps: function (): WorkflowStep[] {
        throw new Error('Function not implemented.');
      },
      onCancel: function (): void {
        throw new Error('Function not implemented.');
      },
      onComplete: function (): void {
        throw new Error('Function not implemented.');
      },
      visibleSteps: false,
      isLastStep: false,
    });

    render(
      <FormStepRenderer
        formUuid={formUuid}
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        initiallyOpen={false}
        encounterTypeUuid={''}
      />,
    );

    expect(screen.getByText('There was an error with this form')).toBeInTheDocument();
  });

  it('renders form button and handles click', async () => {
    const schema = {
      name: 'Test Form',
      encounter: 'Test Encounter',
      encounterType: {},
      pages: [],
      processor: 'test-processor',
      uuid: 'test-uuid',
      referencedForms: [],
    };
    mockUseFormSchema.mockReturnValue({ schema, error: null, isLoading: false });
    mockUseWorkflow.mockReturnValue({
      getStepsByRenderType: jest.fn().mockReturnValue([]),
      state: {
        ...emptyState,
        config: {
          uuid: 'config-uuid',
          name: 'Test workflow',
          description: 'Test workflow',
          version: '1.0',
          steps: [
            {
              id: 'step-1',
              renderType: 'form',
              title: 'Step 1',
            },
          ],
        },
      },
      visibleSteps: true,
      isLastStep: true,
      dispatch: function (): void {
        throw new Error('Function not implemented.');
      },
      getCurrentStep: function (): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getStepById: function (): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getAllSteps: function (): WorkflowStep[] {
        throw new Error('Function not implemented.');
      },
      onCancel: function (): void {
        throw new Error('Function not implemented.');
      },
      onComplete: function (): void {
        throw new Error('Function not implemented.');
      },
    });

    render(
      <FormStepRenderer
        formUuid={formUuid}
        initiallyOpen={true}
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        encounterTypeUuid={''}
      />,
    );

    const button = screen.getByText('Preencher formulário');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', expect.any(Object));
    });
  });
});

it('renders FormEngine when existingEncounterUuid is present', () => {
  const schema = {
    name: 'Test Form',
    encounter: 'Test Encounter',
    encounterType: {},
    pages: [],
    processor: 'test-processor',
    uuid: 'test-uuid',
    referencedForms: [],
  };
  const patientUuid = 'test-patient-uuid';
  const encounterUuid = 'test-encounter-uuid';
  const formUuid = 'test-form-uuid';
  mockUseFormSchema.mockReturnValue({ schema, error: null, isLoading: false });
  mockUseWorkflow.mockReturnValue({
    getStepsByRenderType: jest.fn(),
    state: {
      completedSteps: new Set(),
      stepsData: {},
      currentStepIndex: 0,
      progress: 0,
      config: undefined,
      patientUuid: undefined,
      patient: undefined,
      isLastStep: false,
      visit: undefined,
      visibleSteps: [],
    },
    dispatch: function (): void {
      throw new Error('Function not implemented.');
    },
    getCurrentStep: function (): WorkflowStep | null {
      throw new Error('Function not implemented.');
    },
    getStepById: function (): WorkflowStep | null {
      throw new Error('Function not implemented.');
    },
    getAllSteps: function (): WorkflowStep[] {
      throw new Error('Function not implemented.');
    },
    onCancel: function (): void {
      throw new Error('Function not implemented.');
    },
    onComplete: function (): void {
      throw new Error('Function not implemented.');
    },
    visibleSteps: false,
    isLastStep: false,
  });

  render(
    <FormStepRenderer
      formUuid={formUuid}
      patientUuid={patientUuid}
      encounterUuid={encounterUuid}
      initiallyOpen={false}
      encounterTypeUuid={'8990097799000'}
    />,
  );

  expect(screen.getByText(/Fill form|Preencher formulário/)).toBeInTheDocument();
  expect(screen.getByText('FORM ENGINE LIB')).toBeInTheDocument();
});
