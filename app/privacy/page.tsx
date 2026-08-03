import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo/site"
import { PrivacyClient } from "./privacy-client"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Stubborn Goat Brewing collects, uses, and protects your personal information.",
  path: "/privacy",
})

export default function Page() {
  return <PrivacyClient />
}
