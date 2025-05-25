import JobApplication from "@/components/candidate/JobApplication"
import WithRoleCheck from "@/components/WithRoleCheck";

export default function JobApplicationPage({ params }) {
  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
      <JobApplication jobId={params.id} />
    </WithRoleCheck>
  )
}
