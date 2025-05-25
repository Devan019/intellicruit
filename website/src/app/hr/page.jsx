import HRDashboard from "../../components/hr/HRDashboard"
import WithRoleCheck from "@/components/WithRoleCheck";
import HrAccess from "@/components/hoc/HrAccess";


export default function HRPage() {
  return (
    <HrAccess>
      <WithRoleCheck requiredRole={["HR", "Candidate"]}>
        <HRDashboard />
      </WithRoleCheck>
    </HrAccess>
  )
}