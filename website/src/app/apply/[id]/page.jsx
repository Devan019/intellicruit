import JobApplication from "@/components/candidate/JobApplication"

export default function JobApplicationPage({ params }) {
  return <JobApplication jobId={params.id} />
}
