import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const SOCIAL_LINKS = [
  {
    href: "https://instagram.com/StubbornGoatBrewing",
    label: "Instagram",
    icon: "/images/icon_instagram.png",
    external: true,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61575081059536",
    label: "Facebook",
    icon: "/images/icon_facebook.png",
    external: true,
  },
  {
    href: "https://untappd.com/StubbornGoatBrewing",
    label: "Untappd",
    icon: "/images/icon_untappd.png",
    external: true,
  },
  {
    href: "mailto:tribe@stubborngoatbrewing.com",
    label: "Email",
    icon: "/images/icon_email.png",
    external: false,
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/images/goat-head-new.png"
              alt="Stubborn Goat Brewing Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-bold">Stubborn Goat Brewing</span>
          </div>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map((social) => (
              <Button key={social.label} variant="ghost" size="icon" asChild>
                <Link
                  href={social.href}
                  {...(social.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Image src={social.icon || "/placeholder.svg"} alt={social.label} width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Stubborn Goat Brewing. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>{" "}
            |
            <Link href="/terms" className="hover:underline">
              {" "}
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
