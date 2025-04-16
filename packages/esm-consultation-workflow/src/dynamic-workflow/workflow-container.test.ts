import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import stepRegistry from './step-registry';
import WorkflowContainer from './workflow-container.component';
import { COMPLETE_STEP, SET_CURRENT_STEP, UPDATE_PROGRESS, UPDATE_STEP_DATA, useWorkflow } from './workflow-context';

// Mock dependencies
jest.mock('./workflow-context', () => ({
  COMPLETE_STEP: 'COMPLETE_STEP',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  UPDATE_STEP_DATA: 'UPDATE_STEP_DATA',
  useWorkflow: jest.fn(),
}));

jest.mock('react-use-wizard', () => ({
  useWizard: jest.fn(() => ({
    activeStep: 0,
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    isLastStep: false,
    isFirstStep: true,
    goToStep: jest.fn(),
  })),
  Wizard: ({ children, footer, wrapper }) =>
    React.createElement('div', { 'data-testid': 'wizard' }, [
      React.createElement('div', { 'data-testid': 'wizard-steps', key: 'steps' }, children),
      React.createElement('div', { 'data-testid': 'wizard-footer', key: 'footer' }, footer),
    ]),
}));

jest.mock('./step-registry', () => ({
  __esModule: true,
  default: {
    form: jest.fn(({ step, patientUuid, handleStepComplete, onStepDataChange }) =>
      React.createElement('div', { 'data-testid': `form-step-${step.id}` }, 'Form Step'),
    ),
    medications: jest.fn(({ step, patientUuid, handleStepComplete, onStepDataChange }) =>
      React.createElement('div', { 'data-testid': `medications-step-${step.id}` }, 'Medications Step'),
    ),
    conditions: jest.fn(({ step, patientUuid, handleStepComplete, onStepDataChange }) =>
      React.createElement('div', { 'data-testid': `conditions-step-${step.id}` }, 'Conditions Step'),
    ),
  },
}));

jest.mock('../footer.component', () => ({
  __esModule: true,
  default: ({ onSave, onCancel, onNextClick }) =>
    React.createElement('div', { 'data-testid': 'footer' }, [
      React.createElement(
        'button',
        { 'data-testid': 'next-button', onClick: () => onNextClick(0), key: 'next' },
        'Next',
      ),
      React.createElement('button', { 'data-testid': 'save-button', onClick: onSave, key: 'save' }, 'Save'),
      React.createElement('button', { 'data-testid': 'cancel-button', onClick: onCancel, key: 'cancel' }, 'Cancel'),
    ]),
}));

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
  useOrderEncounter: jest.fn((patientUuid: string) => ({ encounterUuid: 'mock-encounter-uuid' })),
}));

describe('WorkflowContainer', () => {
  const mockDispatch = jest.fn();
  const mockCompletedSteps = new Set(['step-1']);

  const mockSteps = [
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

  const mockState = {
    config: {
      id: 'workflow-1',
      name: 'Test Workflow',
      steps: mockSteps,
    },
    completedSteps: mockCompletedSteps,
    currentStepIndex: 0,
    progress: 25,
    patientUuid: 'test-patient-uuid',
    stepsData: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWorkflow as jest.Mock).mockReturnValue({
      state: mockState,
      dispatch: mockDispatch,
    });
  });

  it('should render all workflow steps', () => {
    // Arrange & Act
    render(React.createElement(WorkflowContainer));

    // Assert
    expect(screen.getByTestId('wizard')).toBeInTheDocument();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByTestId('form-step-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('medications-step-step-2')).toBeInTheDocument();
    expect(screen.getByTestId('conditions-step-step-3')).toBeInTheDocument();
  });

  it('should dispatch SET_CURRENT_STEP action when Next button is clicked', () => {
    // Arrange
    render(React.createElement(WorkflowContainer));

    // Act
    fireEvent.click(screen.getByTestId('next-button'));

    // Assert
    expect(mockDispatch).toHaveBeenCalledWith({
      type: SET_CURRENT_STEP,
      payload: {
        stepId: mockSteps[0].id,
        currentStepIndex: 0,
      },
    });
  });

  it('should dispatch SET_CURRENT_STEP action with the next step index when Next button is clicked', () => {
    // Arrange
    render(React.createElement(WorkflowContainer));

    // Act
    fireEvent.click(screen.getByTestId('next-button'));

    // Assert
    expect(mockDispatch).toHaveBeenCalledWith({
      type: SET_CURRENT_STEP,
      payload: {
        currentStepIndex: 1,
      },
    });
  });

  it('should update progress when Next button is clicked', () => {
    // Arrange
    render(React.createElement(WorkflowContainer));

    // Act
    fireEvent.click(screen.getByTestId('next-button'));

    // Assert
    expect(mockDispatch).toHaveBeenCalledWith({
      type: UPDATE_PROGRESS,
      payload: expect.any(Number),
    });
  });

  it('should handle data change', () => {
    // Arrange
    render(React.createElement(WorkflowContainer));

    // Get onStepDataChange from the props passed to the first step
    const StepComponent = stepRegistry['form'];
    const onStepDataChange = (stepRegistry.form as jest.Mock).mock.calls[0][0].onStepDataChange;
    const mockData = { formData: 'test' };

    // Todo: fix the warnings of this test
    // Act
    onStepDataChange('step-1', mockData);

    // Assert - Step data should be updated internally
    // This is hard to test directly as it's in component state,
    // but we can verify the handleStepComplete call works with the data
    expect(mockDispatch).toHaveBeenCalledWith({
      type: UPDATE_STEP_DATA,
      payload: { stepId: 'step-1', data: mockData },
    });
  });

  it('should handle step complete', () => {
    // Arrange
    render(React.createElement(WorkflowContainer));

    // Get onStepDataChange from the props passed to the first step
    const StepComponent = stepRegistry['form'];
    const onStepDataChange = (stepRegistry.form as jest.Mock).mock.calls[0][0].onStepDataChange;
    const mockData = { formData: 'test' };

    // Todo: fix the warnings of this test
    // Act
    onStepDataChange('step-1', mockData);

    // Get handleStepComplete from the props
    const handleStepComplete = (stepRegistry.form as jest.Mock).mock.calls[0][0].handleStepComplete;
    handleStepComplete('step-1', mockData);

    // Assert - Step data should be updated internally
    // This is hard to test directly as it's in component state,
    // but we can verify the handleStepComplete call works with the data
    expect(mockDispatch).toHaveBeenCalledWith({
      type: COMPLETE_STEP,
      payload: 'step-1',
      data: mockData,
    });
  });

  it('should calculate progress correctly based on completed steps', () => {
    // Arrange
    // Total weight = 4 (1+2+1)
    // Completed weight = 1 (step-1)
    // Expected progress = (1/4) * 100 = 25%
    render(React.createElement(WorkflowContainer));

    // Act - Click next to trigger progress update
    fireEvent.click(screen.getByTestId('next-button'));

    // Assert
    expect(mockDispatch).toHaveBeenCalledWith({
      type: UPDATE_PROGRESS,
      payload: 25, // (1/4) * 100
    });
  });

  //TODO: Fix the tests below
  xit('should handle medications step completion automatically when Next button is clicked', () => {
    // Arrange
    (useWorkflow as jest.Mock).mockReturnValue({
      state: {
        ...mockState,
        currentStepIndex: 1, // Set to medications step
      },
      dispatch: mockDispatch,
    });

    // Mock stepData for medications
    const mockMedicationData = [
      { id: 'med-1', isOrderIncomplete: false },
      { id: 'med-2', isOrderIncomplete: false },
    ];

    render(React.createElement(WorkflowContainer));

    // Simulate step data change
    const StepComponent = stepRegistry['medications'];
    const onStepDataChange = (StepComponent as jest.Mock).mock.calls[0][0].onStepDataChange;
    onStepDataChange('step-2', mockMedicationData);

    // Act
    fireEvent.click(screen.getByTestId('next-button'));

    // Assert
    // Use a more flexible approach that checks if the specific call was included
    expect(mockDispatch).toHaveBeenCalledWith({
      type: COMPLETE_STEP,
      payload: 'step-2',
      data: mockMedicationData,
    });
  });

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
