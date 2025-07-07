import Link from "next/link"

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Terms of Service</h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-6">
          Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          Welcome to Stubborn Goat Brewing. By accessing and using our website, located at stubborngoatbrewing.com, you
          accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by
          these terms, please do not use this website.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily view the materials on Stubborn Goat Brewing's website for personal,
          non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you
          may not:
        </p>
        <ul>
          <li>Modify or copy the materials;</li>
          <li>Use the materials for any commercial purpose or for any public display;</li>
          <li>Attempt to reverse engineer any software contained on Stubborn Goat Brewing's website;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>
        <p>
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by
          Stubborn Goat Brewing at any time. Upon terminating your viewing of these materials or upon the termination of
          this license, you must destroy any downloaded materials in your possession whether in electronic or printed
          format.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on Stubborn Goat Brewing's website are provided on an 'as is' basis. Stubborn Goat Brewing makes
          no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without
          limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or
          non-infringement of intellectual property or other violation of rights.
        </p>
        <p>
          Further, Stubborn Goat Brewing does not warrant or make any representations concerning the accuracy, likely
          results, or reliability of the use of the materials on its website or otherwise relating to such materials or
          on any sites linked to this site.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall Stubborn Goat Brewing or its suppliers be liable for any damages (including, without
          limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
          inability to use the materials on Stubborn Goat Brewing's website, even if Stubborn Goat Brewing or a Stubborn
          Goat Brewing authorized representative has been notified orally or in writing of the possibility of such
          damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability
          for consequential or incidental damages, these limitations may not apply to you.
        </p>

        <h2>5. Accuracy of Materials</h2>
        <p>
          The materials appearing on Stubborn Goat Brewing's website could include technical, typographical, or
          photographic errors. Stubborn Goat Brewing does not warrant that any of the materials on its website are
          accurate, complete or current. Stubborn Goat Brewing may make changes to the materials contained on its
          website at any time without notice. However, Stubborn Goat Brewing does not make any commitment to update the
          materials.
        </p>

        <h2>6. Links</h2>
        <p>
          Stubborn Goat Brewing has not reviewed all of the sites linked to its website and is not responsible for the
          contents of any such linked site. The inclusion of any link does not imply endorsement by Stubborn Goat
          Brewing of the site. Use of any such linked website is at the user's own risk.
        </p>

        <h2>7. Modifications</h2>
        <p>
          Stubborn Goat Brewing may revise these terms of service for its website at any time without notice. By using
          this website you are agreeing to be bound by the then current version of these terms of service.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of Pennsylvania and you
          irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>

        <h2>9. Age Restrictions</h2>
        <p>
          Our website is intended for individuals who are of legal drinking age (21 years or older in the United
          States). By using this website, you confirm that you are of legal drinking age in your jurisdiction. Stubborn
          Goat Brewing encourages responsible drinking and does not support the misuse of alcoholic beverages.
        </p>

        <h2>10. User Contributions</h2>
        <p>
          Users may be permitted to submit content to our website, including but not limited to reviews, comments, and
          social media interactions. By submitting content, you grant Stubborn Goat Brewing a non-exclusive,
          royalty-free, perpetual, irrevocable right to use, reproduce, modify, adapt, publish, translate, create
          derivative works from, distribute, and display such content throughout the world in any media.
        </p>

        <h2>11. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Stubborn Goat Brewing, its officers, directors, employees,
          agents, licensors, and suppliers from and against all losses, expenses, damages, and costs, including
          reasonable attorneys' fees, resulting from any violation of these terms or any activity related to your
          account (if any).
        </p>

        <h2>12. Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us at:</p>
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
