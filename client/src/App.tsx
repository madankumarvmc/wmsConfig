import { Switch, Route } from "wouter";
import { Suspense, lazy, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WizardProvider } from "@/contexts/WizardContext";
import { FetchedConfigurationsProvider } from "@/contexts/FetchedConfigurationsContext";
import { ConfigurationProvider } from "@/contexts/ConfigurationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import PageLoading from "@/components/ui/page-loading";
import MainLayout from "@/components/MainLayout";

// Lazy load wizard steps for better performance
const Step1InventoryGroups = lazy(() => import("@/pages/steps/Step1InventoryGroups"));
const Step2WavePlanning = lazy(() => import("@/pages/steps/Step2WavePlanning"));
const Step3TaskSequences = lazy(() => import("@/pages/steps/Step3TaskSequences"));
const Step4TaskPlanning = lazy(() => import("@/pages/steps/Step4TaskPlanning"));
const Step5TaskExecution = lazy(() => import("@/pages/steps/Step5TaskExecution"));
const Step6ReviewConfirm = lazy(() => import("@/pages/steps/Step6ReviewConfirm"));

// Lazy load master configuration pages
const ProvisioningSetup = lazy(() => import("@/pages/master/ProvisioningSetup"));
const MasterUploads = lazy(() => import("@/pages/master/MasterUploads"));
const OneClickTemplates = lazy(() => import("@/pages/master/OneClickTemplates"));

// Lazy load outbound V0.5 pages
const LineSplitV05 = lazy(() => import("@/pages/outbound-v05/LineSplitV05"));
const TaskSequenceV05 = lazy(() => import("@/pages/outbound-v05/TaskSequenceV05"));
const TaskStrategyV05 = lazy(() => import("@/pages/outbound-v05/TaskStrategyV05"));
const BinSearchV05 = lazy(() => import("@/pages/outbound-v05/BinSearchV05"));

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        
        {/* Master Configuration Routes */}
        <Route path="/master/provisioning">
          <Suspense fallback={<PageLoading variant="content" />}>
            <ProvisioningSetup />
          </Suspense>
        </Route>
        <Route path="/master/uploads">
          <Suspense fallback={<PageLoading variant="content" />}>
            <MasterUploads />
          </Suspense>
        </Route>
        <Route path="/master/templates">
          <Suspense fallback={<PageLoading variant="content" />}>
            <OneClickTemplates />
          </Suspense>
        </Route>
        
        {/* Outbound Configuration Routes */}
        <Route path="/step/1">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step1InventoryGroups />
          </Suspense>
        </Route>
        <Route path="/step/2">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step2WavePlanning />
          </Suspense>
        </Route>
        <Route path="/step/3">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step3TaskSequences />
          </Suspense>
        </Route>
        <Route path="/step/4">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step4TaskPlanning />
          </Suspense>
        </Route>
        <Route path="/step/5">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step5TaskExecution />
          </Suspense>
        </Route>
        <Route path="/step/6">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step6ReviewConfirm />
          </Suspense>
        </Route>
        
        {/* Legacy routes for compatibility */}
        <Route path="/step1">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step1InventoryGroups />
          </Suspense>
        </Route>
        <Route path="/step2">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step2WavePlanning />
          </Suspense>
        </Route>
        <Route path="/step3">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step3TaskSequences />
          </Suspense>
        </Route>
        <Route path="/step4">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step4TaskPlanning />
          </Suspense>
        </Route>
        <Route path="/step5">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step5TaskExecution />
          </Suspense>
        </Route>
        <Route path="/step6">
          <Suspense fallback={<PageLoading variant="content" />}>
            <Step6ReviewConfirm />
          </Suspense>
        </Route>
        
        {/* Outbound Configuration V0.5 Routes */}
        <Route path="/outbound/v0.5/line-split">
          <Suspense fallback={<PageLoading variant="content" />}>
            <LineSplitV05 />
          </Suspense>
        </Route>
        <Route path="/outbound/v0.5/task-sequence">
          <Suspense fallback={<PageLoading variant="content" />}>
            <TaskSequenceV05 />
          </Suspense>
        </Route>
        <Route path="/outbound/v0.5/task-strategy">
          <Suspense fallback={<PageLoading variant="content" />}>
            <TaskStrategyV05 />
          </Suspense>
        </Route>
        <Route path="/outbound/v0.5/bin-search">
          <Suspense fallback={<PageLoading variant="content" />}>
            <BinSearchV05 />
          </Suspense>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  // Preload commonly used components after initial render
  useEffect(() => {
    const preloadComponents = () => {
      // Preload the most commonly accessed components
      setTimeout(() => {
        import("@/pages/steps/Step1InventoryGroups");
        import("@/pages/master/ProvisioningSetup");
        import("@/pages/outbound-v05/LineSplitV05");
      }, 2000); // Wait 2 seconds after app loads
    };

    preloadComponents();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WizardProvider>
            <FetchedConfigurationsProvider>
              <ConfigurationProvider>
                <Toaster />
                <Router />
              </ConfigurationProvider>
            </FetchedConfigurationsProvider>
          </WizardProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
