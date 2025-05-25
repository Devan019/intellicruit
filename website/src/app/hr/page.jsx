import HRDashboard from "../../components/HRDashboard"
import WithRoleCheck from "@/components/WithRoleCheck";


export default function HRPage() {
  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
      <HRDashboard />
    </WithRoleCheck>
  )


}