import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import WithRoleCheck from "@/components/WithRoleCheck";

export default function Home() {
  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Contact />
    </div>
    </WithRoleCheck>
  );
}
