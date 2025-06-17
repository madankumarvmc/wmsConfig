import { useLocation } from 'wouter';
import WizardLayout from '@/components/WizardLayout';
import { useWizard } from '@/contexts/WizardContext';

export default function Step4WorkOrderManagement() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();

  const handleNext = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 4 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 5 });
    setLocation('/step5');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/step3');
  };

  return (
    <WizardLayout
      title="Work Order Management Strategy"
      description="Configure work order management settings for pick strategies."
      currentStep={4}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: Stock Allocation"
      previousLabel="Previous: HU Formation"
    >
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Work Order Management Configuration</h3>
        <p className="text-gray-600">
          This step is under development. Here you will configure:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
          <li>Segregation group mappings</li>
          <li>Drop and scan configurations</li>
          <li>Batch adherence settings</li>
          <li>Work order split permissions</li>
          <li>Undo and unpick operations</li>
          <li>Scanning requirements</li>
        </ul>
      </div>
    </WizardLayout>
  );
}
