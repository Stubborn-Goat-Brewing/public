import Image from "next/image"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Admin Sign In | Stubborn Goat Brewing",
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Image
            src="/images/full-logo.png"
            alt="Stubborn Goat Brewing"
            width={160}
            height={72}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">Event Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to manage the calendar.</p>
          </div>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
