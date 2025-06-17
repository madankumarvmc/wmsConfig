import { useLocation } from 'wouter';
import WizardLayout from '@/components/WizardLayout';
import { useWizard } from '@/contexts/WizardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function Step6ReviewConfirm() {
  const [, setLocation] = useLocation();
  const { dispatch } = useWizard();

  const handlePrevious = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 5 });
    setLocation('/step5');
  };

  const handleConfirm = () => {
    dispatch({ type: 'COMPLETE_STEP', payload: 6 });
    // Here you would typically save the final configuration
    alert('Configuration has been saved successfully!');
  };

  return (
    <WizardLayout
      title="Review & Confirm"
      description="Review all your configurations and confirm the setup."
      currentStep={6}
      totalSteps={6}
      onPrevious={handlePrevious}
      previousLabel="Previous: Stock Allocation"
      nextLabel="Confirm & Save"
      onNext={handleConfirm}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900">Task Sequences</h4>
                  <p className="text-sm text-blue-700 mt-1">Storage and line identifier configurations</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900">Pick Strategies</h4>
                  <p className="text-sm text-green-700 mt-1">Task configuration strategies</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900">HU Formation</h4>
                  <p className="text-sm text-purple-700 mt-1">Handling unit path determination</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900">Work Orders</h4>
                  <p className="text-sm text-orange-700 mt-1">Management strategy configuration</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-medium text-teal-900">Stock Allocation</h4>
                  <p className="text-sm text-teal-700 mt-1">Bin allocation strategies</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ready to Complete Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your SBX WMS Outbound Module configuration is ready. Click "Confirm & Save" to finalize your setup.
            </p>
            <div className="flex space-x-4">
              <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm & Save Configuration
              </Button>
              <Button variant="outline" onClick={() => setLocation('/step1')}>
                Review from Beginning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
