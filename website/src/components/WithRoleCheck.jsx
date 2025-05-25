'use client';

import Loader from "./Loader";
import React from "react";
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PopUp from "./PopUp";

export default function WithRoleCheck({children, requiredRole}) {
    const { isLoaded, user } = useUser();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState(false);
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        if (isLoaded && user) {
            setUserRole((user.publicMetadata?.role) || "USER");
        }
    }, [isLoaded, user]);

    useEffect(() => {
        if (isLoaded) {
            if (!isSignedIn) {
                router.push('/sign-in');
            } else if (userRole) {
                setHasAccess(requiredRole.includes(userRole));
            }
        }
    }, [isLoaded, isSignedIn, userRole, requiredRole, router]);

    if (!isLoaded) {
        return <Loader fullScreen text="Checking role..." />;
    }

    if (!hasAccess) {
        // return <div className="text-center mt-10">You do not have permission to access this page.</div>;
        return (
            <PopUp
                isOpen={!hasAccess}
                onClose={() => router.push('/')}
                onRoleSelected={(role) => {
                    setHasAccess(requiredRole.includes(role));
                }}
            />
        );
    }

    return <>{children}</>;
}