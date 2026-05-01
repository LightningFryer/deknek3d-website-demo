"use client";
import Navbar from "@/app/lib/components/Navbar";
import { signIn, signOut, authClient } from "@/app/lib/auth-client";
import { useEffect } from "react";

export default function Home() {
  const { data: session, error } = authClient.useSession();
  const lastMethod = authClient.getLastUsedLoginMethod();

  useEffect(() => {
    if (session?.user) {
      console.log(session.user);
    }
    if (error) {
      console.log(error);
    }
  }, [session, error]);

  return (
    <main className="h-screen min-w-screen flex flex-col">
      <Navbar />
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold">DekNek3D Full Stack Demo</h1>
          {session?.user ? (
            <>
              <p className="text-lg">Welcome, {session.user.name}!</p>
              <div className="flex flex-row gap-4">
                <button
                  className="btn btn-lg btn-error rounded-xl"
                  onClick={signOut}
                >
                  Sign Out
                </button>
                <a href="/tech-stack" className="btn btn-lg rounded-xl">
                  Tech Stack
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg">
                Sign In to get started or view the Tech Stack!
              </p>
              <div className="flex flex-row gap-4">
                <a href="/signin" className="btn btn-lg btn-primary rounded-xl">
                  Sign In
                </a>
                <a href="/tech-stack" className="btn btn-lg rounded-xl">
                  Tech Stack
                </a>
              </div>
            </>
          )}
          <div className="flex flex-col w-full items-center gap-2 border border-base-300 bg-base-200 drop-shadow-md rounded-xl p-4">
            <p className="text-2xl font-bold">Session Details:</p>
            {session?.user ? (
              <>
                <p>Name: {session.user.name}</p>
                <p>Email: {session.user.email}</p>
                <p>
                  Current Login Method:{" "}
                  {lastMethod === "email"
                    ? "Email and Password"
                    : lastMethod === "google"
                      ? "Google OAuth"
                      : "Unknown"}
                </p>
                <p>
                  Session Expiry: {session.session?.expiresAt.toDateString()}
                </p>
                <p>Session ID: {session.session?.id}</p>
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-16 h-16 rounded-full"
                  />
                )}
              </>
            ) : (
              <p>No session found.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
