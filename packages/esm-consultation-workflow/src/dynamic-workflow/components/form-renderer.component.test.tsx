import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import FormRenderer from './form-renderer.component';
import useFormSchema from '../hooks/useFormSchema';
import { useWorkflow } from '../workflow-context';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { closeWorkspace, CloseWorkspaceOptions } from '@openmrs/esm-framework';
import { WorkflowStep } from '../types';

jest.mock('../hooks/useFormSchema');
jest.mock('../workflow-context');
// jest.mock('@openmrs/esm-patient-common-lib');
// jest.mock('@openmrs/esm-framework');

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  launchPatientWorkspace: jest.fn(),
}));

const mockUseFormSchema = useFormSchema as jest.MockedFunction<typeof useFormSchema>;
const mockUseWorkflow = useWorkflow as jest.MockedFunction<typeof useWorkflow>;
const mockLaunchPatientWorkspace = launchPatientWorkspace as jest.MockedFunction<typeof launchPatientWorkspace>;

const mockCloseWorkspace = jest.mocked(closeWorkspace);

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
  const onStepComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it('renders loading state', () => {
  //   mockUseFormSchema.mockReturnValue({ schema: null, error: null, isLoading: true });
  //   mockUseWorkflow.mockReturnValue({
  //     getStepsByRenderType: jest.fn(),
  //     state: {
  //       completedSteps: new Set(),
  //       stepsData: {},
  //       currentStepIndex: 0,
  //       progress: 0,
  //       config: undefined,
  //       patientUuid: undefined,
  //     },
  //     dispatch: function (value: any): void {
  //       throw new Error('Function not implemented.');
  //     },
  //     getCurrentStep: function (): WorkflowStep | null {
  //       throw new Error('Function not implemented.');
  //     },
  //     getStepById: function (stepId: string): WorkflowStep | null {
  //       throw new Error('Function not implemented.');
  //     },
  //     getAllSteps: function (): WorkflowStep[] {
  //       throw new Error('Function not implemented.');
  //     },
  //     onCancel: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
  //       throw new Error('Function not implemented.');
  //     },
  //     onComplete: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
  //       throw new Error('Function not implemented.');
  //     },
  //   });

  //   render(
  //     <FormRenderer
  //       formUuid={formUuid}
  //       patientUuid={patientUuid}
  //       encounterUuid={encounterUuid}
  //       onStepComplete={onStepComplete}
  //       encounterTypeUuid={''}
  //     />,
  //   );

  //   expect(screen.getByText('Loading ...')).toBeInTheDocument();
  // });

  // it('renders error state', () => {
  //   mockUseFormSchema.mockReturnValue({ schema: null, error: new Error('Test error'), isLoading: false });
  //   mockUseWorkflow.mockReturnValue({
  //     getStepsByRenderType: jest.fn(),
  //     state: {
  //       completedSteps: new Set(),
  //       stepsData: {},
  //       currentStepIndex: 0,
  //       progress: 0,
  //       config: undefined,
  //       patientUuid: undefined,
  //     },
  //     dispatch: function (value: any): void {
  //       throw new Error('Function not implemented.');
  //     },
  //     getCurrentStep: function (): WorkflowStep | null {
  //       throw new Error('Function not implemented.');
  //     },
  //     getStepById: function (stepId: string): WorkflowStep | null {
  //       throw new Error('Function not implemented.');
  //     },
  //     getAllSteps: function (): WorkflowStep[] {
  //       throw new Error('Function not implemented.');
  //     },
  //     onCancel: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
  //       throw new Error('Function not implemented.');
  //     },
  //     onComplete: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
  //       throw new Error('Function not implemented.');
  //     },
  //   });

  //   render(
  //     <FormRenderer
  //       formUuid={formUuid}
  //       patientUuid={patientUuid}
  //       encounterUuid={encounterUuid}
  //       onStepComplete={onStepComplete}
  //       encounterTypeUuid={''}
  //     />,
  //   );

  //   expect(screen.getByText('Error')).toBeInTheDocument();
  // });

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
        completedSteps: new Set(),
        stepsData: {},
        currentStepIndex: 0,
        progress: 0,
        config: undefined,
        patientUuid: undefined,
        patient: undefined,
        visit: undefined,
      },
      dispatch: function (value: any): void {
        throw new Error('Function not implemented.');
      },
      getCurrentStep: function (): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getStepById: function (stepId: string): WorkflowStep | null {
        throw new Error('Function not implemented.');
      },
      getAllSteps: function (): WorkflowStep[] {
        throw new Error('Function not implemented.');
      },
      onCancel: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
        throw new Error('Function not implemented.');
      },
      onComplete: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
        throw new Error('Function not implemented.');
      },
    });

    // expect(screen.findByTestId('')).toBeInTheDocument();

    render(
      <FormRenderer
        formUuid={formUuid}
        stepId="test-step-id"
        patientUuid={patientUuid}
        encounterUuid={encounterUuid}
        onStepComplete={onStepComplete}
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

  // screen.debug(null, 1000000000);
  // const button = screen.getByText('Fill form');
  // expect(button).toBeInTheDocument();

  // fireEvent.click(button);

  // await waitFor(() => {
  //   expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('patient-form-entry-workspace', expect.any(Object));
  // });
});

// it('renders FormEngine when existingEncounterUuid is present', () => {
//   const schema = {
//     name: 'Test Form',
//     encounter: 'Test Encounter',
//     encounterType: {},
//     pages: [],
//     processor: 'test-processor',
//     uuid: 'test-uuid',
//     referencedForms: [],
//   };
//   const patientUuid = 'test-patient-uuid';
//   const encounterUuid = 'test-encounter-uuid';
//   const formUuid = 'test-form-uuid';
//   mockUseFormSchema.mockReturnValue({ schema, error: null, isLoading: false });
//   mockUseWorkflow.mockReturnValue({
//     getStepsByRenderType: jest.fn(),
//     state: {
//       completedSteps: new Set(),
//       stepsData: {},
//       currentStepIndex: 0,
//       progress: 0,
//       config: undefined,
//       patientUuid: undefined,
//     },
//     dispatch: function (value: any): void {
//       throw new Error('Function not implemented.');
//     },
//     getCurrentStep: function (): WorkflowStep | null {
//       throw new Error('Function not implemented.');
//     },
//     getStepById: function (stepId: string): WorkflowStep | null {
//       throw new Error('Function not implemented.');
//     },
//     getAllSteps: function (): WorkflowStep[] {
//       throw new Error('Function not implemented.');
//     },
//     onCancel: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
//       throw new Error('Function not implemented.');
//     },
//     onComplete: function (closeWorkspaceOptions?: CloseWorkspaceOptions): void {
//       throw new Error('Function not implemented.');
//     },
//   });

//   render(
//     <FormRenderer
//       formUuid={formUuid}
//       patientUuid={patientUuid}
//       encounterUuid={encounterUuid}
//       onStepComplete={onStepComplete}
//       encounterTypeUuid={'8990097799000'}
//     />,
//   );

//   expect(screen.getByText('Fill form')).toBeInTheDocument();
//   expect(screen.getByText('FormEngine')).toBeInTheDocument();
// });

function onStepComplete(data: any): void {
  throw new Error('Function not implemented.');
}
