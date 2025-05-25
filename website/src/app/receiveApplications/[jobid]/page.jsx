"use client"
import JobLeaderboard from '@/components/hr/Applications';
import WithRoleCheck from '@/components/WithRoleCheck';
import React, { use } from 'react'

const Page = ({params}) => {
  const { jobid } = use(params);
  return (
    <WithRoleCheck requiredRole={["HR", "Candidate"]}>
      <JobLeaderboard jobid={jobid} />
    </WithRoleCheck>
  )
}

export default Page
