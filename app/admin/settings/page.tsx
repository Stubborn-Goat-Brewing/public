import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin/guard"
import { AdminShell } from "@/components/admin/admin-shell"
import { PasswordForm } from "@/components/admin/password-form"
import { PasskeySection } from "@/components/admin/passkey-section"
import { listPasskeys } from "./actions"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const { email } = await requireAdmin()
  const { passkeys, enabled } = await listPasskeys()

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
              Passkeys
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in without typing a password. Each device you use needs its own passkey.
            </p>
          </div>
          <PasskeySection passkeys={passkeys} enabled={enabled} />
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Password
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your password stays available as a backup even after adding passkeys.
            </p>
          </div>
          <PasswordForm />
        </section>
      </div>
    </AdminShell>
  )
}
