import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          care4<span>removals</span>
          <em>Staff</em>
        </div>
        <nav>
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/admin/leads">Leads</Link>
          <Link href="/admin/jobs">Jobs</Link>
        </nav>
        <div className="admin-user">
          <span className="admin-user-email">{user.email}</span>
          <span className="admin-role">{user.role}</span>
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
