import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WizardFooterProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
}

export default function WizardFooter({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  nextLabel = "Next",
  previousLabel = "Previous",
  isNextDisabled = false,
  isPreviousDisabled = false
}: WizardFooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isPreviousDisabled || currentStep === 1}
            className="inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {previousLabel}
          </Button>
          {currentStep === 1 && (
            <span className="text-sm text-gray-500">You're on the first step</span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-sm text-gray-600">
            Save & Exit
          </Button>
          <Button
            onClick={onNext}
            disabled={isNextDisabled || currentStep === totalSteps}
            className="inline-flex items-center bg-blue-500 hover:bg-blue-600"
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
