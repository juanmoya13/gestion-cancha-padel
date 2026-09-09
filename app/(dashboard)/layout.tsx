import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <div className="flex min-h-screen bg-[#f4f7f6]"><Sidebar /><div className="flex min-w-0 flex-1 flex-col"><Header email={user.email} />{children}</div></div>;
}