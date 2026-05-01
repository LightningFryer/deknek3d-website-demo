"use client";
import { signIn, signOut, authClient } from "@/app/lib/auth-client";

export default function Navbar() {
  const { data: session, error } = authClient.useSession();
  return (
    <div className="flex items-center justify-center absolute w-full">
      <div className="navbar bg-base-100 shadow-sm p-4 m-4 drop-shadow-2xl rounded-2xl">
        <div className="flex-1">
          <a className="btn btn-ghost rounded-xl text-xl">
            DekNek3D Full Stack Demo
          </a>
        </div>

        <div className="flex flex-row gap-x-4">
          {session?.user ? (
            <button className="btn btn-lg rounded-xl" onClick={signOut}>
              Sign Out
            </button>
          ) : (
            <a href="/signin" className="btn btn-lg rounded-xl">
              Sign In
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
