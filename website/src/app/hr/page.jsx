import HRDashboard from "../../components/hr/HRDashboard"
import WithRoleCheck from "@/components/WithRoleCheck";


export default function HRPage() {
  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
      <HRDashboard />
    </WithRoleCheck>
  )


}