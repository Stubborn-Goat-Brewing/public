import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-6">
          Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <h2>1. Introduction</h2>
        <p>
          At Stubborn Goat Brewing, we respect your privacy and are committed to protecting your personal data. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our
          website stubborngoatbrewing.com or interact with us in any way.
        </p>
        <p>
          <strong>
            Important Note: We do not sell, rent, or disclose your personal information to any third parties for their
            marketing purposes.
          </strong>{" "}
          Your privacy is important to us, and we only use your information as described in this Privacy Policy.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
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
            <strong>Cookies and Similar Technologies:</strong> We use cookies to enhance your experience on our website.
            You can set your browser to refuse all or some browser cookies, but this may prevent some parts of our
            website from functioning properly.
          </li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We may use the information we collect for various purposes, including to:</p>
        <ul>
          <li>Provide, maintain, and improve our website and services</li>
          <li>Process transactions and send related information</li>
          <li>Send administrative information, such as updates to our terms, conditions, and policies</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Send you marketing communications about events, products, and other news</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our website</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>4. Information Sharing and Disclosure</h2>
        <p>
          <strong>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
          </strong>{" "}
          However, we may share your information in the following limited circumstances:
        </p>
        <ul>
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
            <strong>Business Transfers:</strong> If Stubborn Goat Brewing is involved in a merger, acquisition, or sale
            of all or a portion of its assets, your information may be transferred as part of that transaction.
          </li>
          <li>
            <strong>With Your Consent:</strong> We may disclose your information for any other purpose with your
            consent.
          </li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However, please be aware that
          no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to
          use commercially acceptable means to protect your personal information, we cannot guarantee its absolute
          security.
        </p>

        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
          <li>The right to access the personal information we hold about you</li>
          <li>The right to request correction of inaccurate personal information</li>
          <li>The right to request deletion of your personal information</li>
          <li>The right to opt-out of marketing communications</li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
        </p>

        <h2>7. Children's Privacy</h2>
        <p>
          Our website is not intended for individuals under the age of 21. We do not knowingly collect personal
          information from children under 21. If you are a parent or guardian and believe that your child has provided
          us with personal information, please contact us so that we can delete such information.
        </p>

        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy
          Policy periodically for any changes.
        </p>

        <h2>9. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We have no control over and assume no responsibility
          for the content, privacy policies, or practices of any third-party sites or services. We encourage you to read
          the privacy policy of every website you visit.
        </p>

        <h2>10. California Privacy Rights</h2>
        <p>
          California residents may have additional rights regarding their personal information under laws such as the
          California Consumer Privacy Act (CCPA). These may include the right to know what personal information is
          collected, the right to delete personal information, and the right to opt-out of the sale of personal
          information. As stated above, we do not sell your personal information.
        </p>

        <h2>11. International Data Transfers</h2>
        <p>
          Your information may be transferred to and maintained on computers located outside of your state, province,
          country, or other governmental jurisdiction where the data protection laws may differ from those in your
          jurisdiction. If you are located outside the United States and choose to provide information to us, please
          note that we transfer the data to the United States and process it there.
        </p>

        <h2>12. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p>
          Stubborn Goat Brewing
          <br />
          122 Rosehill Ave
          <br />
          West Grove, PA 19390
          <br />
          Email: legal@stubborngoatbrewing.com
          <br />
          Phone: 610-679-9017
        </p>

        <div className="mt-8">
          <Link href="/" className="text-primary hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
