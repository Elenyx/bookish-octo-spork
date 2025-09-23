import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Fleet from "@/pages/Fleet";
import Explore from "@/pages/Explore";
import Guild from "@/pages/Guild";
import Market from "@/pages/Market";
import Navigation from "@/components/Navigation";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground space-pattern">
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/fleet" component={Fleet} />
        <Route path="/explore" component={Explore} />
        <Route path="/guild" component={Guild} />
        <Route path="/market" component={Market} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
