"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { Check } from "lucide-react";
import React, { useState } from "react";

const Signup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    setLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        name: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        callbackURL: "/dashboard",
      });
      // console.log("Signup response:", { data, error });

      if (error) {
        setError("Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col bg-white lg:min-h-screen lg:flex-row">
      {/* Left image panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src="/signup.png"
          alt="A handcrafted bamboo swing on a balcony"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/60" />

        <div className="relative flex h-full flex-col items-center justify-center p-12">
          <blockquote className="max-w-md text-center">
            <span className="mx-auto mb-5 block h-px w-12 bg-brand-rose" />
            <p className="font-serif text-3xl leading-snug text-white drop-shadow-md">
              Handmade with care, crafted with love.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/85 drop-shadow-sm">
              Every swing weaves into your home&apos;s story.
            </p>
          </blockquote>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-start px-6 py-10 sm:px-10 lg:w-1/2 lg:justify-center lg:px-20 lg:py-16">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="mt-8 font-serif text-3xl text-ink lg:mt-0">
            Create your account
          </h1>
          <p className="mt-2 text-sm font-semibold text-smoke">
            Join BelaView and start creating a home that moves to your rhythm.
          </p>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
            <TextField
              isRequired
              name="username"
              className="flex flex-col gap-1.5"
            >
              <Label className="text-sm font-medium text-ink">
                Username
              </Label>
              <Input
                placeholder="Enter your username"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <FieldError className="text-xs text-brand" />
            </TextField>

            <TextField
              isRequired
              name="email"
              type="email"
              className="flex flex-col gap-1.5"
              validate={(value) => {
                if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                  return "Please enter a valid email address";
                }
                return null;
              }}
            >
              <Label className="text-sm font-medium text-ink">
                Email
              </Label>
              <Input
                placeholder="Enter your email"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <FieldError className="text-xs text-brand" />
            </TextField>

            <TextField isRequired name="phone" type="tel" className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-ink">
                Phone Number
              </Label>
              <Input
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <FieldError className="text-xs text-brand" />
            </TextField>

            <TextField
              isRequired
              minLength={8}
              name="password"
              type="password"
              className="flex flex-col gap-1.5"
              validate={(value) => {
                if (value.length < 8) {
                  return "Password must be at least 8 characters";
                }
                if (!/[A-Z]/.test(value)) {
                  return "Password must contain at least one uppercase letter";
                }
                if (!/[0-9]/.test(value)) {
                  return "Password must contain at least one number";
                }
                return null;
              }}
            >
              <Label className="text-sm font-medium text-ink">
                Password
              </Label>
              <Input
                placeholder="Enter your password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-fog outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <Description className="text-xs text-fog">
                Must be at least 8 characters with 1 uppercase and 1 number
              </Description>
              <FieldError className="text-xs text-brand" />
            </TextField>

            {error && (
              <p className="text-sm text-brand" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              isDisabled={loading}
              className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check size={16} />
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-smoke">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-brand hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
