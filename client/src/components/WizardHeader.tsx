import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WizardHeaderProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
}

export default function WizardHeader({ 
  title, 
  description, 
  currentStep, 
  totalSteps 
}: WizardHeaderProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 mr-3"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
              <div className="ml-4 flex items-center">
                <Progress 
                  value={progressPercentage} 
                  className="w-32 h-2 mr-2"
                />
                <span className="text-xs text-gray-500">
                  {Math.round(progressPercentage)}% Complete
                </span>
              </div>
            </div>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-sm text-gray-600">
            Save Draft
          </Button>
          <Button variant="ghost" size="sm" className="text-sm text-gray-600">
            Exit Setup
          </Button>
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            <span>Admin User</span>
          </div>
        </div>
      </div>
    </header>
  );
}
