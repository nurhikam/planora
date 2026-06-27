import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ name: session.user.name || "", email: session.user.email || "" }} />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
