import { useLocation } from 'wouter';
import WizardLayout from '@/components/WizardLayout';
import { useWizard } from '@/contexts/WizardContext';

export default function Step5StockAllocation() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();

  const handleNext = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 5 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 6 });
    setLocation('/step6');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 4 });
    setLocation('/step4');
  };

  return (
    <WizardLayout
      title="Stock & Bin Allocation Strategy"
      description="Configure stock and bin allocation strategies for PICK and PUT modes."
      currentStep={5}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: Review & Confirm"
      previousLabel="Previous: Work Orders"
    >
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Stock & Bin Allocation Configuration</h3>
        <p className="text-gray-600">
          This step is under development. Here you will configure:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
          <li>PICK and PUT mode strategies</li>
          <li>Priority and search scope settings</li>
          <li>State preference orders</li>
          <li>Batch preference modes (FIFO, FEFO, LIFO)</li>
          <li>Area types and selections</li>
          <li>Optimization modes</li>
        </ul>
      </div>
    </WizardLayout>
  );
}
