import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { LandingPage } from "@/pages/LandingPage";
import { AuditPage } from "@/pages/AuditPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/audit/:id" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}
