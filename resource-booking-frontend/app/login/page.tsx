"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("user123");

  const loginMutation = useMutation({
    mutationFn: loginUser,

    onSuccess: () => {
      toast.success("Login success!");
      window.location.href = "/";
    },

    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function handleLogin() {
    loginMutation.mutate({ email, password });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-pink-50">
      <div className="w-full max-w-md p-6 rounded-3xl shadow-lg bg-white space-y-5">
        <h1 className="text-3xl font-bold text-gray-800">
          Login Booking System
        </h1>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border p-3 rounded-xl text-gray-800"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full border p-3 rounded-xl text-gray-800"
        />

        <button
          onClick={handleLogin}
          disabled={loginMutation.isPending}
          className="w-full py-3 rounded-xl bg-indigo-600  font-semibold hover:opacity-90"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </div>
    </main>
  );
}
