import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin/dashboard");

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-brand">
          care4<span>removals</span>
          <em>Staff</em>
        </div>
        <h1>Sign in</h1>
        <p className="admin-login-note">
          Staff access only. Contact an administrator if you need an account.
        </p>
        <AdminLoginForm />
      </div>
    </div>
  );
}
