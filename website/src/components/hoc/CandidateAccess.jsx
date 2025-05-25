import React, { Children } from 'react'
import { useState, useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from 'next/navigation';


export default function CandidateAccess({ children, allowedRoles = ["Candidate"] }) {

    const { isSignedIn, isLoaded } = useAuth()
    const [userRole, setUserRole] = useState(null);
    const [roleLoading, setRoleLoading] = useState(true);
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        setRoleLoading(true);
        if (isLoaded && user) {
            setUserRole(user.publicMetadata?.role || "USER");
        }
        setRoleLoading(false);
    }, [isSignedIn, isLoaded])

    useEffect(() => {
        if (isLoaded && isSignedIn && userRole) {
            if (!isSignedIn) {
                router.push('/sign-in');
            }
            else if (!allowedRoles.includes(userRole)) {
                router.push('/');
            }
        }
    }, [isLoaded, isSignedIn, userRole, allowedRoles, router])

    if(!isLoaded || roleLoading || !userRole) {
        return <div>Loading...</div>;
    }

    return <>{children}</>

}