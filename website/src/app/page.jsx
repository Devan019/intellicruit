"use client";

import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import WithRoleCheck from "@/components/WithRoleCheck";
import { useState, useEffect } from "react";
import { useAuth } from '@clerk/nextjs';
import Link from "next/link";
import { useUser } from '@clerk/nextjs';

export default function Home() {

  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const checkAndCreateUser = async () => {
      if (!isSignedIn || !user) return;

      try {
        // First check if user exists
        const checkResponse = await fetch(`/api/sign-up?clerk_id=${user.id}`);
        
        if (checkResponse.status === 404) {
          // User doesn't exist, create them
          const createResponse = await fetch('/api/sign-up', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerk_id: user.id, // Fixed: lowercase 'id'
              email: user.emailAddresses[0]?.emailAddress,
              name: user.fullName,
            }),
          });

          if (createResponse.ok) {
            console.log('User created in DB');
          } else {
            const error = await createResponse.json();
            console.error('User creation failed:', error.msg || error.error);
          }
        } else if (!checkResponse.ok) {
          console.error('Error checking user existence');
        } else {
          console.log('User already exists in DB');
        }
      } catch (err) {
        console.error('Error in user check/creation:', err);
      }
    };

    if (isLoaded) {
      checkAndCreateUser();
    }
  }, [isSignedIn, user, isLoaded]);

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
