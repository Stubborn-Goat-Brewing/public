import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin/guard"
import { AdminShell } from "@/components/admin/admin-shell"
import { PasswordForm } from "@/components/admin/password-form"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const { email } = await requireAdmin()

  return (
    <AdminShell email={email}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Update the password you use to sign in to the admin portal.
            </p>
          </div>
          <PasswordForm />
        </section>
      </div>
    </AdminShell>
  )
}
