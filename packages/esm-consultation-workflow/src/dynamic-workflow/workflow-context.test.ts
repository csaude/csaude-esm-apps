import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { evaluateCondition } from './services/step-condition-evaluator.service';
import { emptyState, WorkflowConfig, WorkflowState, WorkflowStep } from './types';
import {
  COMPLETE_STEP,
  GO_TO_NEXT_STEP,
  GO_TO_PREVIOUS_STEP,
  GO_TO_STEP,
  UPDATE_STEP_DATA,
  useWorkflow,
  WorkflowProvider,
  workflowReducer,
} from './workflow-context'; // Adjust the import path as needed

// Mock CloseWorkspaceOptions since it's an external dependency
jest.mock('@openmrs/esm-framework', () => ({
  // Empty mock is sufficient as we just need the type
}));

jest.mock('./services/step-condition-evaluator.service');

const mockEvaluateCondition = jest.mocked(evaluateCondition);

function getStateMock({ ...props } = {}): WorkflowState {
  return {
    ...emptyState,
    currentStepIndex: 0,
    completedSteps: new Set([]),
    stepsData: {},
    progress: 0,
    config: {
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
      uuid: 'test-uuid',
      name: 'Test workflow',
      description: 'Test workflow',
      version: '1.0',
    },
    patientUuid: 'test-patient-uuid',
    visit: {
      uuid: 'test-visit-uuid',
      visitType: { uuid: 'visit-type-uuid', display: 'Consulta externa' },
      startDatetime: '2025-03-25T10:00:00.000Z',
    },
    ...props,
  };
}

describe('workflowReducer', () => {
  const mockInitialState = getStateMock();

  describe('GO_TO_STEP', () => {
    it('should handle GO_TO_STEP action', () => {
      // Arrange
      const action = {
        type: GO_TO_STEP,
        payload: 2,
      };
      mockInitialState.visibleSteps = mockInitialState.config.steps;

      // Act
      const newState = workflowReducer(mockInitialState, action);

      // Assert
      expect(newState.currentStepIndex).toBe(2);

      // Ensure other properties remain unchanged
      expect(newState.completedSteps).toEqual(mockInitialState.completedSteps);
      expect(newState.stepsData).toEqual(mockInitialState.stepsData);
    });

    it('should not go to an invisible step', () => {
      // Arrange
      const action = {
        type: GO_TO_STEP,
        payload: 2,
      };
      mockInitialState.visibleSteps = mockInitialState.config.steps.slice(0, 2);
      // Act
      expect(() => workflowReducer(mockInitialState, action)).toThrow();
    });

    it('should update last step flag', () => {
      // Arrange
      const action = {
        type: GO_TO_STEP,
        payload: 2,
      };
      mockInitialState.visibleSteps = mockInitialState.config.steps;

      // Act
      const newState = workflowReducer(mockInitialState, action);

      // Assert
      expect(newState.isLastStep).toBe(true);
    });
  });

  describe('GO_TO_NEXT_STEP', () => {
    it('should increment current step index', () => {
      // Arrange
      const action = {
        type: GO_TO_NEXT_STEP,
      };
      const state = getStateMock({
        visibleSteps: mockInitialState.config.steps,
      });

      // Act
      const newState = workflowReducer(state, action);

      // Assert
      expect(newState.currentStepIndex).toBe(1);
    });

    it('should not go past last visible step index', () => {
      // Arrange
      const action = {
        type: GO_TO_NEXT_STEP,
      };
      const state = getStateMock({
        visibleSteps: mockInitialState.config.steps,
      });

      // Act
      let newState = workflowReducer(state, action);
      newState = workflowReducer(newState, action);
      newState = workflowReducer(newState, action);
      newState = workflowReducer(newState, action);
      newState = workflowReducer(newState, action);

      // Assert
      expect(newState.currentStepIndex).toBe(mockInitialState.visibleSteps.length - 1);
    });

    it('should update last step flat', () => {
      // Arrange
      const action = {
        type: GO_TO_NEXT_STEP,
      };
      const state = getStateMock({
        visibleSteps: mockInitialState.config.steps,
      });

      // Act
      let newState = workflowReducer(state, action);
      newState = workflowReducer(newState, action);
      newState = workflowReducer(newState, action);

      // Assert
      expect(newState.isLastStep).toBe(true);
    });
  });

  describe('GO_TO_PREVIOUS_STEP', () => {
    it('should decrement current step index', () => {
      // Arrange
      const action = {
        type: GO_TO_PREVIOUS_STEP,
      };
      const state = getStateMock({
        visibleSteps: mockInitialState.config.steps,
        currentStepIndex: 1,
      });

      // Act
      const newState = workflowReducer(state, action);

      // Assert
      expect(newState.currentStepIndex).toBe(0);
    });
    it('should not go past first visible step index', () => {
      // Arrange
      const action = {
        type: GO_TO_PREVIOUS_STEP,
      };
      const state = getStateMock({
        visibleSteps: mockInitialState.config.steps,
        currentStepIndex: 2,
      });

      // Act
      let newState = workflowReducer(state, action);
      newState = workflowReducer(newState, action);
      newState = workflowReducer(newState, action);
      newState = workflowReducer(newState, action);
      newState = workflowReducer(newState, action);

      // Assert
      expect(newState.currentStepIndex).toBe(0);
    });
  });

  describe('COMPLETE_STEP', () => {
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

    it('should update visible steps', () => {
      // Arrange
      const stepId = 'step-1';
      const stepData = { key: 'value' };
      const action = {
        type: COMPLETE_STEP,
        payload: stepId,
        data: stepData,
      };

      const state = getStateMock({
        config: {
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
              visibility: {
                conditions: [
                  {
                    source: 'patient',
                    field: 'gender',
                    operator: 'equals',
                    value: 'female',
                  },
                ],
              },
            },
          ],
          uuid: 'test-uuid',
          name: 'Test workflow',
          description: 'Test workflow',
          version: '1.0',
        },
      });

      mockEvaluateCondition.mockReturnValue(false);

      // Act
      const newState = workflowReducer(state, action);

      // Assert
      expect(evaluateCondition).toHaveBeenCalledTimes(1);
      expect(newState.visibleSteps).toHaveLength(1);
      expect(newState.visibleSteps).toEqual(
        expect.arrayContaining<WorkflowStep>([expect.objectContaining({ id: 'step-1' })]),
      );
    });

    it('should update current step index', () => {
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
      expect(newState.currentStepIndex).toBe(1);
    });

    it('should update last step flag', () => {
      // Arrange
      const stepId = 'step-1';
      const stepData = { key: 'value' };
      const action = {
        type: COMPLETE_STEP,
        payload: stepId,
        data: stepData,
      };

      // Act
      let newState = workflowReducer(mockInitialState, action);
      newState = workflowReducer(newState, action);

      // Assert
      expect(newState.isLastStep).toBe(true);
    });

    it('should update progress', () => {
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
      expect(newState.progress).toBeCloseTo((1 / 3) * 100);
    });
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
            type: GO_TO_STEP,
            payload: 1,
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
  const mockPatient = {};
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
        patient: mockPatient,
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
