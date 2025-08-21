import { createContext, useContext, useReducer, ReactNode } from 'react';
import { WizardState, WizardAction } from '@/types/wizard';

const initialState: WizardState = {
  currentStep: 1,
  completedSteps: [],
  warehouseCode: '',
  data: {
    taskSequences: [],
    pickStrategies: [],
    huFormation: {
      tripType: "LM",
      huKinds: ["PALLET"],
      scanSourceHUKind: "PALLET",
      pickSourceHUKind: "NONE",
      carrierHUKind: "PALLET",
      huMappingMode: "BIN",
      dropHUQuantThreshold: 0,
      dropUOM: "L0",
      allowComplete: false,
      swapHUThreshold: 0,
      dropInnerHU: false,
      allowInnerHUBreak: false,
      displayDropUOM: false,
      autoUOMConversion: false,
      mobileSorting: false,
      sortingParam: "",
      huWeightThreshold: 0,
      qcMismatchMonthThreshold: 0,
      quantSlottingForHUsInDrop: false,
      allowPickingMultiBatchfromHU: false,
      displayEditPickQuantity: false,
      pickBundles: false,
      enableEditQtyInPickOp: true,
      dropSlottingMode: "BIN",
      enableManualDestBinSelection: false
    },
    workOrderManagement: {
      mapSegregationGroupsToBins: false,
      dropHUInBin: true,
      scanDestHUInDrop: false,
      allowHUBreakInDrop: false,
      strictBatchAdherence: true,
      allowWorkOrderSplit: true,
      undoOp: true,
      disableWorkOrder: false,
      allowUnpick: false,
      supportPalletScan: false,
      loadingUnits: 0,
      pickMandatoryScan: false,
      dropMandatoryScan: true
    },
    stockAllocation: {
      mode: 'PICK',
      priority: 100,
      skipZoneFace: false,
      orderByQuantUpdatedAt: false,
      searchScope: "AREA",
      statePreferenceOrder: ["PURE", "IMPURE", "EMPTY", "SKU_EMPTY"],
      preferFixed: true,
      preferNonFixed: false,
      statePreferenceSeq: 0,
      batchPreferenceMode: "NONE",
      areaTypes: [],
      areas: [],
      orderByPickingPosition: false,
      useInventorySnapshotForPickSlotting: false,
      optimizationMode: "TOUCH"
    },
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
    
    case 'SET_WAREHOUSE_CODE':
      return { ...state, warehouseCode: action.payload };
    
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
