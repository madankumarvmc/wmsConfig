import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/contexts/WizardContext";
import { FetchedConfigurationsProvider } from "@/contexts/FetchedConfigurationsContext";
import "@/utils/clearV05Cache"; // Make cache clearing functions available globally
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

// Outbound Configuration V0.5 Pages
import LineSplitV05 from "@/pages/outbound-v05/LineSplitV05";
import TaskSequenceV05 from "@/pages/outbound-v05/TaskSequenceV05";
import TaskStrategyV05 from "@/pages/outbound-v05/TaskStrategyV05";
import BinSearchV05 from "@/pages/outbound-v05/BinSearchV05";

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
      
      {/* Outbound Configuration V0.5 Routes */}
      <Route path="/outbound/v0.5/line-split" component={LineSplitV05} />
      <Route path="/outbound/v0.5/task-sequence" component={TaskSequenceV05} />
      <Route path="/outbound/v0.5/task-strategy" component={TaskStrategyV05} />
      <Route path="/outbound/v0.5/bin-search" component={BinSearchV05} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WizardProvider>
          <FetchedConfigurationsProvider>
            <Toaster />
            <Router />
          </FetchedConfigurationsProvider>
        </WizardProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
