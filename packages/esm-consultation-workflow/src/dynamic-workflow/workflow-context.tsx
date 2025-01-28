import React, { createContext, useContext, useReducer } from 'react';
import { WorkflowState } from './types';

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
        stepData: { ...state.stepData, [action.payload]: action.data },
      };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };
    default:
      return state;
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, {
    currentStep: '',
    completedSteps: new Set(),
    stepData: {},
    progress: 0,
  });

  return <WorkflowContext.Provider value={{ state, dispatch }}>{children}</WorkflowContext.Provider>;
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};
