import { ReactNode } from 'react';
import TopNavbar from './TopNavbar';
import StepInfo from './StepInfo';
import WizardFooter from './WizardFooter';
import StepNavigation from './StepNavigation';

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navbar */}
      <TopNavbar />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-100 shadow-lg border-r border-gray-200">
          <StepNavigation currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <StepInfo
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
    </div>
  );
}
