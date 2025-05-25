"use client";
import CandidateDashboard from "@/components/CandidateDashboard";
import WithRoleCheck from "@/components/WithRoleCheck";

export default function JobsPage() {
  return (
    <WithRoleCheck requiredRole={["Candidate"]}>
      <CandidateDashboard />
    </WithRoleCheck>
  );
}
