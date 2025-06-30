import { Progress } from '@/components/ui/progress';

interface StepInfoProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
}

export default function StepInfo({ 
  title, 
  description, 
  currentStep, 
  totalSteps 
}: StepInfoProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-medium text-black">{title}</h2>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-700 mr-4">
              Step {currentStep} of {totalSteps}
            </span>
            <div className="flex items-center">
              <Progress 
                value={progressPercentage} 
                className="w-32 h-2 mr-3 bg-gray-200 [&>div]:bg-black"
              />
              <span className="text-xs text-gray-600">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
          </div>
          {description && (
            <p className="text-sm text-gray-700 mt-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}