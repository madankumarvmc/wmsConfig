import { cn } from '@/lib/utils';
import { useWizard } from '@/contexts/WizardContext';
import { useLocation } from 'wouter';
import { 
  Package, 
  Target, 
  Truck, 
  ClipboardList, 
  Database, 
  CheckCircle,
  Circle,
  Edit
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Inventory Groups',
    description: 'Storage & Line Identifiers',
    icon: Package,
    path: '/step1'
  },
  {
    number: 2,
    title: 'Task Sequences',
    description: 'Task configuration',
    icon: Target,
    path: '/step2'
  },
  {
    number: 3,
    title: 'Pick Strategies',
    description: 'Pick strategy setup',
    icon: Truck,
    path: '/step3'
  },
  {
    number: 4,
    title: 'HU Formation',
    description: 'Handling unit setup',
    icon: ClipboardList,
    path: '/step4'
  },
  {
    number: 5,
    title: 'Work Orders',
    description: 'Work order management',
    icon: Database,
    path: '/step5'
  },
  {
    number: 6,
    title: 'Stock Allocation',
    description: 'Stock allocation strategies',
    icon: Database,
    path: '/step6'
  },
  {
    number: 7,
    title: 'Review & Confirm',
    description: 'Final configuration review',
    icon: CheckCircle,
    path: '/step7'
  }
];

interface StepNavigationProps {
  currentStep: number;
}

export default function StepNavigation({ currentStep }: StepNavigationProps) {
  const { state } = useWizard();
  const [location, setLocation] = useLocation();

  // Get the actual current step from URL
  const getCurrentStepFromUrl = () => {
    const stepMatch = location.match(/\/step(\d+)/);
    return stepMatch ? parseInt(stepMatch[1]) : currentStep;
  };

  const actualCurrentStep = getCurrentStepFromUrl();

  const getStepStatus = (stepNumber: number) => {
    if (state.completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === actualCurrentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (step: typeof steps[0], status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="w-5 h-5" />;
    } else if (status === 'active') {
      return <Edit className="w-5 h-5" />;
    } else {
      return <Circle className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-88 bg-white shadow-lg border-r border-gray-200 hidden lg:block">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-medium text-gray-900">SBX WMS Setup</h1>
        <p className="text-sm text-gray-600 mt-1">Outbound Module Configuration</p>
      </div>
      
      <nav className="p-4">
        <div className="space-y-2">
          {steps.map((step) => {
            const status = getStepStatus(step.number);
            return (
              <button
                key={step.number}
                onClick={() => setLocation(step.path)}
                className={cn(
                  "flex items-center p-3 rounded-lg w-full text-left transition-colors",
                  status === 'active' && "wizard-step-active",
                  status === 'completed' && "wizard-step-completed",
                  status === 'pending' && "wizard-step-pending hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3",
                  status === 'active' && "bg-blue-500 text-white",
                  status === 'completed' && "bg-green-500 text-white",
                  status === 'pending' && "bg-gray-300 text-gray-600"
                )}>
                  {status === 'completed' || status === 'active' ? (
                    getStepIcon(step, status)
                  ) : (
                    step.number
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs opacity-75">{step.description}</div>
                </div>
                {getStepIcon(step, status)}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
