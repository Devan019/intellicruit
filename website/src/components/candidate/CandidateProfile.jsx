"use client"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
// import CandidateProfileHeader from "./CandidateProfileHeader"
// import CandidateProfileBody from "./CandidateProfileBody"
// import CandidateProfileFooter from "./CandidateProfileFooter"

const CandidateProfile = () => {
  const { candidateId } = useParams()
  const candidate = useSelector((state) => state.candidates.find((c) => c.id === candidateId))

  if (!candidate) {
    return <div>Candidate not found</div>
  }

  return (
    <div className="candidate-profile">
      {/* <CandidateProfileHeader candidate={candidate} />
      <CandidateProfileBody candidate={candidate} />
      <CandidateProfileFooter candidate={candidate} /> */}
    </div>
  )
}

export default CandidateProfile
