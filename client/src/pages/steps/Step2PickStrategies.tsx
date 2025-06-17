import { useLocation } from 'wouter';
import WizardLayout from '@/components/WizardLayout';
import { useWizard } from '@/contexts/WizardContext';

export default function Step2PickStrategies() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();

  const handleNext = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 2 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/step3');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
    setLocation('/step1');
  };

  return (
    <WizardLayout
      title="Pick Strategy Definition"
      description="Configure pick strategies for each task kind in your task sequences."
      currentStep={2}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: HU Formation"
      previousLabel="Previous: Task Sequences"
    >
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">Pick Strategy Configuration</h3>
        <p className="text-gray-600">
          This step is under development. Here you will configure pick strategies including:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
          <li>TaskKind and TaskSubKind selection</li>
          <li>Strategy types (Cluster, Zone, Batch, etc.)</li>
          <li>Sorting and Loading strategies</li>
          <li>GroupBy criteria</li>
          <li>Task labels and attributes</li>
        </ul>
      </div>
    </WizardLayout>
  );
}
