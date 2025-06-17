import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/contexts/WizardContext";
import Home from "@/pages/Home";
import Step1TaskSequences from "@/pages/steps/Step1TaskSequences";
import Step2PickStrategies from "@/pages/steps/Step2PickStrategies";
import Step3HUFormation from "@/pages/steps/Step3HUFormation";
import Step4WorkOrderManagement from "@/pages/steps/Step4WorkOrderManagement";
import Step5StockAllocation from "@/pages/steps/Step5StockAllocation";
import Step6ReviewConfirm from "@/pages/steps/Step6ReviewConfirm";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/step1" component={Step1TaskSequences} />
      <Route path="/step2" component={Step2PickStrategies} />
      <Route path="/step3" component={Step3HUFormation} />
      <Route path="/step4" component={Step4WorkOrderManagement} />
      <Route path="/step5" component={Step5StockAllocation} />
      <Route path="/step6" component={Step6ReviewConfirm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WizardProvider>
          <Toaster />
          <Router />
        </WizardProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
