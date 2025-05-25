import JobDetails from "@/components/candidate/JobDetails"
import WithRoleCheck from "@/components/WithRoleCheck";


export default function JobDetailsPage({ params }) {
  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
      <JobDetails jobId={params.id} />
    </WithRoleCheck>
  )
}

