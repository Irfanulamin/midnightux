import type { LegalSection } from "@/components/legal/legal-doc";

/*
 * Privacy Policy copy, derived from PRIVACY_POLICY.md at the repo root.
 *
 * TWO DELIBERATE DIFFERENCES FROM THE SOURCE DOCUMENT, both load-bearing:
 *
 *   1. The internal reviewer notes are stripped. The markdown carries
 *      "[ACTION REQUIRED]" and "[LEGAL REVIEW REQUIRED]" blocks written TO the
 *      studio (appoint a representative, verify this against counsel, do not
 *      publish a fabricated address). Those are working notes, not disclosures,
 *      and publishing them would tell every reader which obligations are
 *      currently unmet. The markdown remains the working copy; this file is the
 *      published one. Keep them in step by hand when the policy changes.
 *
 *   2. Unfilled values render as <code> chips, not as prose. A placeholder set
 *      in body type reads as real text and ships silently; a cream monospace
 *      chip does not. Anything still in a chip on launch day is a bug. The two
 *      founders' legal names in section 01 are the remaining ones.
 *
 *      NOTE that a chip is for a value that WILL exist and is merely unfilled.
 *      A claim about something that does not exist at all gets deleted instead,
 *      not chipped: the EU and UK Article 27 representatives, the recorded
 *      balancing test, the Transfer Impact Assessment, US cold email, telephone
 *      marketing and two of the security measures were all removed outright
 *      rather than parked behind a placeholder. Each deletion carries a comment
 *      at its old site saying what would have to become true to restore it.
 *
 * The markdown's tables are set here as <dl>. A table needs horizontal
 * scrolling on a phone the moment a cell holds a sentence, and these cells hold
 * paragraphs. See the PROSE constant in legal-doc.tsx.
 *
 * No em-dashes anywhere, matching the rest of the site.
 */

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are and how to reach us",
    body: (
      <>
        <dl>
          <dt>Data controller</dt>
          <dd>
            MidnightUX is a trading name, not a registered company. The
            controller is <code>founder one, full legal name</code> and{" "}
            <code>founder two, full legal name</code>, trading as MidnightUX.
            Until a company is registered, they contract with you personally.
          </dd>
          <dt>Country of establishment</dt>
          <dd>Bangladesh</dd>
          <dt>Contact for everything</dt>
          <dd>
            <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>
          </dd>
        </dl>

        <p>
          We run a single mailbox. Privacy questions, rights requests, opt-out
          requests and general enquiries all go to the same address, and all of
          them reach a person. Put the topic in the subject line if you can.{" "}
          <strong>
            To opt out of contact from us, &ldquo;stop&rdquo; in the subject line
            is enough.
          </strong>
        </p>

        <p>
          We aim to acknowledge every privacy request within 5 business days, and
          to resolve it within the deadlines set out in Your rights below.
        </p>

        <h3>Data Protection Officer</h3>
        <p>
          We have not appointed one. Our core activities are not large-scale
          systematic monitoring and we do not process special category data at
          scale, so we do not believe Article 37 requires it.
        </p>
      </>
    ),
  },

  {
    id: "quick-summary",
    title: "Quick summary",
    body: (
      <>
        <p>
          The whole policy is below. This is the short version of the questions
          people actually ask.
        </p>
        <dl>
          <dt>Do you sell my personal data?</dt>
          <dd>
            No. We have never sold personal data and we do not share it for
            cross-context behavioural advertising.
          </dd>
          <dt>Do you contact people who did not ask to hear from you?</dt>
          <dd>
            Yes, businesses, subject to the regional rules in Marketing and
            outreach below.
          </dd>
          <dt>Where does your prospect data come from?</dt>
          <dd>
            Public business listings, business websites, public directories and
            map listings. See Where we get prospect data.
          </dd>
          <dt>Can I make you stop?</dt>
          <dd>
            Yes. Immediately, permanently, and with no reason required. One email
            to <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>.
          </dd>
          <dt>Where is my data processed?</dt>
          <dd>
            Bangladesh, plus our service providers in the US and the EU. See
            International transfers.
          </dd>
          <dt>Do you use tracking cookies?</dt>
          <dd>
            Only if you consent. Analytics storage is denied by default. See
            Cookies and analytics.
          </dd>
          <dt>Do you handle sensitive data?</dt>
          <dd>
            No. We do not seek health, biometric, financial account, religious,
            political or sexual orientation data, and we ask that you do not send
            it.
          </dd>
        </dl>
      </>
    ),
  },

  {
    id: "what-we-collect",
    title: "What we collect, and why",
    body: (
      <>
        <p>
          This policy covers four groups of people, and the answers are not the
          same for each: visitors to this website, people who book a call,
          clients, and prospects we contact who did not contact us first.
        </p>

        <h3>Website visitors</h3>
        <p>
          When you load this website, our hosting provider and our own logs
          necessarily process:
        </p>
        <ul>
          <li>
            <strong>IP address.</strong> Delivering the page, security, abuse
            prevention and rate limiting.
          </li>
          <li>
            <strong>Browser, device and operating system.</strong> Rendering
            correctly and diagnosing faults.
          </li>
          <li>
            <strong>Pages viewed, time on page, referring URL.</strong>{" "}
            Understanding what people find useful.
          </li>
          <li>
            <strong>Approximate location, derived from IP at city level.</strong>{" "}
            Security and coarse analytics only. We do not collect GPS or precise
            location.
          </li>
          <li>
            <strong>Campaign parameters</strong> (<code>utm_source</code>,{" "}
            <code>utm_medium</code>, <code>utm_campaign</code>,{" "}
            <code>utm_term</code>, <code>utm_content</code>, <code>gclid</code>,{" "}
            <code>gbraid</code>, <code>wbraid</code>, <code>fbclid</code>,{" "}
            <code>msclkid</code>) from the link you clicked, so we know which
            campaign brought you here.
          </li>
        </ul>
        <p>
          Campaign parameters are stored in your browser under the{" "}
          <code>sessionStorage</code> key <code>ms_campaign</code>. This is
          first-touch only, it is cleared when you close the tab, and it is not a
          cookie. We also store your scroll position in <code>sessionStorage</code>{" "}
          so that reloading does not lose your place. Neither is used to build a
          profile of you.
        </p>
        <p>
          <strong>Analytics storage is denied until you consent.</strong> The
          Google tag loads with storage switched off and runs cookieless, and it
          is not granted storage unless you accept on the banner. See Cookies
          and analytics.
        </p>

        <h3>People who book a call</h3>
        <p>Our booking flow has two steps. In the first, on our own site, we ask for:</p>
        <ul>
          <li>
            <strong>Your name.</strong> Required, so we can address you correctly
            and put a name on the calendar invitation.
          </li>
          <li>
            <strong>Your email address.</strong> Required, to send the
            confirmation and meeting link, and to reply to you.
          </li>
          <li>
            <strong>A message about your project.</strong> Optional, so the call
            is useful from the first minute.
          </li>
          <li>
            <strong>Which button you pressed.</strong> Collected automatically, so
            we know whether you want a consultation, the $399 package, the $699
            package or a custom quote.
          </li>
          <li>
            <strong>Your stored campaign parameters.</strong> Collected
            automatically, for attribution.
          </li>
        </ul>
        <p>
          In the second step the booking calendar is provided by{" "}
          <strong>Cal.com</strong>. When you choose a time, Cal.com processes your
          name, email address, chosen time slot and timezone under its own privacy
          policy, as an independent controller for its own platform operations and
          as our processor for the booking itself.
        </p>
        <p>
          Once a booking is confirmed, Cal.com sends us a signed webhook and we
          send two emails over SMTP: a confirmation to you, and a notification to
          ourselves. Those contain your name, email address, the chosen time, your
          timezone, the meeting link and any message you wrote.
        </p>
        <p>
          <strong>
            We do not ask for, and do not want, your phone number, postal address,
            date of birth, financial account details or any government identifier
            at this stage.
          </strong>
        </p>

        <h3>Clients</h3>
        <p>If you engage us, we additionally process what the work requires:</p>
        <ul>
          <li>
            Billing contact name, billing email, billing address, and tax or VAT
            registration number where applicable.
          </li>
          <li>
            Payment references. <strong>We do not store full card numbers.</strong>{" "}
            Payments are handled by a third-party payment provider, which is the
            controller of your payment instrument data. We will tell you which
            provider before you pay.
          </li>
          <li>
            Credentials and access you choose to give us: domain registrar,
            hosting, CMS logins, DNS, repository access, analytics accounts and
            brand assets.
          </li>
          <li>
            Project correspondence, briefs, feedback, revision notes and
            approvals.
          </li>
          <li>
            The content you supply for the site, which may itself contain personal
            data about your staff or customers. Where that happens we act as your
            processor. See When we act for our clients.
          </li>
        </ul>
      </>
    ),
  },

  {
    id: "prospect-data",
    title: "Where we get prospect data",
    body: (
      <>
        <p>
          This section is our notice under <strong>Article 14 of the GDPR</strong>{" "}
          and <strong>Article 14 of the UK GDPR</strong>, which apply when personal
          data is obtained from somewhere other than the person it describes.{" "}
          <strong>
            If we contacted you and you did not give us your details, this is the
            section that explains it.
          </strong>
        </p>

        <h3>What we collect about prospects</h3>
        <p>We collect business contact information only:</p>
        <ul>
          <li>Business or organisation name.</li>
          <li>Business website address.</li>
          <li>
            A publicly listed business email address, and where published, a
            general business phone number.
          </li>
          <li>A publicly listed business address.</li>
          <li>
            A role or job title, and where it is published alongside the business
            listing, the name of a contact person.
          </li>
          <li>
            Publicly visible information about the business&rsquo;s existing
            website: whether it exists, whether it is mobile-friendly, and how
            quickly it loads. This is how we decide whether our service is
            relevant to you at all.
          </li>
        </ul>
        <p>
          <strong>We do not collect</strong> personal email addresses, personal
          mobile numbers, home addresses, or any special category data, and we do
          not enrich, append, infer or purchase additional data about individuals.
        </p>

        <h3>The sources we use</h3>
        <dl>
          <dt>Publicly accessible business websites</dt>
          <dd>
            Business contact details published by the business itself, on
            &ldquo;Contact&rdquo; and &ldquo;About&rdquo; pages.
          </dd>
          <dt>Public business directories and industry listings</dt>
          <dd>Business contact details.</dd>
          <dt>Public map and local business listings</dt>
          <dd>
            Business name, category, public phone, public address and website
            link.
          </dd>
          <dt>Professional and business networking profiles</dt>
          <dd>
            Business contact details and role, where the person has published
            them.
          </dd>
          <dt>Referrals</dt>
          <dd>
            Name, business and business contact details, where an existing contact
            passes them on.
          </dd>
        </dl>

        <h3>Why we are allowed to do this</h3>
        <p>
          We rely on <strong>legitimate interests</strong> (GDPR Article 6(1)(f))
          to identify businesses that may want a website and to make a first,
          relevant, business-to-business approach. We rely on legitimate
          interests here and will explain our reasoning on request. The factors
          that keep the balance in favour of
          processing are that the data is business data published by the business,
          the volume per person is minimal, we do not profile individuals, and we
          make stopping trivially easy.
        </p>

        <h3>How to make us stop</h3>
        <blockquote>
          <p>
            <strong>
              Your right to object is absolute where the purpose is direct
              marketing.
            </strong>{" "}
            Under Article 21(2) there is no balancing test and no grounds are
            needed. If you tell us to stop, we stop, permanently, without asking
            why.
          </p>
        </blockquote>
        <p>Do any one of these:</p>
        <ul>
          <li>Reply &ldquo;stop&rdquo; or &ldquo;unsubscribe&rdquo; to any message we send.</li>
          <li>Click the unsubscribe link in any email.</li>
          <li>
            Email <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>.
          </li>
        </ul>
        <p>
          When you opt out we keep the minimum record needed to honour it, which
          is your email address or phone number in a suppression list. We keep that
          indefinitely, because deleting it is how people get contacted a second
          time. That retention rests on our legitimate interest in not contacting
          you again, and on compliance with anti-spam law. You can ask us to delete
          the suppression record instead, and we will explain the consequence
          before doing so.
        </p>

        <h3>How long we keep prospect data</h3>
        <dl>
          <dt>If you do not respond</dt>
          <dd>6 months from first contact, then deleted.</dd>
          <dt>If you tell us you are not interested</dt>
          <dd>Deleted within 30 days, except the suppression record.</dd>
          <dt>If you opt out</dt>
          <dd>Deleted within 30 days, except the suppression record.</dd>
          <dt>If you become a client</dt>
          <dd>Retained under the client rules in How long we keep data.</dd>
        </dl>
      </>
    ),
  },

  {
    id: "legal-bases",
    title: "Legal bases for processing",
    body: (
      <>
        <p>
          Under the GDPR and UK GDPR we must have a lawful basis for each purpose.
          Here they are, purpose by purpose.
        </p>
        <dl>
          <dt>Serving the website, security, abuse prevention</dt>
          <dd>
            IP, device and request logs. Legitimate interests, Article 6(1)(f):
            running a secure service.
          </dd>
          <dt>Analytics</dt>
          <dd>
            Usage data and campaign parameters. <strong>Consent</strong>, Article
            6(1)(a), plus consent under ePrivacy for storage on your device.
          </dd>
          <dt>Responding to your booking or enquiry</dt>
          <dd>
            Name, email, message, chosen time. Steps at your request prior to a
            contract, Article 6(1)(b).
          </dd>
          <dt>Sending you a booking confirmation</dt>
          <dd>
            Name, email, time, meeting link. Contract and pre-contract steps,
            Article 6(1)(b).
          </dd>
          <dt>Delivering the project</dt>
          <dd>Client and project data. Contract, Article 6(1)(b).</dd>
          <dt>Invoicing, accounting and tax records</dt>
          <dd>
            Billing data. Legal obligation, Article 6(1)(c), and contract.
          </dd>
          <dt>Business-to-business outreach to prospects</dt>
          <dd>
            Business contact data. Legitimate interests, Article 6(1)(f), subject
            to the regional rules below.
          </dd>
          <dt>Marketing to existing clients about similar services</dt>
          <dd>
            Name and email. Legitimate interests, plus the soft opt-in where
            available.
          </dd>
          <dt>Marketing where national law requires consent</dt>
          <dd>
            Name and email. <strong>Consent</strong>, Article 6(1)(a).
          </dd>
          <dt>Keeping a suppression list</dt>
          <dd>Email and phone. Legal obligation and legitimate interests.</dd>
          <dt>Defending legal claims</dt>
          <dd>Whatever is relevant. Legitimate interests, Article 6(1)(f).</dd>
        </dl>
        <p>
          Where we rely on legitimate interests, you may ask us to explain our
          reasoning. Where we rely on consent, you may withdraw it at any
          time, and withdrawing it is as easy as giving it. Withdrawal does not
          affect processing that already happened.
        </p>
      </>
    ),
  },

  {
    id: "outreach-by-region",
    title: "Marketing and outreach by region",
    body: (
      <>
        <p>
          We contact businesses. The rules differ by where the recipient is, and
          we apply the stricter rule when in doubt.
        </p>

        <h3>European Union and EEA</h3>
        <p>
          The GDPR governs whether we may hold the data. The{" "}
          <strong>ePrivacy Directive (2002/58/EC)</strong>, implemented separately
          by each member state, governs whether we may send the message. These are
          different questions, and passing one does not pass the other.
        </p>
        <ul>
          <li>
            <strong>Email to a named individual at a business</strong> is treated
            as email to a natural person in several member states and requires
            prior consent.
          </li>
          <li>
            <strong>Germany</strong> requires prior consent for advertising email,
            including business-to-business, under UWG §7. We do not send cold email
            to Germany without consent.
          </li>
          <li>
            <strong>Italy</strong> and <strong>Austria</strong> apply similarly
            strict rules.
          </li>
          <li>
            <strong>France</strong>, the <strong>Netherlands</strong> and several
            others permit business-to-business email to a role or generic business
            address, where the offer relates to the recipient&rsquo;s professional
            function, with a clear opt-out in every message.
          </li>
          <li>
            <strong>Generic role addresses</strong> (<code>info@</code>,{" "}
            <code>contact@</code>, <code>hello@</code>) are lower risk than named
            individual addresses in most member states, and are our default.
          </li>
        </ul>
        {/*
          "our address" used to sit in this list. It was the same overclaim as
          the US CAN-SPAM bullet below: the studio has no published postal
          address, so a message cannot carry one.
        */}
        <p>
          Every message we send to the EEA carries our identity, our contact
          details, the reason you are hearing from us, where we got your
          details, and a working one-click opt-out.
        </p>

        <h3>United Kingdom</h3>
        <p>
          Under PECR, unsolicited marketing email to{" "}
          <strong>corporate subscribers</strong> (limited companies, LLPs, public
          bodies) is permitted with clear identification and an opt-out. Marketing
          email to <strong>sole traders and unincorporated partnerships</strong> is
          treated as marketing to individuals and requires consent or the soft
          opt-in. We check corporate status before emailing UK contacts.
        </p>

        {/*
          The Email bullet used to describe how we comply with CAN-SPAM. It
          could not be true: CAN-SPAM requires a valid physical postal address
          in every commercial message, and the studio has none to put there.
          The choice was to publish a real address or to stop claiming the
          activity. This is the second.
        */}
        <h3>United States</h3>
        <ul>
          <li>
            <strong>Email.</strong> We do not send unsolicited commercial email
            to recipients in the United States. The CAN-SPAM Act requires a
            valid physical postal address in every commercial message, and we do
            not currently publish one, so we do not run US cold email at all. If
            that changes, this section changes first.
          </li>
          <li>
            <strong>Calls.</strong> We do not make marketing calls.
          </li>
          <li>
            <strong>Texts.</strong> We do not send marketing SMS.
          </li>
        </ul>

        <h3>Canada</h3>
        <p>
          CASL requires express or implied consent before sending a commercial
          electronic message. Implied consent may exist where a business address is
          conspicuously published without a statement refusing unsolicited
          messages, and the message is relevant to that person&rsquo;s role. We rely
          only on that narrow route, and we treat the implied-consent window as
          expiring on the statutory timetable.
        </p>

        <h3>Australia</h3>
        <p>
          The Spam Act 2003 requires consent, which may be inferred where a work
          address is conspicuously published without a statement refusing
          unsolicited messages and the message is relevant to the role. Every
          message identifies us and carries a functional unsubscribe.
        </p>

        <h3>Everywhere else</h3>
        <p>
          We apply the strictest of the recipient&rsquo;s local law, this policy,
          and the platform terms of whatever channel we are using.
        </p>

        <h3>What we never do</h3>
        <ul>
          <li>Use false or misleading sender names, subject lines or headers.</li>
          <li>Conceal that a message is a commercial approach.</li>
          <li>Continue after an opt-out.</li>
          <li>
            Contact people at addresses obtained by circumventing a technical
            restriction, a login wall, or a <code>robots.txt</code> exclusion.
          </li>
          <li>Buy or rent marketing lists, or sell ours.</li>
          <li>
            Send unsolicited messages to personal email addresses or personal
            mobile numbers.
          </li>
        </ul>
      </>
    ),
  },

  {
    id: "who-we-share-with",
    title: "Who we share data with",
    body: (
      <>
        {/*
          Was "each under a written contract that restricts them to our
          instructions". We use Google's and Cal.com's off-the-shelf terms, not
          negotiated bespoke agreements, and describing a self-serve signup as a
          contract we wrote is the kind of claim that only ever gets tested when
          it matters.
        */}
        <p>
          We do not sell personal data. We share it with the following
          recipients, each under their standard data processing terms or a
          written contract.
        </p>
        <dl>
          <dt>Cal.com</dt>
          <dd>
            Name, email, chosen time, timezone and booking notes. Processor for
            the booking, controller for its own platform. US and EU.
          </dd>
          <dt>Google (Gmail and Workspace SMTP)</dt>
          <dd>
            The contents of confirmation and notification emails. Processor. US
            and global.
          </dd>
          <dt>Google (Meet)</dt>
          <dd>Meeting link and participants. Processor. US and global.</dd>
          <dt>Google Analytics 4</dt>
          <dd>
            Pseudonymous usage data, only with consent. Processor. US and global.
          </dd>
          <dt>Our hosting provider</dt>
          <dd>Request logs and IP addresses. Processor. US and EU.</dd>
          <dt>Our payment provider</dt>
          <dd>
            Billing name, email and payment instrument. Independent controller.
          </dd>
          <dt>Our accountant</dt>
          <dd>
            Invoices and billing records. Processor or independent controller.
            Bangladesh.
          </dd>
          <dt>Professional advisers and insurers</dt>
          <dd>
            Only what a specific matter requires. Independent controllers.
          </dd>
          <dt>Law enforcement, courts and regulators</dt>
          <dd>
            Only what is legally compelled. Independent controllers.
          </dd>
        </dl>
        <p>
          We may also disclose data in connection with a merger, acquisition or
          sale of assets, in which case we will give notice before your data
          becomes subject to a different policy.
        </p>
        <p>
          <strong>
            We do not share personal data for cross-context behavioural
            advertising, and we do not permit our processors to use it for their
            own marketing.
          </strong>
        </p>
      </>
    ),
  },

  {
    id: "international-transfers",
    title: "International transfers",
    body: (
      <>
        <p>
          We are established in <strong>Bangladesh</strong>. If you are in the
          EEA, the UK or Switzerland, your personal data will be transferred
          outside your home territory when you deal with us.
        </p>
        <p>
          Bangladesh is <strong>not</strong> the subject of an adequacy decision by
          the European Commission or the UK Government. Transfers therefore rely on
          appropriate safeguards.
        </p>
        <dl>
          <dt>You to us</dt>
          <dd>
            Standard Contractual Clauses (Commission Implementing Decision (EU)
            2021/914), plus the UK International Data Transfer Addendum for UK
            data.
          </dd>
          <dt>Us to our processors</dt>
          <dd>
            Standard Contractual Clauses in each processor agreement, or the
            processor&rsquo;s own certified transfer mechanism.
          </dd>
          <dt>Occasional transfers needed to perform your contract</dt>
          <dd>
            The Article 49(1)(b) derogation, used only where it genuinely applies.
          </dd>
        </dl>
        {/*
          "encryption at rest for stored records" was dropped here as well as in
          Security. It was the same unverifiable blanket claim in both places,
          and leaving it in one of them would have made the removal cosmetic.
        */}
        <p>
          Our supplementary measures include encryption in transit (TLS) for all
          communications, access limited to the individuals working on your
          project, and a commitment to challenge any government access request
          that appears unlawful and to notify you unless legally prohibited.
        </p>
        <p>
          You may request a copy of our Standard Contractual Clauses, with
          commercial terms redacted, from{" "}
          <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>.
        </p>
      </>
    ),
  },

  {
    id: "how-long-we-keep-data",
    title: "How long we keep data",
    body: (
      <>
        <dl>
          <dt>Website server logs</dt>
          <dd>30 days. Security and diagnostics.</dd>
          <dt>Analytics data</dt>
          <dd>14 months. The GA4 default, kept short deliberately.</dd>
          <dt>
            Campaign parameters in <code>sessionStorage</code>
          </dt>
          <dd>Until you close the tab. Attribution only.</dd>
          <dt>An enquiry that does not become a project</dt>
          <dd>12 months from last contact, so we recognise you if you return.</dd>
          <dt>Prospect data, no response</dt>
          <dd>6 months.</dd>
          <dt>Prospect data, declined or opted out</dt>
          <dd>30 days, except the suppression record.</dd>
          <dt>Suppression list</dt>
          <dd>Indefinite, so we never contact you again.</dd>
          <dt>Client project files and correspondence</dt>
          <dd>3 years after the project ends. Support, warranty and dispute defence.</dd>
          <dt>Contracts</dt>
          <dd>6 years after the contract ends. Limitation periods.</dd>
          <dt>Invoices, accounting and tax records</dt>
          <dd>6 years. Legal obligation.</dd>
          <dt>Backups</dt>
          <dd>Rolling 30 days. Backups are overwritten, not individually edited.</dd>
        </dl>
        <p>
          When a retention period ends we delete the data or irreversibly
          anonymise it. If deletion from a backup is not technically possible, we
          isolate the data and delete it on the next backup cycle.
        </p>
      </>
    ),
  },

  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          If you are in the EEA or the UK, the GDPR or UK GDPR gives you the rights
          below.{" "}
          <strong>
            We extend these same rights to everyone we deal with, wherever you
            live.
          </strong>{" "}
          It is simpler than running two standards, and it is the right way to
          behave.
        </p>
        <dl>
          <dt>Access</dt>
          <dd>
            Get confirmation of whether we hold data about you, and a copy of it.
          </dd>
          <dt>Rectification</dt>
          <dd>Have inaccurate data corrected, and incomplete data completed.</dd>
          <dt>Erasure</dt>
          <dd>
            Have your data deleted, where no legal obligation requires us to keep
            it.
          </dd>
          <dt>Restriction</dt>
          <dd>
            Have us pause processing while a dispute about accuracy or legitimate
            interests is resolved.
          </dd>
          <dt>Portability</dt>
          <dd>
            Receive data you gave us in a structured, machine-readable format,
            where processing is based on consent or contract and is automated.
          </dd>
          <dt>Object</dt>
          <dd>
            Object to processing based on legitimate interests.{" "}
            <strong>
              For direct marketing this right is absolute and we will always
              comply.
            </strong>
          </dd>
          <dt>Withdraw consent</dt>
          <dd>At any time, as easily as you gave it.</dd>
          <dt>Not be subject to automated decisions</dt>
          <dd>
            We do not make decisions with legal or similarly significant effects by
            automated means.
          </dd>
          <dt>Complain</dt>
          <dd>Lodge a complaint with a supervisory authority. See Complaints.</dd>
        </dl>

        <h3>How to exercise a right</h3>
        <p>
          Email <a href="mailto:hello@midnightux.com">hello@midnightux.com</a> and
          tell us what you want. You do not need to use a form or particular
          wording.
        </p>
        <p>
          We may ask you to confirm your identity, but only proportionately. For a
          request about an email address, replying from that address is usually
          enough. We will not demand identity documents where a lesser check will
          do.
        </p>
        <p>
          <strong>Our deadlines.</strong> One month under the GDPR and UK GDPR,
          extendable by two further months for complex requests, in which case we
          will tell you within the first month and explain why. 45 days under US
          state laws, extendable by a further 45 days.
        </p>
        <p>
          <strong>Our fee.</strong> None. We may charge a reasonable fee, or
          refuse, only where a request is manifestly unfounded or excessive, and we
          will explain our reasoning and your right to complain if we ever do.
        </p>
      </>
    ),
  },

  {
    id: "us-state-rights",
    title: "Rights in California and other US states",
    body: (
      <>
        <p>
          We honour the following for residents of California, Colorado,
          Connecticut, Virginia, Utah, Texas, Oregon and every other US state with
          a comprehensive privacy law.
        </p>
        <ul>
          <li>
            <strong>Right to know</strong> what personal information we collect,
            the sources, the purposes and the categories of recipient. This policy
            is that disclosure.
          </li>
          <li>
            <strong>Right to delete</strong> personal information we hold about
            you.
          </li>
          <li>
            <strong>Right to correct</strong> inaccurate personal information.
          </li>
          <li>
            <strong>Right to opt out of sale or sharing.</strong> We do not sell
            personal information and we do not share it for cross-context
            behavioural advertising, so there is nothing to opt out of.{" "}
            <strong>
              We have not sold or shared personal information in the preceding 12
              months
            </strong>
            , including the personal information of minors under 16.
          </li>
          <li>
            <strong>Right to limit use of sensitive personal information.</strong>{" "}
            We do not collect sensitive personal information as defined by the
            CPRA.
          </li>
          <li>
            <strong>Right to non-discrimination.</strong> We will never charge you
            more, give you less, or refuse to work with you because you exercised a
            privacy right.
          </li>
          <li>
            <strong>Authorised agents</strong> may submit requests on your behalf
            with written proof of authorisation.
          </li>
        </ul>
        <p>
          <strong>Categories collected in the last 12 months</strong>, in CCPA
          terminology: identifiers (name, email, IP address), commercial
          information (services enquired about and purchased), internet activity
          (pages viewed, referral source), and professional or employment
          information (job title, employer) for business contacts. We collect these
          for the purposes stated above, and retain them per How long we keep data.
        </p>
        <p>
          <strong>Global Privacy Control.</strong> We honour the GPC browser signal
          as a valid opt-out request where our analytics are in use.
        </p>
      </>
    ),
  },

  {
    id: "cookies-and-analytics",
    title: "Cookies, analytics and tracking",
    body: (
      <>
        <h3>What we actually set</h3>
        <dl>
          <dt>
            <code>ms_campaign</code>
          </dt>
          <dd>
            <code>sessionStorage</code>, not a cookie. First-touch campaign
            attribution, cleared when the tab closes.
          </dd>
          <dt>Scroll position</dt>
          <dd>
            <code>sessionStorage</code>. Returns you to your place on reload.
            Strictly necessary for the interface to work.
          </dd>
          <dt>
            <code>ms_consent</code>
          </dt>
          <dd>
            <code>localStorage</code>, not a cookie. Holds one word, your answer
            to the analytics banner, so we do not ask again on every visit. It
            is the one thing here that survives closing the tab, because a
            consent decision that expires with the session means being asked
            over and over, which is its own kind of pressure.
          </dd>
          <dt>Google Analytics 4</dt>
          <dd>
            Cookies and local storage, to understand how the site is used.{" "}
            <strong>Requires your consent.</strong>
          </dd>
        </dl>

        <h3>Consent</h3>
        <p>
          We use <strong>Google Consent Mode v2</strong>. Denied by default:{" "}
          <code>analytics_storage</code>, <code>ad_storage</code>,{" "}
          <code>ad_user_data</code> and <code>ad_personalization</code>.
          Analytics runs cookieless, or does not run at all, until you grant
          consent on the banner. <code>functionality_storage</code> and{" "}
          <code>security_storage</code> are granted, because the site cannot
          function or stay secure without them.
        </p>
        <p>
          The three advertising signals stay denied whatever you choose, because
          we run no advertising tags at all. Accepting the banner grants exactly
          one thing, <code>analytics_storage</code>, and nothing else.
        </p>
        <p>
          Third-party embeds, in particular the <strong>Cal.com</strong> booking
          calendar, may set their own storage when the booking step loads. That
          embed only loads after you open the booking dialog and reach step two,
          which is an action you take deliberately.
        </p>

        <h3>Your controls</h3>
        <ul>
          <li>
            <strong>Cookie settings</strong>, in the footer of every page,
            reopens the same two-button banner. Withdrawing is the same click as
            granting.
          </li>
          <li>Browser settings let you block or delete cookies and clear local storage.</li>
          <li>
            The Google Analytics opt-out browser add-on is at{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              tools.google.com/dlpage/gaoptout
            </a>
            .
          </li>
          <li>We honour the Global Privacy Control signal.</li>
          <li>
            We do not respond to legacy &ldquo;Do Not Track&rdquo; headers, which
            have no agreed meaning.
          </li>
        </ul>
      </>
    ),
  },

  {
    id: "security",
    title: "Security",
    body: (
      <>
        <p>Our measures include:</p>
        <ul>
          <li>
            <strong>TLS</strong> for all traffic to and from the site, and for
            SMTP.
          </li>
          <li>
            <strong>HMAC-SHA256 signature verification</strong> on the Cal.com
            booking webhook, using a constant-time comparison, so that no one can
            forge a booking event.
          </li>
          <li>
            <strong>Secrets held only in environment variables</strong>, never in
            the repository, with server-only modules enforced at build time so
            credential-reading code can never be bundled into the browser.
          </li>
          <li>
            <strong>Least privilege.</strong> Access to client systems is limited
            to the people working on the project, and is handed back or revoked at
            project end.
          </li>
          <li>
            <strong>Multi-factor authentication</strong> on our email, hosting,
            repository and registrar accounts.
          </li>
        </ul>
        {/*
          TWO BULLETS WERE REMOVED FROM THIS LIST, and they should only come
          back alongside the thing that makes them true.

          "Encryption at rest for stored records" was a blanket claim with no
          store behind it. There is no database in this project; records live in
          Gmail, in Cal.com and on two laptops. Google encrypts its side, the
          laptops encrypt only if full-disk encryption is switched on, and the
          sentence covered all three without evidence for the last.

          "Dependency and vulnerability monitoring on the codebase" was simply
          false. There is no .github directory, no Dependabot or Renovate
          config and no CI in this repository, so nothing is watching. Adding a
          .github/dependabot.yml would take minutes and would earn the bullet
          back; until then the claim is worse than its absence, because a
          security section is exactly where a reader is entitled to assume every
          line was checked.
        */}
        <p>
          No system is perfectly secure and we do not claim otherwise. If a
          personal data breach occurs and it is likely to result in a risk to your
          rights and freedoms, we will notify the relevant supervisory authority{" "}
          <strong>within 72 hours</strong> of becoming aware of it, and we will
          notify you directly and without undue delay where the risk is high. Where
          we act as a processor for a client, we will notify that client without
          undue delay so they can meet their own deadline.
        </p>
        <blockquote>
          <p>
            <strong>
              Please do not send us passwords, card numbers, government identifiers
              or health information by email.
            </strong>{" "}
            If we need credentials from you, we will ask you to share them through
            a secure channel.
          </p>
        </blockquote>
      </>
    ),
  },

  {
    id: "children",
    title: "Children",
    body: (
      <>
        <p>
          Our services are for businesses. This site is not directed at children,
          we do not knowingly collect personal data from anyone under{" "}
          <strong>16</strong>, and we have no features intended to appeal to
          children.
        </p>
        <p>
          If you believe a child has given us personal data, contact{" "}
          <a href="mailto:hello@midnightux.com">hello@midnightux.com</a> and we
          will delete it promptly. We do not knowingly sell or share the personal
          information of anyone under 16, and as stated above we do not sell or
          share personal information at all.
        </p>
      </>
    ),
  },

  {
    id: "ai-and-automated-decisions",
    title: "Automated decisions and AI",
    body: (
      <>
        <p>
          <strong>
            We do not make decisions producing legal or similarly significant
            effects about you by solely automated means.
          </strong>{" "}
          A person reads every enquiry and decides every engagement.
        </p>
        <p>We use AI tools in two distinct ways, and we keep them separate.</p>
        <ol>
          <li>
            <strong>In our own work.</strong> We may use AI assistants to help
            write code, draft copy or summarise notes. Where a tool would process
            personal data belonging to you or your customers, we use business or
            enterprise tiers configured so that inputs are{" "}
            <strong>not used to train the provider&rsquo;s models</strong>, and we
            tell you if a specific tool is needed for your project.
          </li>
          <li>
            <strong>In what we build for clients.</strong> Where you ask us to
            integrate AI features into your website, the resulting processing is{" "}
            <strong>yours as controller</strong>, not ours. We will document the
            provider, the data flows and the retention in the project handover so
            that you can describe it accurately in your own privacy policy. See the
            Terms of Service for the associated disclaimers.
          </li>
        </ol>
        <p>
          We do not use your personal data, your project content, or prospect data
          to train any AI model of our own.
        </p>
      </>
    ),
  },

  {
    id: "acting-for-clients",
    title: "When we act for our clients",
    body: (
      <>
        <p>
          When we build or maintain a website, we may process personal data
          belonging to your customers, staff or site visitors. In that relationship{" "}
          <strong>you are the controller and we are the processor</strong>. We
          will:
        </p>
        <ul>
          <li>Process that data only on your documented instructions.</li>
          <li>Impose confidentiality obligations on everyone we let near it.</li>
          <li>Apply the security measures set out above.</li>
          <li>
            Not engage a sub-processor without your prior general or specific
            authorisation, and give you notice of intended changes so you can
            object.
          </li>
          <li>
            Assist you with data subject requests, breach notification, DPIAs and
            prior consultation, so far as we reasonably can.
          </li>
          <li>Delete or return the data at the end of the engagement, at your choice.</li>
          <li>
            Make available the information you need to demonstrate compliance, and
            allow audits on reasonable notice.
          </li>
        </ul>
        <blockquote>
          <p>
            This policy is a notice, not a contract. Where the personal data
            concerned relates to individuals in the EEA or the UK, these
            commitments will be captured in a signed{" "}
            <strong>Data Processing Agreement</strong> meeting Article 28(3), with
            Standard Contractual Clauses attached for the transfer to Bangladesh.
            Ask for one and we will put it in place before the work starts.
          </p>
        </blockquote>
      </>
    ),
  },

  {
    id: "complaints",
    title: "Complaints",
    body: (
      <>
        <p>
          Please raise it with us first at{" "}
          <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>. We would
          rather fix it than have you go elsewhere, and we will respond
          substantively.
        </p>
        <p>You always have the right to go straight to a regulator.</p>
        {/*
          The EEA and UK entries each used to end "You may also contact our EU /
          UK representative." No Article 27 representative has been appointed in
          either territory, so both sentences pointed a complainant at a person
          who does not exist. Restore them only when an appointment is actually
          in place, with the representative's name and address alongside.
        */}
        <dl>
          <dt>EEA</dt>
          <dd>
            The supervisory authority in your country of residence, place of work,
            or where the issue arose. The list is at{" "}
            <a
              href="https://edpb.europa.eu/about-edpb/board/members_en"
              target="_blank"
              rel="noopener noreferrer"
            >
              edpb.europa.eu
            </a>
            .
          </dd>
          <dt>United Kingdom</dt>
          <dd>
            The Information Commissioner&rsquo;s Office,{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">
              ico.org.uk
            </a>
            , helpline 0303 123 1113.
          </dd>
          <dt>California</dt>
          <dd>
            The California Privacy Protection Agency,{" "}
            <a href="https://cppa.ca.gov" target="_blank" rel="noopener noreferrer">
              cppa.ca.gov
            </a>
            , and the California Attorney General.
          </dd>
          <dt>Other US states</dt>
          <dd>Your State Attorney General.</dd>
          <dt>Canada</dt>
          <dd>
            The Office of the Privacy Commissioner,{" "}
            <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer">
              priv.gc.ca
            </a>
            .
          </dd>
          <dt>Australia</dt>
          <dd>
            The Office of the Australian Information Commissioner,{" "}
            <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">
              oaic.gov.au
            </a>
            .
          </dd>
        </dl>
      </>
    ),
  },

  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We will update this policy when our practices change. The &ldquo;Last
          updated&rdquo; date at the top always reflects the current version.
        </p>
        <p>
          For <strong>material</strong> changes, meaning changes to what we
          collect, why we collect it, who we share it with, or your rights, we will
          give <strong>30 days&rsquo; notice</strong> by email to clients and to
          anyone who has given us their address, and by a prominent notice on the
          site. Where a change requires your consent, we will ask for it rather
          than assume it.
        </p>
        <p>
          Previous versions are available on request from{" "}
          <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>.
        </p>
      </>
    ),
  },
];
