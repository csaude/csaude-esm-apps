import React, { createContext, useContext, useReducer } from 'react';
import { initialState, WorkflowState } from './types';

export const SET_CURRENT_STEP = 'SET_CURRENT_STEP';
export const COMPLETE_STEP = 'COMPLETE_STEP';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';
export const UPDATE_STEP_DATA = 'UPDATE_STEP_DATA';

const WorkflowContext = createContext<{
  state: WorkflowState;
  dispatch: React.Dispatch<any>;
} | null>(null);

export const workflowReducer = (state: WorkflowState, action: any) => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
        stepData: { ...state.stepsData, [action.payload]: action.data },
      };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };
    case 'UPDATE_STEP_DATA':
      return {
        ...state,
        stepsData: {
          ...state.stepsData,
          [action.payload.stepId]: action.payload.data,
        },
      };
    default:
      return state;
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  return <WorkflowContext.Provider value={{ state, dispatch }}>{children}</WorkflowContext.Provider>;
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};
