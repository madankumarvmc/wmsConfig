import { ReactNode } from 'react';
import StepInfo from './StepInfo';
import WizardFooter from './WizardFooter';

interface WizardContentProps {
  children: ReactNode;
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
}

export default function WizardContent({
  children,
  title,
  description,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  nextLabel = "Next",
  previousLabel = "Previous",
  isNextDisabled = false,
  isPreviousDisabled = false
}: WizardContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Step Info */}
      <div className="flex-shrink-0">
        <StepInfo
          title={title}
          description={description}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <WizardFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={onNext}
          onPrevious={onPrevious}
          nextLabel={nextLabel}
          previousLabel={previousLabel}
          isNextDisabled={isNextDisabled}
          isPreviousDisabled={isPreviousDisabled}
        />
      </div>
    </div>
  );
}