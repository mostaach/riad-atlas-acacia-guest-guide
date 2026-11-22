import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ManagerLogin from "./pages/ManagerLogin";
import Manager from "./pages/Manager";

/**
 * Riad Atlas Acacia Guest Guide
 * - Light theme with warm cream background (#FAF7F2)
 * - Terracotta accents (#9E472A) & Deep Forest/Olive (#2C4A3E)
 * - Interactive Catalog with pure pricing engine & WhatsApp booking
 */

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/r/:riadId"} component={Home} />
      <Route path={"/manager"} component={ManagerLogin} />
      <Route path={"/manager/dashboard"} component={Manager} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <Analytics />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
