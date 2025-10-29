import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Candidates from "./pages/Candidates";
import CandidatesKanban from "./pages/CandidatesKanban";
import CandidateProfile from "./pages/CandidateProfile";
import Assessments from "./pages/Assessments";
import AttemptAssessment from "./pages/AttemptAssessment";
import AssessmentBuilder from "./pages/AssessmentBuilder";
import CreateAssignment from "./pages/CreateAssignment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<Layout />}>
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute allowedRoles={["hr", "candidate"]}>
                    <Jobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/jobs/:jobId"
                element={
                  <ProtectedRoute allowedRoles={["hr", "candidate"]}>
                    <JobDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates"
                element={
                  <ProtectedRoute allowedRoles={["hr"]}>
                    <Candidates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates/kanban"
                element={
                  <ProtectedRoute allowedRoles={["hr"]}>
                    <CandidatesKanban />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidates/:id"
                element={
                  <ProtectedRoute allowedRoles={["hr"]}>
                    <CandidateProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessments"
                element={
                  <ProtectedRoute allowedRoles={["hr", "candidate"]}>
                    <Assessments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessments/:jobId/builder"
                element={
                  <ProtectedRoute allowedRoles={["hr"]}>
                    <AssessmentBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessments/:jobId/attempt"
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <AttemptAssessment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessments/create"
                element={
                  <ProtectedRoute allowedRoles={["hr"]}>
                    <CreateAssignment />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


