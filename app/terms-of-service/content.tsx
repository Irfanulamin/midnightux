import type { LegalSection } from "@/components/legal/legal-doc";

/*
 * Terms of Service copy, derived from TERMS_OF_SERVICE.md at the repo root.
 *
 * Same two rules as the privacy policy's content file, for the same reasons:
 * the internal "[LEGAL REVIEW REQUIRED]" and "[DECISION REQUIRED]" blocks are
 * stripped (they are notes to the studio, not terms binding a client), and
 * every value that is not yet decided renders as a <code> chip so it cannot
 * ship unnoticed. The markdown stays the working copy; this is the published
 * one, and the two are kept in step by hand.
 *
 * The chips that remain are the two founders' legal names in section 01. They
 * are the most load-bearing on the page: a contract has to say who is on the
 * other side of it, and "MidnightUX" is a trading name that cannot be sued or
 * sue. Better visibly unfinished than quietly wrong.
 */

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <dl>
          <dt>Name</dt>
          <dd>
            MidnightUX is a trading name, not a registered company. Your
            contract is with <code>founder one, full legal name</code> and{" "}
            <code>founder two, full legal name</code>, trading as MidnightUX,
            who are jointly and personally responsible for it until a company is
            registered and you are told otherwise in writing.
          </dd>
          <dt>Based in</dt>
          <dd>Bangladesh</dd>
          <dt>Email</dt>
          <dd>
            <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>
          </dd>
        </dl>
        <p>
          In these Terms, &ldquo;we&rdquo;, &ldquo;us&rdquo; and &ldquo;our&rdquo;
          mean MidnightUX. &ldquo;You&rdquo; and &ldquo;your&rdquo; mean the
          organisation engaging us, or browsing this site.
        </p>
        <p>
          These Terms govern this website and every design and development project
          we take on. Please read Warranties and liability, and Governing law and
          disputes, carefully. They limit our liability and affect how disputes are
          resolved.
        </p>
      </>
    ),
  },

  {
    id: "agreement",
    title: "Agreement and precedence",
    body: (
      <>
        <p>
          By using this website, booking a call, accepting a proposal, or paying an
          invoice, you agree to these Terms.
        </p>
        <p>
          Where we issue a written <strong>Proposal</strong>,{" "}
          <strong>Quote</strong> or <strong>Statement of Work</strong> for a
          specific project, that document and these Terms form the whole agreement
          between us. If they conflict, the order of precedence is:
        </p>
        <ol>
          <li>A signed agreement between us, if there is one.</li>
          <li>The Proposal, Quote or Statement of Work.</li>
          <li>These Terms.</li>
          <li>
            Any Data Processing Agreement, which prevails over all of the above on
            data protection matters only.
          </li>
        </ol>
        <p>
          Nothing said in a call, an email or a chat message varies these Terms
          unless we confirm it in writing and both of us agree.
        </p>
        <p>
          <strong>
            If you are entering into this agreement on behalf of an organisation
          </strong>
          , you confirm that you have authority to bind that organisation.
        </p>
      </>
    ),
  },

  {
    id: "using-this-website",
    title: "Using this website",
    body: (
      <>
        <p>
          This website is provided for information about our services. You may
          browse it and contact us. You may not:
        </p>
        <ul>
          <li>
            Copy, scrape, mirror or republish its content, design or code, except
            for ordinary browser caching and personal reference.
          </li>
          <li>Attempt to gain unauthorised access to it or any connected system.</li>
          <li>Use it to send unsolicited communications, malware, or anything unlawful.</li>
          <li>Interfere with its operation, or place unreasonable load on it.</li>
          <li>Use automated tools to harvest contact details from it.</li>
        </ul>
        <p>
          All content on this website, including the design, layout, code,
          illustrations, photographs, copy and the MidnightUX name and logo, is
          owned by us or licensed to us and is protected by intellectual property
          law.
        </p>
        <p>
          Case studies and testimonials on this site describe work we have done.
          Nothing on this site is a guarantee of a particular result for you.
        </p>
      </>
    ),
  },

  {
    id: "what-we-do",
    title: "What we do",
    body: (
      <>
        <p>We provide, depending on what you engage us for:</p>
        <ul>
          <li>User interface and website design.</li>
          <li>WordPress website design and build.</li>
          <li>React and Next.js website and application build.</li>
          <li>Full-stack development, including databases and server-side functionality.</li>
          <li>Integration of third-party services and AI features.</li>
          <li>Basic on-page search engine optimisation and performance work.</li>
        </ul>

        <h3>Our two standard packages</h3>
        <dl>
          <dt>Landing Page, $399 one time</dt>
          <dd>
            A single conversion-focused page: design, responsive build, contact
            form, basic SEO and speed optimisation, and two rounds of revisions.
          </dd>
          <dt>Complete Website, $699 one time</dt>
          <dd>
            Everything in the Landing Page, including{" "}
            <strong>two rounds of revisions</strong>, plus the additional pages
            your business needs, for one flat price with no monthly fees.
          </dd>
        </dl>
        <p>Anything not listed in your Proposal is out of scope.</p>
        <p>
          <strong>Not included</strong> in either package unless your Proposal says
          otherwise: domain registration, hosting fees, paid plugins, premium
          fonts, stock photography licences, paid third-party API usage,
          copywriting beyond light editing of what you supply, logo or brand
          identity design, ongoing maintenance, content updates after handover,
          email hosting, and translation.
        </p>
      </>
    ),
  },

  {
    id: "free-draft",
    title: "The free draft",
    body: (
      <>
        <p>
          We offer a <strong>free first draft design</strong> with{" "}
          <strong>$0 upfront</strong> and <strong>no commitment to proceed</strong>
          . This is a genuine offer and we intend to honour it exactly as stated.
          To keep it workable for both of us, here is precisely how it operates.
        </p>

        <h3>What you get</h3>
        <p>
          One draft design concept for the project discussed on our call, prepared
          at our cost, presented to you for review. You are under no obligation to
          proceed, to pay anything, or to give a reason for declining.
        </p>

        <h3>What the free draft is not</h3>
        <ul>
          <li>
            It is not an unlimited design exploration. The free draft is{" "}
            <strong>one concept</strong>. Revisions to it are part of the paid
            engagement.
          </li>
          <li>It is not a deliverable you may use. See below.</li>
          <li>It does not include source files, code, or production assets.</li>
          <li>It is offered once per prospective client, for one project.</li>
        </ul>

        <h3>Ownership of an unpaid draft</h3>
        <blockquote>
          <p>
            <strong>
              Until you accept a Proposal and we are paid in full, we retain all
              intellectual property rights in the draft.
            </strong>{" "}
            You are granted a licence to view and evaluate it, and nothing more.
          </p>
          <p>
            You may not use the draft, or any substantial part of its layout,
            structure, visual design, copy or code, in your own website or in work
            given to another provider. If you do, you agree to pay the package price
            for the work as a licence fee, which is the ordinary price you would
            have paid anyway.
          </p>
        </blockquote>
        <p>
          We are being explicit about this because &ldquo;free draft&rdquo; and
          &ldquo;you own it&rdquo; are different promises, and we do not want anyone
          to discover the difference at an awkward moment.
        </p>

        <h3>When you become committed</h3>
        <p>
          You become committed to pay only when you{" "}
          <strong>accept a Proposal in writing</strong>, which includes replying
          &ldquo;yes&rdquo;, &ldquo;approved&rdquo;, &ldquo;go ahead&rdquo; or
          similar to a Proposal by email.
        </p>
      </>
    ),
  },

  {
    id: "pricing-and-payment",
    title: "Pricing, payment and taxes",
    body: (
      <>
        <h3>Prices</h3>
        <p>
          Prices are in <strong>US dollars</strong> and are one-time fees for the
          scope in your Proposal. There are no monthly fees for the standard
          packages. A price quoted in a Proposal is valid for{" "}
          <strong>30 days</strong>.
        </p>

        <h3>When payment is due</h3>
        <p>
          Because we take <strong>$0 upfront</strong>, our standard terms are:
        </p>
        <dl>
          <dt>Free draft</dt>
          <dd>Nothing.</dd>
          <dt>Proposal accepted, work begins</dt>
          <dd>Nothing.</dd>
          <dt>Work complete and approved by you, before we transfer files or go live</dt>
          <dd>
            <strong>100% of the fee.</strong>
          </dd>
        </dl>
        <p>
          Invoices are payable within <strong>7 days</strong> of issue, and in any
          case before launch or file transfer. We will not withhold a completed
          site for any reason other than non-payment.
        </p>
        {/*
          The clause above already implied this and section 11 already says the
          rights do not move until payment. Neither said where the work
          physically sits in the meantime, which is the part that decides what
          actually happens on the day someone does not pay. Now it says it.
        */}
        <p>
          <strong>
            Until an invoice is paid in full, the work stays on our own
            infrastructure.
          </strong>{" "}
          We build on our hosting or a staging environment we control. Source
          files, code and assets are not transferred to you, pushed to your
          repository, or deployed to your domain until payment clears. You will
          be able to see and review the work throughout, on a link we give you.
          This is how <strong>$0 upfront</strong> is possible at all: we carry
          the whole project on our side until it is paid for.
        </p>
        <p>
          For larger custom projects we may require a deposit or staged payments.
          Where we do, it will be stated in the Proposal before you accept it,
          never introduced afterwards.
        </p>

        <h3>Late payment</h3>
        <p>
          If an invoice is overdue we may, after giving you{" "}
          <strong>7 days&rsquo; written notice</strong>:
        </p>
        <ul>
          <li>
            Charge interest on the outstanding amount at the maximum rate
            permitted by the applicable law.
          </li>
          <li>Suspend work and withhold delivery.</li>
          <li>Recover reasonable costs of collection.</li>
        </ul>

        <h3>Refunds</h3>
        <p>
          Because we take nothing upfront and you approve the work before you pay,
          refunds rarely arise. Where a payment has been made and we have not
          delivered what the Proposal describes, we will first attempt to fix it,
          and if we cannot, we will refund the portion of the fee attributable to
          the undelivered part.
        </p>
        <p>
          <strong>Refunds are not given</strong> for a change of mind after approval
          and delivery, for results that depend on factors outside the work itself
          (traffic, rankings, sales, conversions), or for a decision to move to
          another provider.
        </p>

        <h3>Taxes</h3>
        <p>
          Prices exclude taxes. You are responsible for any VAT, GST, sales tax,
          withholding tax or duty applicable in your own country.
        </p>
        <p>
          If any withholding tax is required by your local law, the amount payable
          to us shall be <strong>grossed up</strong> so that we receive the full
          invoiced sum, unless your Proposal says otherwise. Bank transfer and
          currency conversion charges are yours.
        </p>
      </>
    ),
  },

  {
    id: "businesses-only",
    title: "We sell to businesses only",
    body: (
      <>
        <blockquote>
          <p>
            <strong>
              Our services are offered exclusively to businesses, organisations and
              professionals acting in the course of a trade, business, craft or
              profession. We do not sell to consumers.
            </strong>
          </p>
        </blockquote>
        <p>
          By accepting a Proposal you confirm that you are engaging us for business
          purposes and not as a consumer. This includes sole traders, freelancers,
          partnerships and companies, provided the website is for the business.
        </p>

        <h3>What this means for you</h3>
        <p>Because this is a business-to-business contract:</p>
        <ul>
          <li>
            Consumer distance-selling rules, including the 14-day right of
            withdrawal under the EU Consumer Rights Directive and the UK Consumer
            Contracts Regulations, do not apply.
          </li>
          <li>
            Cancellation is governed by Term and termination, which lets you walk
            away at any point before you accept a Proposal at no cost, and after
            acceptance on payment for work actually completed.
          </li>
          <li>
            The limitations in Warranties and liability apply in full, as they
            lawfully may between businesses.
          </li>
        </ul>

        <h3>If it turns out you are a consumer</h3>
        <p>
          If, despite the above, mandatory consumer protection law in your country
          of residence applies to our contract, then that law prevails to the extent
          of any conflict, and the rest of these Terms continue in force. Nothing
          here is intended to remove a statutory right you cannot lawfully give up.
        </p>
      </>
    ),
  },

  {
    id: "timelines",
    title: "Timelines",
    body: (
      <>
        <p>
          We aim to deliver in <strong>5 to 7 days</strong> from the point you
          approve the design concept. That is a genuine target and we hit it
          routinely. It assumes:
        </p>
        <ul>
          <li>
            You have supplied all content, images, logos, access credentials and
            information we asked for.
          </li>
          <li>
            You respond to questions and review requests within{" "}
            <strong>2 business days</strong>.
          </li>
          <li>The scope has not changed since the Proposal.</li>
          <li>
            No third party we depend on (host, registrar, plugin vendor, API
            provider) is causing a delay.
          </li>
        </ul>
        <p>
          If those assumptions do not hold, the timeline extends by at least the
          length of the delay. Timelines are{" "}
          <strong>targets, not guarantees</strong>, and we are not liable for
          consequences of a missed target except as stated in Warranties and
          liability.
        </p>
        <p>
          <strong>Projects stalled by you.</strong> If we have asked for something
          we need and hear nothing for <strong>30 days</strong>, we may treat the
          project as paused and re-schedule it when you come back. After{" "}
          <strong>90 days</strong> we may close the project and invoice for the work
          done to that point.
        </p>
      </>
    ),
  },

  {
    id: "revisions-and-scope",
    title: "Revisions and scope",
    body: (
      <>
        {/*
          Both packages are named here, not just the Landing Page.
          "Revision allowances for other packages are stated in your Proposal"
          used to be the only thing the Complete Website had to fall back on,
          which left the $699 package with no stated allowance anywhere on the
          site. Section 04 now says two rounds as well, and the two have to
          agree.
        */}
        <h3>Included revisions</h3>
        <p>
          Both standard packages, Landing Page and Complete Website, include{" "}
          <strong>two rounds of revisions</strong>. A &ldquo;round&rdquo; means
          one consolidated set of feedback from you, delivered at once, which we
          then work through. Piecemeal feedback sent across several days counts
          as several rounds, so please gather it up before sending.
        </p>
        <p>
          Revision allowances for custom projects outside the two standard
          packages are stated in your Proposal.
        </p>

        <h3>What counts as a revision, and what counts as new work</h3>
        <dl>
          <dt>Revisions</dt>
          <dd>
            Refinements within the agreed direction: copy edits, colour and spacing
            adjustments, image swaps, layout tweaks.
          </dd>
          <dt>New work</dt>
          <dd>
            Anything that changes the agreed direction or adds to it: a different
            design concept after one is approved, additional pages, new features,
            new integrations, a change of platform, or restructuring after sign-off.
          </dd>
        </dl>
        <p>
          New work is quoted separately and requires your written approval before we
          start it, either at an hourly rate or as a fixed price. You will always
          see the number before we begin, never on the invoice afterwards.
        </p>

        <h3>Approval</h3>
        <p>
          We will ask you to approve the design concept and the final build in
          writing. If you do not respond to an approval request within{" "}
          <strong>7 days</strong> of a reminder, we may treat the deliverable as
          approved so that the project can proceed. We will say so clearly in the
          reminder.
        </p>
      </>
    ),
  },

  {
    id: "what-we-need-from-you",
    title: "What we need from you",
    body: (
      <>
        <p>You agree to:</p>
        <ul>
          <li>Provide content, images, logos and brand assets in usable formats, on time.</li>
          <li>Provide accurate information, and tell us promptly when something changes.</li>
          <li>
            Give us the access we need (hosting, domain, CMS, analytics) and revoke
            it when the project ends if you prefer.
          </li>
          <li>
            Nominate <strong>one person</strong> with authority to give feedback and
            approvals. Consolidated feedback from one voice is the single biggest
            factor in hitting the 5 to 7 day target.
          </li>
          <li>Review deliverables and respond within the timeframes above.</li>
          <li>Pay on time.</li>
        </ul>
        <blockquote>
          <p>
            <strong>
              You warrant that you own, or have permission to use, everything you
              give us
            </strong>
            , including text, images, video, fonts, logos and trademarks, and that
            our use of it in your project will not infringe anyone&rsquo;s rights or
            breach any law. We rely on this warranty, and we do not independently
            verify the provenance of client materials.
          </p>
        </blockquote>
      </>
    ),
  },

  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <>
        <h3>What transfers to you</h3>
        <p>
          <strong>On receipt of payment in full</strong>, we assign to you all
          rights we own in the final deliverables produced specifically for you: the
          page designs, the custom code written for your project, and the layout and
          structure of your site.
        </p>
        <p>
          Until payment is received in full, we retain all rights, and any use of
          the work is unlicensed.
        </p>

        <h3>What does not transfer</h3>
        <p>We retain ownership of:</p>
        <ul>
          <li>
            <strong>Our pre-existing materials</strong>: our internal frameworks,
            component libraries, code patterns, boilerplate, design systems, tooling
            and know-how, whether created before your project or during it.
          </li>
          <li>
            <strong>Anything we develop that is general-purpose</strong> rather than
            specific to you.
          </li>
          <li>
            <strong>Drafts and concepts you did not select</strong>, including the
            free draft if you do not proceed.
          </li>
        </ul>
        <p>
          Where our pre-existing materials are embedded in your deliverables, we
          grant you a <strong>perpetual, worldwide, non-exclusive, royalty-free
          licence</strong> to use, modify and host them{" "}
          <strong>as part of your project</strong>. You may not extract them and use
          them separately, resell them, or license them to third parties as
          standalone components.
        </p>

        <h3>Third-party components</h3>
        <p>
          Open source components, plugins, fonts and stock assets remain owned by
          their respective owners and are licensed to you under their own terms, not
          assigned by us.
        </p>

        <h3>Our right to show the work</h3>
        <p>
          Unless you tell us otherwise in writing, we may display your project in
          our portfolio, on this website, in case studies and in proposals to other
          prospective clients, including screenshots, a description of the work and
          a link to the live site.
        </p>
        <p>
          <strong>You may opt out of this at any time</strong>, before or after
          publication, by emailing{" "}
          <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>, and we will
          remove it within 30 days. If your project is confidential, tell us at the
          start and we will exclude it by default.
        </p>
        <p>
          We may retain a private copy of all work for our records and for defending
          claims.
        </p>

        <h3>Testimonials</h3>
        <p>
          If you give us a testimonial, you grant us permission to publish it with
          your name, role and business name. You may withdraw that permission at any
          time.
        </p>
      </>
    ),
  },

  {
    id: "third-party-services",
    title: "Third-party materials and services",
    body: (
      <>
        <p>
          Your project may rely on third parties: hosting, domain registrars,
          WordPress plugins and themes, npm packages, fonts, stock imagery, payment
          gateways, analytics, email services and AI providers. You should
          understand that:
        </p>
        <ul>
          <li>
            <strong>They are governed by their own terms and their own prices.</strong>{" "}
            We are not a party to those contracts and we do not control them.
          </li>
          <li>
            <strong>Ongoing licence and subscription costs are yours</strong>,
            including premium plugins, premium fonts, stock licences and API usage,
            unless your Proposal says we cover them.
          </li>
          <li>
            <strong>Licences must be maintained.</strong> If you let a font or plugin
            licence lapse, your site may break or you may be infringing. That is
            outside our control.
          </li>
          <li>
            <strong>We are not liable</strong> for a third party changing its API,
            raising its prices, degrading its service, suffering a breach, or
            shutting down.
          </li>
          <li>
            <strong>
              We do not provide hosting, domain registration or email hosting
            </strong>{" "}
            unless expressly agreed. Where we set these up on your behalf,{" "}
            <strong>the accounts should be in your name and you own them.</strong> If
            we hold anything in our name at your request, we will transfer it to you
            on request at any time and at no charge.
          </li>
        </ul>
        <p>
          We will tell you before the project ends which third-party services your
          site depends on, and what they cost you going forward.
        </p>
      </>
    ),
  },

  {
    id: "ai-features",
    title: "AI features",
    body: (
      <>
        <p>
          Where we integrate AI functionality into your project, in addition to the
          third-party terms above:
        </p>
        <ul>
          <li>
            <strong>AI outputs can be wrong.</strong> Large language models produce
            inaccurate, incomplete, biased or fabricated content. They are not
            deterministic, and the same input can produce different outputs.
          </li>
          <li>
            <strong>You are responsible for what your site publishes</strong>,
            including anything an AI feature generates for your users. We strongly
            recommend human review, clear labelling of AI-generated content, and a
            disclaimer on your site.
          </li>
          <li>
            <strong>AI outputs may not be protectable.</strong> In several
            jurisdictions, including the United States, material generated without
            sufficient human authorship may not attract copyright. We make no
            warranty that AI-generated output is original, non-infringing, or ownable
            by you.
          </li>
          <li>
            <strong>Data sent to AI providers leaves your site.</strong> We will tell
            you which provider, what data flows to it, what its retention terms are,
            and whether inputs are used for training, so that you can describe it
            accurately in your own privacy policy. Where you are subject to the GDPR
            or similar law, you are the controller for that processing and you will
            need a lawful basis for it.
          </li>
          <li>
            <strong>Regulation is moving.</strong> Obligations under instruments such
            as the EU AI Act may apply to how you deploy the feature. Assessing that
            for your own use case is your responsibility, and we recommend taking
            advice.
          </li>
          <li>
            <strong>We disclaim liability</strong> for the content, accuracy,
            legality or consequences of AI-generated output, to the fullest extent
            the law allows.
          </li>
        </ul>
        <p>
          We may use AI tools in our own development process. Where those tools would
          process personal data belonging to you or your users, we use configurations
          that prevent that data being used to train the provider&rsquo;s models.
        </p>
      </>
    ),
  },

  {
    id: "warranties-and-liability",
    title: "Warranties and liability",
    body: (
      <>
        <h3>What we do warrant</h3>
        <ul>
          <li>
            We will perform the services with reasonable skill and care, to a
            professional standard.
          </li>
          <li>The deliverables will substantially conform to the Proposal.</li>
          <li>The custom code we write is our original work, or properly licensed.</li>
        </ul>
        <p>
          <strong>Defects.</strong> If the deliverables do not conform to the
          Proposal, tell us within <strong>30 days</strong> of delivery and we will
          fix it at no charge. This is our responsibility and your primary remedy for
          defects.
        </p>

        <h3>What we do not warrant</h3>
        <p>
          To the fullest extent permitted by law, and except as stated above, the
          services and deliverables are provided <strong>&ldquo;as is&rdquo;</strong>
          , and we exclude all implied warranties including merchantability, fitness
          for a particular purpose and non-infringement.
        </p>
        <p>In particular, we do not guarantee:</p>
        <ul>
          <li>
            Any search engine ranking, position, or amount of traffic. SEO depends on
            competition and on search engine algorithms that no one controls. Basic
            on-page optimisation is included. Results are not promised.
          </li>
          <li>Any level of sales, leads, conversions, revenue or business outcome.</li>
          <li>
            Uninterrupted or error-free operation, which depends on your hosting and
            on third parties.
          </li>
          <li>
            Compatibility with every browser, device or assistive technology, beyond
            the current versions of mainstream browsers.
          </li>
          <li>That the site will remain compliant with laws that change after delivery.</li>
          <li>That third-party services will remain available or unchanged.</li>
          <li>
            <strong>Legal compliance of your website&rsquo;s content or operation.</strong>{" "}
            We can implement a cookie banner, an accessibility pass or a privacy
            policy page if you ask, but we are not lawyers, and whether your site
            complies with the GDPR, the ADA, WCAG, the EU Accessibility Act or any
            other law is a legal question for your own advisers.
          </li>
        </ul>

        <h3>Limitation of liability</h3>
        <blockquote>
          <p>
            <strong>
              Nothing in these Terms limits liability for death or personal injury
              caused by negligence, for fraud or fraudulent misrepresentation, or for
              anything else that cannot lawfully be limited.
            </strong>
          </p>
        </blockquote>
        <p>Subject to that:</p>
        <ul>
          <li>
            <strong>Neither party is liable for indirect or consequential loss</strong>
            , or for loss of profit, revenue, business, goodwill, anticipated savings,
            or data, however arising.
          </li>
          <li>
            <strong>Our total aggregate liability</strong> arising out of or in
            connection with the agreement, whether in contract, tort (including
            negligence), breach of statutory duty or otherwise,{" "}
            <strong>
              is limited to the total fees you have paid us for the project giving
              rise to the claim.
            </strong>
          </li>
          <li>
            <strong>We are not liable for loss of data.</strong> Keeping backups of
            your content and your site is your responsibility, and we recommend an
            independent backup you control.
          </li>
          <li>
            <strong>Any claim must be brought within 12 months</strong> of the date
            you became aware, or reasonably should have become aware, of the
            circumstances giving rise to it.
          </li>
        </ul>
      </>
    ),
  },

  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <>
        <p>
          You will indemnify us against any claim, loss, liability, damage, cost or
          expense (including reasonable legal fees) arising from:
        </p>
        <ul>
          <li>
            Content, materials, images, fonts, trademarks or data you supplied,
            including any claim that they infringe a third party&rsquo;s rights.
          </li>
          <li>
            Your use of the deliverables after delivery, including any modification
            you or a third party makes.
          </li>
          <li>Your breach of these Terms, or of any law.</li>
          <li>
            Any claim by a user of your website relating to your own privacy
            practices, your terms, or your handling of their data.
          </li>
        </ul>
        <p>
          We will indemnify you against any third-party claim that the{" "}
          <strong>custom code we originally wrote for you</strong> infringes that
          party&rsquo;s intellectual property rights, provided you notify us
          promptly, let us control the defence, and do not settle without our
          consent. This indemnity does not cover third-party components, your own
          materials, or anything modified after delivery, and it is subject to the
          liability cap above.
        </p>
      </>
    ),
  },

  {
    id: "confidentiality",
    title: "Confidentiality",
    body: (
      <>
        <p>
          Each of us may receive information from the other that is confidential.
          Each of us agrees to keep it confidential, to use it only for the project,
          and to protect it with at least reasonable care.
        </p>
        <p>
          This does not apply to information that is public through no fault of the
          receiving party, was already known without a duty of confidence, is
          independently developed, or must be disclosed by law. In the last case we
          will tell you first where we lawfully can.
        </p>
        <p>
          These obligations continue for <strong>3 years</strong> after the project
          ends, and indefinitely for anything that is a trade secret.
        </p>
        <p>We will sign your own NDA if you prefer. Send it before the project starts.</p>
      </>
    ),
  },

  {
    id: "data-protection",
    title: "Data protection",
    body: (
      <>
        <p>
          Where we process personal data on your behalf as part of the services,{" "}
          <strong>you are the controller and we are the processor</strong>. Our
          commitments are set out in our{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </p>
        <p>
          Where the personal data concerned relates to individuals in the EEA or the
          UK, both of us will enter into a{" "}
          <strong>Data Processing Agreement</strong> meeting Article 28(3) of the
          GDPR, incorporating the <strong>Standard Contractual Clauses</strong> for
          the transfer to Bangladesh. That agreement prevails over these Terms on
          data protection matters.
        </p>
        <p>
          <strong>Each of us is responsible for our own compliance.</strong> We are
          responsible for how we handle data as your processor. You are responsible
          for having a lawful basis for the processing you instruct, for your own
          privacy policy, for your own cookie consent, and for responding to your
          users&rsquo; rights requests. We will help you with the last of those so far
          as we reasonably can.
        </p>
      </>
    ),
  },

  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>We will not build, and we may stop work on, a project that is intended to:</p>
        <ul>
          <li>Break the law, or facilitate breaking it.</li>
          <li>
            Deceive or defraud users, including fake reviews, fabricated
            testimonials, fake scarcity, or dark patterns designed to trick people
            into purchases or subscriptions.
          </li>
          <li>Harvest personal data unlawfully, or send unlawful bulk communications.</li>
          <li>Infringe intellectual property, or impersonate a person or organisation.</li>
          <li>Distribute malware, or facilitate unauthorised access to systems.</li>
          <li>Harass, threaten, or promote hatred or violence against people.</li>
          <li>Publish content that is sexually exploitative, or that endangers children.</li>
        </ul>
        <p>
          We reserve the right to decline or terminate a project on these grounds,
          and to invoice for work completed to that point. This judgement is ours to
          make, and we will explain our reasoning.
        </p>
      </>
    ),
  },

  {
    id: "termination",
    title: "Term and termination",
    body: (
      <>
        <h3>Before you accept a Proposal</h3>
        <p>
          Either of us can walk away at any time, for any reason, with nothing owed.
          That is what &ldquo;$0 upfront and no commitment&rdquo; means.
        </p>

        <h3>After you accept a Proposal</h3>
        <p>
          <strong>You may terminate</strong> at any time on written notice. You pay
          for work completed up to that date, assessed proportionately against the
          Proposal. If nothing substantive has been done, nothing is payable.
        </p>
        <p>
          <strong>We may terminate</strong> if you materially breach these Terms and
          do not fix it within <strong>14 days</strong> of written notice, if you
          fail to pay an overdue invoice, if the project is stalled beyond the
          periods above, if you require work that breaches Acceptable use, or if the
          working relationship has broken down such that we cannot deliver good work.
          In the last case we will give <strong>14 days&rsquo; notice</strong> and
          invoice only for work completed.
        </p>

        <h3>On termination</h3>
        <ul>
          <li>All amounts due become payable.</li>
          <li>
            Rights in deliverables transfer only to the extent paid for. Unpaid work
            remains ours.
          </li>
          <li>
            We will hand over the work completed to date, in a usable format, once
            outstanding amounts are settled.
          </li>
          <li>
            We will return or delete your confidential information and revoke our
            access to your systems, at your choice.
          </li>
        </ul>

        <h3>What survives</h3>
        <p>
          Using this website, Intellectual property, Warranties and liability,
          Indemnity, Confidentiality, Data protection, Governing law, and this
          paragraph survive termination.
        </p>
      </>
    ),
  },

  {
    id: "governing-law",
    title: "Governing law and disputes",
    body: (
      <>
        <p>
          These Terms and any dispute arising out of them are governed by the laws
          of <strong>Bangladesh</strong>, without regard to conflict of law rules.
        </p>

        <h3>Step one, talk</h3>
        <p>
          Before starting formal proceedings, both of us agree to raise the issue in
          writing and to try in good faith to resolve it within{" "}
          <strong>30 days</strong>. Most disputes about creative work are
          misunderstandings about scope, and they resolve at this stage.
        </p>

        <h3>Step two, formal resolution</h3>
        <p>
          If that fails, disputes will be subject to the exclusive jurisdiction of
          the courts of Bangladesh, in the English language.
        </p>

        <h3>Mandatory local law</h3>
        <p>
          We contract with businesses only. If mandatory law in your country
          nonetheless gives you a protection you cannot contract out of, that
          protection prevails to the extent of the conflict and the rest of this
          section stands.
        </p>
      </>
    ),
  },

  {
    id: "general",
    title: "General",
    body: (
      <>
        <dl>
          <dt>Entire agreement</dt>
          <dd>
            These Terms and the Proposal are the whole agreement between us on their
            subject matter, and replace anything discussed beforehand. Neither of us
            relies on any statement not written into them, though nothing excludes
            liability for fraudulent misrepresentation.
          </dd>
          <dt>Severability</dt>
          <dd>
            If any provision is held unenforceable, it is modified to the minimum
            extent necessary to make it enforceable, or severed if it cannot be, and
            the rest continues in force.
          </dd>
          <dt>No waiver</dt>
          <dd>If we do not enforce a right, that is not a waiver of it.</dd>
          <dt>Assignment</dt>
          <dd>
            You may not assign or transfer the agreement without our written consent,
            which we will not unreasonably withhold. We may assign it to a successor
            in connection with a merger or sale of our business, on notice to you.
          </dd>
          <dt>Subcontracting</dt>
          <dd>
            We may use subcontractors or freelancers. We remain responsible to you
            for their work, and we bind them to equivalent confidentiality and data
            protection obligations.
          </dd>
          <dt>Independent contractors</dt>
          <dd>
            We are independent contractors. Nothing creates a partnership, joint
            venture, agency or employment relationship.
          </dd>
          <dt>Force majeure</dt>
          <dd>
            Neither of us is liable for failure or delay caused by events beyond
            reasonable control, including natural disaster, flood, cyclone, fire,
            war, civil unrest, strike, epidemic, government action, nationwide
            internet or power disruption, or failure of a third-party provider.
            Bangladesh experiences seasonal flooding, cyclones and periodic
            disruption to power and connectivity. If such an event lasts more than 30
            days, either of us may terminate and you pay only for work completed.
          </dd>
          <dt>Notices</dt>
          <dd>
            Notices must be in writing and sent by email to{" "}
            <a href="mailto:hello@midnightux.com">hello@midnightux.com</a> and to the
            email address you gave us. Email is sufficient for everything under these
            Terms.
          </dd>
          <dt>No third-party rights</dt>
          <dd>No one other than you and us has any right to enforce these Terms.</dd>
          <dt>Language</dt>
          <dd>
            These Terms are written in English, and English governs their
            interpretation. Any translation is for convenience only.
          </dd>
          <dt>Changes to these Terms</dt>
          <dd>
            The version in force for your project is the version in effect when you
            accepted your Proposal, and we will not change it mid-project. For
            website use, the current version applies, and material changes will be
            flagged on this page with 30 days&rsquo; notice.
          </dd>
        </dl>
      </>
    ),
  },

  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <dl>
          <dt>MidnightUX</dt>
          <dd>Bangladesh</dd>
          <dt>All correspondence</dt>
          <dd>
            <a href="mailto:hello@midnightux.com">hello@midnightux.com</a>
          </dd>
        </dl>
        <p>
          We run a single mailbox. General enquiries, billing questions, privacy and
          rights requests, and formal legal notices all go to the same address, and
          all of them reach us. Please put the topic in the subject line so we can
          route it internally.
        </p>
        <p>
          See also our <a href="/privacy-policy">Privacy Policy</a>.
        </p>
      </>
    ),
  },
];
