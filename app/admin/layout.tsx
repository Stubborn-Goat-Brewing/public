import type React from "react"
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "Admin | Stubborn Goat Brewing",
  // Keep the staff tool out of search results.
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
