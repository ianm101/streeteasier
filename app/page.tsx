import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/SignInButton";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-10 shadow-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            ApartmentHunt
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Your shared NYC apartment search workspace
          </p>
        </div>
        <div className="mt-8">
          <SignInButton />
        </div>
      </div>
    </div>
  );
}
