import JobSearch from "@/components/candidate/JobSearch"
import WithRoleCheck from "@/components/WithRoleCheck";

export default function JobsPage() {
  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
      <JobSearch />
    </WithRoleCheck>

  )
}
