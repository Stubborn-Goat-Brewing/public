"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function PrivacyPolicy() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/goat-head-new.png"
              alt="Stubborn Goat Brewing Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="hidden font-bold sm:inline-block">Stubborn Goat Brewing</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 sm:gap-6">
            <Link href="/menu" className="text-sm font-medium hover:underline underline-offset-4">
              Menu
            </Link>
            <Link href="/events" className="text-sm font-medium hover:underline underline-offset-4">
              Events
            </Link>
            <Link href="/#visit" className="text-sm font-medium hover:underline underline-offset-4">
              Visit Us
            </Link>
            <Link href="/#hours" className="text-sm font-medium hover:underline underline-offset-4">
              Hours
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
            <Link
              href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Gift Cards
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="container py-4 flex flex-col space-y-4">
              <Link
                href="/menu"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/#visit"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Visit Us
              </Link>
              <Link
                href="/#hours"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hours
              </Link>
              <Link
                href="/#contact"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gift Cards
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="container max-w-4xl py-12 md:py-16">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>

          <div className="space-y-6">
            <p className="text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p className="leading-7">
                At Stubborn Goat Brewing, we respect your privacy and are committed to protecting your personal data. This
                Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our
                website stubborngoatbrewing.com or interact with us in any way.
              </p>
              <p className="leading-7">
                <strong>
                  Important Note: We do not sell, rent, or disclose your personal information to any third parties for their
                  marketing purposes.
                </strong>{" "}
                Your privacy is important to us, and we only use your information as described in this Privacy Policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <p className="leading-7">We may collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>
                  <strong>Personal Information:</strong> Name, email address, and phone number when you sign up for our
                  newsletter, contact us, or make a purchase.
                </li>
                <li>
                  <strong>Age Verification:</strong> Date of birth to verify you are of legal drinking age.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you interact with our website, including IP address,
                  browser type, pages visited, time spent on pages, and other browsing information.
                </li>
                <li>
                  <strong>Cookies and Similar Technologies:</strong> We use cookies to enhance your experience on our
                  website. You can set your browser to refuse all or some browser cookies, but this may prevent some parts
                  of our website from functioning properly.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="leading-7">We may use the information we collect for various purposes, including to:</p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>Provide, maintain, and improve our website and services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information, such as updates to our terms, conditions, and policies</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Send you marketing communications about events, products, and other news</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our website</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. SMS/Text Messaging Communications</h2>
              <p className="leading-7">
                Stubborn Goat Brewing may offer SMS/text messaging communications as part of our services. By providing your
                mobile phone number and opting in to receive text messages from us, you consent to receive SMS messages from
                Stubborn Goat Brewing. These messages may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>Promotional offers and discounts</li>
                <li>Event announcements and reminders</li>
                <li>New product and menu updates</li>
                <li>Reservation confirmations and reminders</li>
                <li>Other marketing and informational messages</li>
              </ul>
              <p className="leading-7 mt-4">
                <strong>Important SMS Terms:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>
                  <strong>Consent:</strong> By opting in, you expressly consent to receive recurring automated marketing and
                  informational text messages from Stubborn Goat Brewing at the mobile number provided.
                </li>
                <li>
                  <strong>No Third-Party Sharing:</strong> We will not share your personal information, including your phone
                  number, with third parties for their marketing purposes.
                </li>
                <li>
                  <strong>Message Frequency:</strong> Message frequency varies based on your preferences, promotions, and
                  events. You may receive multiple messages per month.
                </li>
                <li>
                  <strong>Opt-Out:</strong> You can opt out of receiving SMS messages at any time by replying <strong>STOP</strong> to
                  any message you receive from us. After opting out, you will receive a confirmation message and will no
                  longer receive SMS messages from us unless you opt in again.
                </li>
                <li>
                  <strong>Help:</strong> For assistance, reply <strong>HELP</strong> to any message or contact us at{" "}
                  <a href="mailto:tribe@stubborngoatbrewing.com" className="text-primary hover:underline">
                    tribe@stubborngoatbrewing.com
                  </a>{" "}
                  or call <a href="tel:6106799017" className="text-primary hover:underline">610-679-9017</a>.
                </li>
                <li>
                  <strong>Message and Data Rates:</strong> Message and data rates may apply depending on your mobile carrier
                  and plan. Stubborn Goat Brewing is not responsible for any charges incurred from your mobile carrier.
                </li>
                <li>
                  <strong>Carriers:</strong> Supported carriers may vary. SMS services may not be available on all carriers.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Information Sharing and Disclosure</h2>
              <p className="leading-7">
                <strong>
                  We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
                </strong>{" "}
                However, we may share your information in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>
                  <strong>Service Providers:</strong> We may share your information with trusted third parties who assist us
                  in operating our website, conducting our business, or servicing you (such as payment processors or email
                  service providers), so long as those parties agree to keep this information confidential.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in
                  response to valid requests by public authorities.
                </li>
                <li>
                  <strong>Business Transfers:</strong> If Stubborn Goat Brewing is involved in a merger, acquisition, or
                  sale of all or a portion of its assets, your information may be transferred as part of that transaction.
                </li>
                <li>
                  <strong>With Your Consent:</strong> We may disclose your information for any other purpose with your
                  consent.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Security</h2>
              <p className="leading-7">
                We implement appropriate security measures to protect your personal information. However, please be aware
                that no method of transmission over the Internet or method of electronic storage is 100% secure. While we
                strive to use commercially acceptable means to protect your personal information, we cannot guarantee its
                absolute security.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights</h2>
              <p className="leading-7">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-7">
                <li>The right to access the personal information we hold about you</li>
                <li>The right to request correction of inaccurate personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to opt-out of marketing communications</li>
              </ul>
              <p className="leading-7">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section
                below.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
              <p className="leading-7">
                Our website is not intended for individuals under the age of 21. We do not knowingly collect personal
                information from children under 21. If you are a parent or guardian and believe that your child has provided
                us with personal information, please contact us so that we can delete such information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
              <p className="leading-7">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy
                Policy periodically for any changes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Third-Party Links</h2>
              <p className="leading-7">
                Our website may contain links to third-party websites. We have no control over and assume no responsibility
                for the content, privacy policies, or practices of any third-party sites or services. We encourage you to
                read the privacy policy of every website you visit.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. California Privacy Rights</h2>
              <p className="leading-7">
                California residents may have additional rights regarding their personal information under laws such as the
                California Consumer Privacy Act (CCPA). These may include the right to know what personal information is
                collected, the right to delete personal information, and the right to opt-out of the sale of personal
                information. As stated above, we do not sell your personal information.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">12. International Data Transfers</h2>
              <p className="leading-7">
                Your information may be transferred to and maintained on computers located outside of your state, province,
                country, or other governmental jurisdiction where the data protection laws may differ from those in your
                jurisdiction. If you are located outside the United States and choose to provide information to us, please
                note that we transfer the data to the United States and process it there.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
              <p className="leading-7">If you have any questions about this Privacy Policy, please contact us at:</p>
              <div className="leading-7">
                <p>Stubborn Goat Brewing</p>
                <p>122 Rosehill Ave</p>
                <p>West Grove, PA 19390</p>
                <p>Email: legal@stubborngoatbrewing.com</p>
                <p>Phone: 610-679-9017</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t">
              <Link href="/" className="text-primary hover:underline">
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>

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
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com/StubbornGoatBrewing" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_instagram.png" alt="Instagram" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://www.facebook.com/profile.php?id=61575081059536" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_facebook.png" alt="Facebook" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://untappd.com/StubbornGoatBrewing" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_untappd.png" alt="Untappd" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Untappd</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="mailto:tribe@stubborngoatbrewing.com">
                  <Image src="/images/icon_email.png" alt="Email" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Stubborn Goat Brewing. All rights reserved.</p>
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
    </div>
  )
}
