"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface AppNavProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export function AppNav({ user }: AppNavProps) {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              ApartmentHunt
            </Link>
            <div className="hidden md:flex md:gap-4">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Dashboard
              </Link>
              <Link
                href="/inbox"
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Inbox
              </Link>
              <button
                disabled
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
              >
                Rankings
              </button>
              <button
                disabled
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed"
              >
                Settings
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-zinc-700">
                {user.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
