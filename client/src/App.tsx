import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/contexts/WizardContext";
import Home from "@/pages/Home";
import Step1InventoryGroups from "@/pages/steps/Step1InventoryGroups";
import Step2TaskSequences from "@/pages/steps/Step2TaskSequences";
import Step3PickStrategies from "@/pages/steps/Step3PickStrategies";
import Step4HUFormation from "@/pages/steps/Step4HUFormation";
import Step5WorkOrderManagement from "@/pages/steps/Step5WorkOrderManagement";
import Step6StockAllocation from "@/pages/steps/Step6StockAllocation";
import Step7ReviewConfirm from "@/pages/steps/Step7ReviewConfirm";
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
      <Route path="/step/2" component={Step2TaskSequences} />
      <Route path="/step/3" component={Step3PickStrategies} />
      <Route path="/step/4" component={Step4HUFormation} />
      <Route path="/step/5" component={Step5WorkOrderManagement} />
      <Route path="/step/6" component={Step6StockAllocation} />
      <Route path="/step/7" component={Step7ReviewConfirm} />
      
      {/* Legacy routes for compatibility */}
      <Route path="/step1" component={Step1InventoryGroups} />
      <Route path="/step2" component={Step2TaskSequences} />
      <Route path="/step3" component={Step3PickStrategies} />
      <Route path="/step4" component={Step4HUFormation} />
      <Route path="/step5" component={Step5WorkOrderManagement} />
      <Route path="/step6" component={Step6StockAllocation} />
      <Route path="/step7" component={Step7ReviewConfirm} />
      
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
