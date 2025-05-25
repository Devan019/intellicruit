"use client";
import CandidateDashboard from "@/components/CandidateDashboard";
import WithRoleCheck from "@/components/WithRoleCheck";
import CandidateAccess from "@/components/hoc/CandidateAccess";

export default function JobsPage() {
  return (
    <CandidateAccess>
    <WithRoleCheck requiredRole={["HR","Candidate"]}>
      <CandidateDashboard />
    </WithRoleCheck>
    </CandidateAccess>
  );
}
