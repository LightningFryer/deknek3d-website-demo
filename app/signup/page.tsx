"use client";
import { useState, useEffect } from "react";
import { authClient } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/");
    }
  }, [session, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (signUpError) {
        setFormError(signUpError.message ?? "Something went wrong.");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen min-w-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 w-full max-w-md px-4">
        {/* <h1 className="">Sign Up</h1> */}
        <p className=" w-full text-center text-3xl font-bold">
          Create an account with email and password or Google OAuth
        </p>

        <form
          onSubmit={handleSignUp}
          className="flex flex-col w-full gap-4 border border-base-300 bg-base-200 drop-shadow-md rounded-xl p-6"
        >
          <p className="text-2xl font-bold text-center">Sign Up</p>

          {formError && (
            <div className="alert alert-error rounded-xl text-sm">{formError}</div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Name</span>
            <input
              type="text"
              className="input input-bordered rounded-xl w-full"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              className="input input-bordered rounded-xl w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              className="input input-bordered rounded-xl w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-lg btn-primary rounded-xl w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Sign Up"
            )}
          </button>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <a href="/" className="link link-primary">
              Sign In
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
