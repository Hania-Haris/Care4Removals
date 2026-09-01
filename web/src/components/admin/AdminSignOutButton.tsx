"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function AdminSignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    await signOut(auth).catch(() => {});
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" className="admin-signout" onClick={onSignOut}>
      Sign out
    </button>
  );
}
