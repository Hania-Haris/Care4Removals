import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { getSessionUser } from "@/lib/auth/session";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, user] = await Promise.all([getSettings(), getSessionUser()]);
  const canEdit = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="admin-page">
      <h1>Business settings</h1>
      <p className="admin-muted" style={{ marginBottom: 24 }}>
        These values drive the public site copy, the quote form, VAT
        handling, quote validity and email routing. Changes take effect
        within a few minutes (or immediately on save).
      </p>
      <SettingsForm settings={settings} canEdit={canEdit} />
    </div>
  );
}
