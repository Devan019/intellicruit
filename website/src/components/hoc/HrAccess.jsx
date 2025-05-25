"use client"

import React, { Children } from 'react'
import { useState, useEffect } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter } from 'next/navigation';

export default function HrAccess({ children, allowedRoles = ["HR"] }) {

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

        // console.log(userRole)

        if (isLoaded && isSignedIn && userRole) {
            if (!isSignedIn) {
                router.push('/sign-in');
            }
            else if (!allowedRoles.includes(userRole)) {
                console.error("Access denied: User does not have the required role.");
                router.push('/');
            }
        }
    }, [isLoaded, isSignedIn, userRole, allowedRoles, router])

    if(!isLoaded || roleLoading || !userRole) {
        return <div>Loading...</div>;
    }

    return <>{children}</>

}