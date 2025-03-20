import React, { createContext, useContext, useReducer } from 'react';
import { initialState, WorkflowConfig, WorkflowState, WorkflowStep } from './types';
import { CloseWorkspaceOptions } from '@openmrs/esm-framework';

export const SET_CURRENT_STEP = 'SET_CURRENT_STEP';
export const COMPLETE_STEP = 'COMPLETE_STEP';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';
export const UPDATE_STEP_DATA = 'UPDATE_STEP_DATA';
export const SET_CONFIG = 'SET_CONFIG';

export const workflowReducer = (state: WorkflowState, action: any) => {
  switch (action.type) {
    case SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload, currentStepIndex: action.payload.currentStepIndex };
    case COMPLETE_STEP:
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
        stepsData: { ...state.stepsData, [action.payload]: action.data },
      };
    case UPDATE_PROGRESS:
      return { ...state, progress: action.payload };
    case UPDATE_STEP_DATA:
      return {
        ...state,
        stepsData: {
          ...state.stepsData,
          [action.payload.stepId]: action.payload.data,
        },
        currentStepIndex: action.payload.currentStepIndex ?? state.currentStepIndex,
      };
    case SET_CONFIG:
      return {
        ...state,
        config: action.payload,
      };
    default:
      return state;
  }
};

export const WorkflowProvider: React.FC<{
  children: React.ReactNode;
  workflowConfig: WorkflowConfig;
  patientUuid: string;
  onCancel: (closeWorkspaceOptions?: CloseWorkspaceOptions) => void;
  onComplete: (closeWorkspaceOptions?: CloseWorkspaceOptions) => void;
}> = ({ children, workflowConfig, patientUuid, onCancel, onComplete }) => {
  const [state, dispatch] = useReducer(workflowReducer, {
    ...initialState,
    config: workflowConfig,
    patientUuid: patientUuid,
  });

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
