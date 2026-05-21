import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNav user={session.user} />
      <main>{children}</main>
    </div>
  );
}
