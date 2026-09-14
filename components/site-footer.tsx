import Image from "next/image"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BUSINESS } from "@/lib/seo/site"
import { WEEKLY_HOURS } from "@/lib/hours"
import { InstagramIcon, FacebookIcon, UntappdIcon } from "@/components/brand-icons"

const SOCIAL_LINKS = [
  {
    href: "https://instagram.com/StubbornGoatBrewing",
    label: "Instagram",
    Icon: InstagramIcon,
    external: true,
  },
  {
    href: "https://www.facebook.com/profile.php?id=61575081059536",
    label: "Facebook",
    Icon: FacebookIcon,
    external: true,
  },
  {
    href: "https://untappd.com/StubbornGoatBrewing",
    label: "Untappd",
    Icon: UntappdIcon,
    external: true,
  },
  {
    href: "mailto:tribe@stubborngoatbrewing.com",
    label: "Email",
    Icon: Mail,
    external: false,
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start gap-4">
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
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.Icon
                return (
                  <Button key={social.label} variant="ghost" size="icon" asChild>
                    <Link
                      href={social.href}
                      {...(social.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="sr-only">{social.label}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Get in Touch</h2>
            <Link
              href={`tel:${BUSINESS.phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
            >
              <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              (610) 679-9017
            </Link>
            <Link
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
            >
              <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {BUSINESS.email}
            </Link>
          </div>

          <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
            <h2 className="text-sm font-semibold uppercase tracking-wide">Hours</h2>
            <dl className="w-full max-w-xs space-y-1 text-sm text-muted-foreground">
              {WEEKLY_HOURS.map((item) => (
                <div key={item.day} className="flex justify-between gap-4">
                  <dt>{item.day}</dt>
                  <dd className={item.time === "Closed" ? "text-red-600" : ""}>{item.time}</dd>
                </div>
              ))}
            </dl>
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
