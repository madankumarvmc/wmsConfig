import { ReactNode } from 'react';
import StepNavigation from './StepNavigation';
import WizardHeader from './WizardHeader';
import WizardFooter from './WizardFooter';

interface WizardLayoutProps {
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

export default function WizardLayout({
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
}: WizardLayoutProps) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <StepNavigation currentStep={currentStep} />
      
      <div className="flex-1 flex flex-col">
        <WizardHeader 
          title={title}
          description={description}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        
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
