import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/contexts/WizardContext";
import Home from "@/pages/Home";
import Step1InventoryGroups from "@/pages/steps/Step1InventoryGroups";
import Step2WavePlanning from "@/pages/steps/Step2WavePlanning";
import Step3TaskSequences from "@/pages/steps/Step3TaskSequences";
import Step4TaskPlanning from "@/pages/steps/Step4TaskPlanning";
import Step5TaskExecution from "@/pages/steps/Step5TaskExecution";
import Step6ReviewConfirm from "@/pages/steps/Step6ReviewConfirm";
import NotFound from "@/pages/not-found";

// Master Configuration Pages
import ProvisioningSetup from "@/pages/master/ProvisioningSetup";
import MasterUploads from "@/pages/master/MasterUploads";
import OneClickTemplates from "@/pages/master/OneClickTemplates";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Master Configuration Routes */}
      <Route path="/master/provisioning" component={ProvisioningSetup} />
      <Route path="/master/uploads" component={MasterUploads} />
      <Route path="/master/templates" component={OneClickTemplates} />
      
      {/* Outbound Configuration Routes */}
      <Route path="/step/1" component={Step1InventoryGroups} />
      <Route path="/step/2" component={Step2WavePlanning} />
      <Route path="/step/3" component={Step3TaskSequences} />
      <Route path="/step/4" component={Step4TaskPlanning} />
      <Route path="/step/5" component={Step5TaskExecution} />
      <Route path="/step/6" component={Step6ReviewConfirm} />
      
      {/* Legacy routes for compatibility */}
      <Route path="/step1" component={Step1InventoryGroups} />
      <Route path="/step2" component={Step2WavePlanning} />
      <Route path="/step3" component={Step3TaskSequences} />
      <Route path="/step4" component={Step4TaskPlanning} />
      <Route path="/step5" component={Step5TaskExecution} />
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
