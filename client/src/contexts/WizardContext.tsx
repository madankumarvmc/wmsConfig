import { createContext, useContext, useReducer, ReactNode } from 'react';
import { WizardState, WizardAction } from '@/types/wizard';

const initialState: WizardState = {
  currentStep: 1,
  completedSteps: [],
  data: {
    taskSequences: [],
    pickStrategies: [],
    huFormation: {},
    workOrderManagement: {},
    stockAllocation: {},
    isComplete: false
  }
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'COMPLETE_STEP':
      const completedSteps = [...state.completedSteps];
      if (!completedSteps.includes(action.payload)) {
        completedSteps.push(action.payload);
      }
      return { ...state, completedSteps };
    
    case 'UPDATE_STEP_DATA':
      return {
        ...state,
        data: { ...state.data, [action.payload.step]: action.payload.data }
      };
    
    case 'LOAD_WIZARD_DATA':
      return { ...state, data: action.payload };
    
    case 'RESET_WIZARD':
      return initialState;
    
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
