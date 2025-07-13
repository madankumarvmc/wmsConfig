import { ReactNode } from 'react';
import TopNavbar from './TopNavbar';
import StepInfo from './StepInfo';
import WizardFooter from './WizardFooter';
import MainSidebar from './MainSidebar';

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
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top Navbar - Fixed */}
      <div className="flex-shrink-0">
        <TopNavbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Fixed height with its own scroll */}
        <MainSidebar currentPath={`/step/${currentStep}`} />

        {/* Main Content - Scrollable independently */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0">
            <StepInfo
              title={title}
              description={description}
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          </div>
          
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>

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
      </div>
    </div>
  );
}
