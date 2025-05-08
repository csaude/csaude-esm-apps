import { CloseWorkspaceOptions, NullablePatient, Visit } from '@openmrs/esm-framework';
import React, { createContext, useContext, useReducer } from 'react';
import { evaluateCondition } from './services/step-condition-evaluator.service';
import { emptyState, WorkflowConfig, WorkflowState, WorkflowStep } from './types';

export const GO_TO_STEP = 'GO_TO_STEP';
export const COMPLETE_STEP = 'COMPLETE_STEP';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';
export const UPDATE_STEP_DATA = 'UPDATE_STEP_DATA';
export const SET_CONFIG = 'SET_CONFIG';
export const GO_TO_NEXT_STEP = 'GO_TO_NEXT_STEP';
export const GO_TO_PREVIOUS_STEP = 'GO_TO_PREVIOUS_STEP';

export const workflowReducer = (state: WorkflowState, action: any) => {
  switch (action.type) {
    case GO_TO_STEP: {
      const currentStepIndex = action.payload;
      if (currentStepIndex >= state.visibleSteps.length) {
        throw new Error('Step is not visible');
      }
      return { ...state, currentStepIndex, isLastStep: currentStepIndex === state.visibleSteps.length - 1 };
    }
    case COMPLETE_STEP: {
      const nextState = {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
        stepsData: { ...state.stepsData, [action.payload]: action.data },
      };
      nextState.visibleSteps = evaluateStepVisibility(nextState);
      nextState.currentStepIndex = incrementStepIndex(nextState);
      nextState.isLastStep = nextState.currentStepIndex === nextState.visibleSteps.length - 1;
      nextState.progress = updateProgress(nextState);
      return nextState;
    }
    case UPDATE_STEP_DATA:
      return {
        ...state,
        stepsData: { ...state.stepsData, [action.payload.stepId]: action.payload.data },
      };
    case GO_TO_NEXT_STEP: {
      const nextState = {
        ...state,
        currentStepIndex: incrementStepIndex(state),
      };
      nextState.isLastStep = nextState.currentStepIndex === nextState.visibleSteps.length - 1;
      return nextState;
    }
    case GO_TO_PREVIOUS_STEP: {
      return {
        ...state,
        currentStepIndex: decrementStepIndex(state),
        stepsData: { ...state.stepsData, [action.payload]: action.data },
        isLastStep: false,
      };
    }
    default:
      return state;
  }
};

function updateProgress(state: WorkflowState) {
  const workflow = state.config;
  const totalWeight = workflow.steps.reduce((sum, step) => sum + (step.weight || 1), 0);
  const completedWeight = workflow.steps
    .filter((step) => state.completedSteps.has(step.id))
    .reduce((sum, step) => sum + (step.weight || 1), 0);
  return (completedWeight / totalWeight) * 100;
}

function decrementStepIndex(state: WorkflowState) {
  return state.currentStepIndex === 0 ? state.currentStepIndex : state.currentStepIndex - 1;
}

function incrementStepIndex(state: WorkflowState) {
  return state.currentStepIndex === state.visibleSteps.length - 1 ? state.currentStepIndex : state.currentStepIndex + 1;
}

// Function to evaluate step visibility based on current state and step data
function evaluateStepVisibility(state: WorkflowState) {
  const evaluatedSteps = state.config.steps.filter((step) => {
    // If step has no visibility conditions, it's always visible
    if (!step.visibility || !step.visibility.conditions || step.visibility.conditions.length === 0) {
      return true;
    }

    // Group conditions by their source (patient or step)
    const patientConditions = step.visibility.conditions.filter((condition) => condition.source === 'patient');
    const stepConditions = step.visibility.conditions.filter((condition) => condition.source === 'step');

    // Evaluate patient conditions
    const patientConditionsMet =
      patientConditions.length === 0 || patientConditions.every((condition) => evaluateCondition(condition, state));

    // Evaluate step conditions if there are any
    const stepConditionsMet =
      stepConditions.length === 0 ||
      stepConditions.every((condition) => {
        // Get the source step's data
        const sourceStepData = condition.stepId ? state.stepsData[condition.stepId] : null;

        // Skip this condition if we don't have data for the source step yet
        if (!sourceStepData) {
          return false;
        }

        // Evaluate the condition using the data from the source step
        return evaluateCondition(condition, state);
      });

    // Combine results based on logical operator
    const logicalOperator = step.visibility.logicalOperator || 'AND';
    return logicalOperator === 'AND'
      ? patientConditionsMet && stepConditionsMet
      : patientConditionsMet || stepConditionsMet;
  });

  return evaluatedSteps;
}

export const WorkflowProvider: React.FC<{
  children: React.ReactNode;
  workflowConfig: WorkflowConfig;
  patientUuid: string;
  patient: NullablePatient;
  visit: Visit;
  onCancel: (closeWorkspaceOptions?: CloseWorkspaceOptions) => void;
  onComplete: (closeWorkspaceOptions?: CloseWorkspaceOptions) => void;
}> = ({ children, workflowConfig, patientUuid, patient, visit, onCancel, onComplete }) => {
  const initialState = {
    ...emptyState,
    config: workflowConfig,
    patientUuid: patientUuid,
    patient,
    visit,
  };
  initialState.visibleSteps = evaluateStepVisibility(initialState);
  initialState.isLastStep = initialState.currentStepIndex === initialState.visibleSteps.length - 1;

  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const getCurrentStep = (): WorkflowStep | null => {
    return state.config?.steps[state.currentStepIndex] ?? null;
  };

  const getStepById = (stepId: string): WorkflowStep | null => {
    return state.config?.steps.find((step: WorkflowStep) => step.id === stepId) ?? null;
  };

  const getStepsByRenderType = (renderType: string): WorkflowStep[] | null => {
    return state.config?.steps.filter((step: WorkflowStep) => step.renderType === renderType) ?? null;
  };

  const getAllSteps = (): WorkflowStep[] => {
    return state.config?.steps ?? [];
  };

  const value = {
    state,
    dispatch,
    getCurrentStep,
    getStepById,
    getStepsByRenderType,
    getAllSteps,
    onCancel,
    onComplete,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};

const WorkflowContext = createContext<
  | {
      state: WorkflowState;
      dispatch: React.Dispatch<any>;
      getCurrentStep: () => WorkflowStep | null;
      getStepById: (stepId: string) => WorkflowStep | null;
      getStepsByRenderType: (renderType: string) => WorkflowStep[] | null;
      getAllSteps: () => WorkflowStep[];
      onCancel: (closeWorkspaceOptions?: CloseWorkspaceOptions) => void;
      onComplete: (closeWorkspaceOptions?: CloseWorkspaceOptions) => void;
    }
  | undefined
>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};
