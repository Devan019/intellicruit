import JobDetails from "@/components/candidate/JobDetails"

export default function JobDetailsPage({ params }) {
  return <JobDetails jobId={params.id} />
}
