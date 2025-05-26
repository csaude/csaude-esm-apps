import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { forwardRef, useImperativeHandle } from 'react';
import stepRegistry from './step-registry';
import { type WorkflowConfig, type WorkflowState, type WorkflowStep } from './types';
import WorkflowContainer from './workflow-container.component';
import { COMPLETE_STEP, GO_TO_NEXT_STEP, useWorkflow } from './workflow-context';

// Mock dependencies
jest.mock('./workflow-context', () => ({
  COMPLETE_STEP: 'COMPLETE_STEP',
  GO_TO_STEP: 'GO_TO_STEP',
  UPDATE_STEP_DATA: 'UPDATE_STEP_DATA',
  GO_TO_NEXT_STEP: 'GO_TO_NEXT_STEP',
  useWorkflow: jest.fn(),
}));

jest.mock('./step-registry', () => ({ __esModule: true, default: {} }));
jest.mock('@openmrs/esm-framework');
jest.mock('@openmrs/esm-patient-common-lib', () => ({
  useOrderBasket: jest.fn(() => ({
    orders: [],
    clearOrders: jest.fn(),
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));

jest.mock('./api', () => ({
  useOrderEncounter: jest.fn(() => ({ encounterUuid: 'mock-encounter-uuid' })),
}));

const mockUseWorkflow = jest.mocked(useWorkflow);

describe('WorkflowContainer', () => {
  const mockDispatch = jest.fn();
  const mockCompletedSteps = new Set(['step-1']);

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

  const mockState: WorkflowState = {
    config: mockConfig,
    visibleSteps: mockSteps,
    completedSteps: mockCompletedSteps,
    currentStepIndex: 0,
    progress: 25,
    patientUuid: 'test-patient-uuid',
    stepsData: {},
    patient: undefined,
    visit: undefined,
    isLastStep: false,
  };

  const mockUseWorkflowValue = {
    state: mockState,
    visibleSteps: true,
    isLastStep: false,
    dispatch: mockDispatch,
    getCurrentStep: jest.fn(),
    getStepById: jest.fn(),
    getStepsByRenderType: jest.fn(),
    getAllSteps: jest.fn(),
    onCancel: jest.fn(),
    onComplete: jest.fn(),
  };

  xit('should render all workflow steps', () => {
    const formStep = ({ step }) => <div data-testid={`form-step-${step.id}`}>Form Step</div>;
    const medicationsStep = ({ step }) => <div data-testid={`medications-step-${step.id}`}>Medications Step</div>;
    const conditionsStep = ({ step }) => <div data-testid={`conditions-step-${step.id}`}>Conditions Step</div>;

    stepRegistry['form'] = forwardRef(formStep);
    stepRegistry['medications'] = forwardRef(medicationsStep);
    stepRegistry['conditions'] = forwardRef(conditionsStep);

    mockUseWorkflow.mockReturnValue(mockUseWorkflowValue);

    const { rerender } = render(<WorkflowContainer />);
    expect(screen.getByTestId('form-step-step-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: GO_TO_NEXT_STEP,
    });
    mockUseWorkflow.mockReturnValue({ ...mockUseWorkflowValue, state: { ...mockState, currentStepIndex: 1 } });
    rerender(<WorkflowContainer />);
    expect(screen.getByTestId('medications-step-step-2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: GO_TO_NEXT_STEP,
    });
    mockUseWorkflow.mockReturnValue({ ...mockUseWorkflowValue, state: { ...mockState, currentStepIndex: 2 } });
    rerender(<WorkflowContainer />);
    expect(screen.getByTestId('conditions-step-step-3')).toBeInTheDocument();
  });

  it('should handle step complete', async () => {
    const mockData = { uuid: 'test' };
    const formStep = forwardRef((stepProps, ref) => {
      useImperativeHandle(ref, () => ({
        onStepComplete() {
          return mockData;
        },
      }));
      return <button>Mock form step</button>;
    });
    stepRegistry['form'] = formStep;

    mockUseWorkflowValue.getCurrentStep.mockReturnValue(mockSteps[0]);
    mockUseWorkflow.mockReturnValue(mockUseWorkflowValue);

    render(<WorkflowContainer />);

    await userEvent.click(screen.getByRole('button', { name: /Próximo/ }));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: COMPLETE_STEP,
        payload: 'step-1',
        data: expect.objectContaining({ ...mockData }),
      }),
    );
  });

  // //TODO: Fix the tests below
  // xit('should handle medications step completion automatically when Next button is clicked', () => {
  //   // Arrange
  //   (useWorkflow as jest.Mock).mockReturnValue({
  //     state: {
  //       ...mockState,
  //       currentStepIndex: 1, // Set to medications step
  //     },
  //     dispatch: mockDispatch,
  //   });

  //   // Mock stepData for medications
  //   const mockMedicationData = [
  //     { id: 'med-1', isOrderIncomplete: false },
  //     { id: 'med-2', isOrderIncomplete: false },
  //   ];

  //   render(React.createElement(WorkflowContainer));

  //   // Simulate step data change
  //   const StepComponent = stepRegistry['medications'];
  //   const onStepDataChange = (StepComponent as jest.Mock).mock.calls[0][0].onStepDataChange;
  //   onStepDataChange('step-2', mockMedicationData);

  //   // Act
  //   fireEvent.click(screen.getByTestId('next-button'));

  //   // Assert
  //   // Use a more flexible approach that checks if the specific call was included
  //   expect(mockDispatch).toHaveBeenCalledWith({
  //     type: COMPLETE_STEP,
  //     payload: 'step-2',
  //     data: mockMedicationData,
  //   });
  // });

  //   it('should show toast for incomplete orders in medications step', () => {
  //     // Arrange
  //     (useWorkflow as jest.Mock).mockReturnValue({
  //       state: {
  //         ...mockState,
  //         currentStepIndex: 1, // Set to medications step
  //       },
  //       dispatch: mockDispatch,
  //     });

  //     // Mock stepData with incomplete orders
  //     const mockMedicationData = [
  //       { id: 'med-1', isOrderIncomplete: true },
  //       { id: 'med-2', isOrderIncomplete: false },
  //     ];

  //     render(React.createElement(WorkflowContainer));

  //     // Simulate step data change
  //     const StepComponent = stepRegistry['medications'];
  //     const onStepDataChange = (StepComponent as jest.Mock).mock.calls[0][0].onStepDataChange;
  //     onStepDataChange('step-2', mockMedicationData);

  //     // Act
  //     fireEvent.click(screen.getByTestId('next-button'));

  //     // Assert - Match exactly the expected parameters
  //     expect(showToast).toHaveBeenCalledWith({
  //       critical: true,
  //       description: 'You have incomplete orders. Please complete all orders before proceeding.',
  //       kind: 'warning',
  //       title: 'Warning!',
  //     });

  //     // Should not complete the step
  //     expect(mockDispatch).not.toHaveBeenCalledWith({
  //       type: COMPLETE_STEP,
  //       payload: 'step-2',
  //       data: expect.any(Array),
  //     });
  //   });

  //   it('should handle step completion when handleStepComplete is called', () => {
  //     // Arrange
  //     render(React.createElement(WorkflowContainer));

  //     // Get handleStepComplete from the props passed to the first step
  //     const StepComponent = stepRegistry['form'];
  //     const handleStepComplete = jest.fn();
  //     stepRegistry.form = jest.fn(({ step, patientUuid, handleStepComplete: hsc }) => {
  //       handleStepComplete.mockImplementation(hsc);
  //       return React.createElement('div', { 'data-testid': `form-step-${step.id}` }, 'Form Step');
  //     });
  //     const mockData = { formData: 'test' };

  //     // Act
  //     handleStepComplete('step-1', mockData);

  //     // Assert
  //     expect(mockDispatch).toHaveBeenCalledWith({
  //       type: COMPLETE_STEP,
  //       payload: 'step-1',
  //       data: mockData,
  //     });

  //     // Should also update progress
  //     expect(mockDispatch).toHaveBeenCalledWith({
  //       type: UPDATE_PROGRESS,
  //       payload: expect.any(Number),
  //     });
  //   });
});
