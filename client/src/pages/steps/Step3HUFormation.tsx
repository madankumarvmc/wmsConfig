import { useLocation } from 'wouter';
import WizardLayout from '@/components/WizardLayout';
import { useWizard } from '@/contexts/WizardContext';

export default function Step3HUFormation() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();

  const handleNext = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 3 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 4 });
    setLocation('/step4');
  };

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    setLocation('/step2');
  };

  return (
    <WizardLayout
      title="HU Formation & Path Determination"
      description="Configure handling unit formation and path determination for pick strategies."
      currentStep={3}
      totalSteps={6}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Next: Work Orders"
      previousLabel="Previous: Pick Strategies"
    >
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium mb-4">HU Formation Configuration</h3>
        <p className="text-gray-600">
          This step is under development. Here you will configure:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
          <li>Trip types and HU kinds</li>
          <li>Scan and pick source configurations</li>
          <li>HU mapping modes and thresholds</li>
          <li>Drop and swap configurations</li>
          <li>Mobile sorting parameters</li>
          <li>Weight and quantity thresholds</li>
        </ul>
      </div>
    </WizardLayout>
  );
}
