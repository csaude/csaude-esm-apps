import React from 'react';
import { render, screen, renderHook, act, fireEvent } from '@testing-library/react';
import {
  workflowReducer,
  WorkflowProvider,
  useWorkflow,
  SET_CURRENT_STEP,
  COMPLETE_STEP,
  UPDATE_PROGRESS,
  UPDATE_STEP_DATA,
  SET_CONFIG,
} from './workflow-context'; // Adjust the import path as needed
import { initialState, WorkflowConfig, WorkflowState, WorkflowStep } from './types';

// Mock CloseWorkspaceOptions since it's an external dependency
jest.mock('@openmrs/esm-framework', () => ({
  // Empty mock is sufficient as we just need the type
}));

describe('workflowReducer', () => {
  const mockInitialState: WorkflowState = {
    ...initialState,
    currentStepIndex: 0,
    completedSteps: new Set([]),
    stepsData: {},
    progress: 0,
    config: null,
    patientUuid: 'test-patient-uuid',
    visit: {
      uuid: 'test-visit-uuid',
      visitType: { uuid: 'visit-type-uuid', display: 'Consulta externa' },
      startDatetime: '2025-03-25T10:00:00.000Z',
    },
  };

  it('should handle SET_CURRENT_STEP action', () => {
    // Arrange
    const action = {
      type: SET_CURRENT_STEP,
      payload: {
        stepId: 'test-step-id',
        currentStepIndex: 2,
      },
    };

    // Act
    const newState = workflowReducer(mockInitialState, action);

    // Assert
    expect(newState.currentStepIndex).toBe(2);

    // Ensure other properties remain unchanged
    expect(newState.completedSteps).toEqual(mockInitialState.completedSteps);
    expect(newState.stepsData).toEqual(mockInitialState.stepsData);
  });

  it('should handle COMPLETE_STEP action', () => {
    // Arrange
    const stepId = 'step-1';
    const stepData = { key: 'value' };
    const action = {
      type: COMPLETE_STEP,
      payload: stepId,
      data: stepData,
    };

    // Act
    const newState = workflowReducer(mockInitialState, action);

    // Assert
    expect(newState.completedSteps).toContain(stepId);
    expect(newState.stepsData[stepId]).toEqual(stepData);
  });

  it('should handle UPDATE_PROGRESS action', () => {
    // Arrange
    const newProgress = 50;
    const action = {
      type: UPDATE_PROGRESS,
      payload: newProgress,
    };

    // Act
    const newState = workflowReducer(mockInitialState, action);

    // Assert
    expect(newState.progress).toBe(newProgress);
  });

  it('should handle UPDATE_STEP_DATA action without changing step index', () => {
    // Arrange
    const stepId = 'step-2';
    const stepData = { form: 'data' };
    const action = {
      type: UPDATE_STEP_DATA,
      payload: {
        stepId,
        data: stepData,
      },
    };

    // Act
    const newState = workflowReducer(mockInitialState, action);

    // Assert
    expect(newState.stepsData[stepId]).toEqual(stepData);
    expect(newState.currentStepIndex).toBe(mockInitialState.currentStepIndex);
  });

  it('should handle UPDATE_STEP_DATA action with step index update', () => {
    // Arrange
    const stepId = 'step-2';
    const stepData = { form: 'data' };
    const newStepIndex = 3;
    const action = {
      type: UPDATE_STEP_DATA,
      payload: {
        stepId,
        data: stepData,
        currentStepIndex: newStepIndex,
      },
    };

    // Act
    const newState = workflowReducer(mockInitialState, action);

    // Assert
    expect(newState.stepsData[stepId]).toEqual(stepData);
    expect(newState.currentStepIndex).toBe(newStepIndex);
  });

  it('should handle SET_CONFIG action', () => {
    // Arrange
    const newConfig: WorkflowConfig = {
      uuid: 'dummy-uuid',
      name: 'Test Workflow',
      steps: [
        {
          id: 'step-1',
          title: 'Step 1',
          renderType: 'form',
          formId: 'form-1',
        },
      ],
      description: '',
      version: '',
    };
    const action = {
      type: SET_CONFIG,
      payload: newConfig,
    };

    // Act
    const newState = workflowReducer(mockInitialState, action);

    // Assert
    expect(newState.config).toEqual(newConfig);
  });

  it('should return unchanged state for unknown action type', () => {
    // Arrange
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: 'test',
    };

    // Act
    const newState = workflowReducer(mockInitialState, action);

    // Assert
    expect(newState).toEqual(mockInitialState);
  });
});

// Helper component to test the hook
const TestComponent = () => {
  const workflow = useWorkflow();
  return React.createElement(
    'div',
    null,
    React.createElement('span', { 'data-testid': 'current-step-index' }, workflow.state.currentStepIndex),
    React.createElement(
      'button',
      {
        'data-testid': 'set-current-step',
        onClick: () =>
          workflow.dispatch({
            type: SET_CURRENT_STEP,
            payload: {
              stepId: 'test-step-id',
              currentStepIndex: 1,
            },
          }),
      },
      'Set Current Step',
    ),
  );
};

describe('WorkflowProvider and useWorkflow', () => {
  const mockWorkflowConfig: WorkflowConfig = {
    uuid: 'dummy-uuid',
    name: 'Test Workflow',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1',
        renderType: 'form',
        formId: 'form-1',
      },
      {
        id: 'step-2',
        title: 'Step 2',
        renderType: 'medications',
      },
      {
        id: 'step-3',
        title: 'Step 3',
        renderType: 'form',
        formId: 'form-2',
      },
    ],
    description: '',
    version: '',
  };

  const mockPatientUuid = 'test-patient-uuid';
  const mockVisit = {
    uuid: 'test-visit-uuid',
    visitType: { uuid: 'visit-type-uuid', display: 'Consulta externa' },
    startDatetime: '2025-03-25T10:00:00.000Z',
  };
  const mockOnCancel = jest.fn();
  const mockOnComplete = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with provided config and patientUuid', () => {
    // Arrange & Act
    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestComponent),
      }),
    );

    // Assert - Initial step index should be 0
    expect(screen.getByTestId('current-step-index').textContent).toBe('0');
  });

  it('should update state when dispatching actions', () => {
    // Arrange
    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestComponent),
      }),
    );

    // Verify initial state
    expect(screen.getByTestId('current-step-index').textContent).toBe('0');

    // Act - Click button to dispatch SET_CURRENT_STEP action
    const button = screen.getByTestId('set-current-step');
    fireEvent.click(button);

    // Assert - Step index should now be 1
    expect(screen.getByTestId('current-step-index').textContent).toBe('1');
  });

  it('should throw error when useWorkflow is used outside of WorkflowProvider', () => {
    // Arrange & Act & Assert
    // Suppress console error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(React.createElement(TestComponent));
    }).toThrow('useWorkflow must be used within WorkflowProvider');

    console.error = originalError;
  });

  it('should provide getCurrentStep that returns the current step', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    const currentStep = workflow.getCurrentStep();

    // Assert
    expect(currentStep).toEqual(mockWorkflowConfig.steps[0]);
  });

  it('should provide getStepById that returns a step by id', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    const step = workflow.getStepById('step-2');

    // Assert
    expect(step).toEqual(mockWorkflowConfig.steps[1]);
  });

  it('should provide getStepsByRenderType that returns steps by render type', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    const formSteps = workflow.getStepsByRenderType('form');

    // Assert
    expect(formSteps).toHaveLength(2);
    expect(formSteps[0]).toEqual(mockWorkflowConfig.steps[0]);
    expect(formSteps[1]).toEqual(mockWorkflowConfig.steps[2]);
  });

  it('should provide getAllSteps that returns all steps', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    const allSteps = workflow.getAllSteps();

    // Assert
    expect(allSteps).toEqual(mockWorkflowConfig.steps);
  });

  it('should return null for getCurrentStep when no steps exist', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    const emptyConfig = { ...mockWorkflowConfig, steps: [] };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: emptyConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    const currentStep = workflow.getCurrentStep();

    // Assert
    expect(currentStep).toBeNull();
  });

  it('should return null for getStepById when step does not exist', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    const step = workflow.getStepById('non-existent-id');

    // Assert
    expect(step).toBeNull();
  });

  it('should return empty array for getAllSteps when no steps exist', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    const emptyConfig = { ...mockWorkflowConfig, steps: [] };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: emptyConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    const allSteps = workflow.getAllSteps();

    // Assert
    expect(allSteps).toEqual([]);
  });

  it('should expose onCancel and onComplete callbacks', () => {
    // Arrange
    let workflow;
    const TestHookComponent = () => {
      workflow = useWorkflow();
      return null;
    };

    render(
      React.createElement(WorkflowProvider, {
        workflowConfig: mockWorkflowConfig,
        patientUuid: mockPatientUuid,
        visit: mockVisit,
        onCancel: mockOnCancel,
        onComplete: mockOnComplete,
        children: React.createElement(TestHookComponent),
      }),
    );

    // Act
    workflow.onCancel({ closeModalPrompt: false });
    workflow.onComplete({ closeModalPrompt: true });

    // Assert
    expect(mockOnCancel).toHaveBeenCalledWith({ closeModalPrompt: false });
    expect(mockOnComplete).toHaveBeenCalledWith({ closeModalPrompt: true });
  });
});
