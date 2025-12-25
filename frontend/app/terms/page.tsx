import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold mb-4">
            <span className="text-white">Terms of </span>
            <span className="text-paradiso-gold">Service</span>
          </h1>
          <p className="text-purgatorio-mist text-lg">
            A Piece of Reign Publishing / MHC Streaming
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Effective Date: December 24, 2025</p>
            <p>Last Updated: December 25, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          
          {/* Section 1 */}
          <section className="mb-12">
            <h2 className="text-3xl font-display text-paradiso-gold mb-4">1. ACCEPTANCE OF TERMS</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using any service operated by A Piece of Reign Publishing, including but not limited to MHC Streaming 
              (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these 
              Terms, do not use the Service.
            </p>
          </section>

          {/* Section 2 - USER CONTENT & LIABILITY */}
          <section className="mb-12 border-2 border-paradiso-gold/30 rounded-lg p-8 bg-inferno-charcoal/50">
            <h2 className="text-3xl font-display text-paradiso-gold mb-6">2. USER CONTENT & LIABILITY</h2>
            
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-3">2.1 Ownership & Rights Clearance</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                By uploading any music, artwork, metadata, or other content ("User Content") to the Service, you represent and warrant that:
              </p>
              <div className="ml-4 space-y-3 text-gray-300">
                <p><strong className="text-paradiso-gold">a)</strong> You <strong>100% own or fully control all rights</strong> in the User Content, including:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Sound recordings (master rights)</li>
                  <li>Musical compositions (publishing rights)</li>
                  <li>Artwork and visual materials</li>
                  <li>Samples, loops, and interpolations</li>
                  <li>Performer rights and neighboring rights</li>
                </ul>
                
                <p className="mt-4"><strong className="text-paradiso-gold">b)</strong> You have secured <strong>all necessary licenses, clearances, and permissions</strong> from:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Co-writers and collaborators</li>
                  <li>Sample owners and publishers</li>
                  <li>Featured artists and performers</li>
                  <li>Any third parties whose rights may be implicated</li>
                </ul>
                
                <p className="mt-4"><strong className="text-paradiso-gold">c)</strong> Your User Content does <strong>not infringe any copyright, trademark, publicity, privacy, or other third-party rights</strong>.</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-3">2.2 Platform Liability Disclaimer</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong className="text-paradiso-gold">A Piece of Reign Publishing acts only as a technical platform</strong> and has:
              </p>
              <ul className="list-disc ml-8 space-y-2 text-gray-300">
                <li><strong className="text-red-500">ZERO LIABILITY</strong> for User Content</li>
                <li><strong className="text-red-500">NO OBLIGATION</strong> to pre-screen, verify, or validate rights</li>
                <li><strong className="text-red-500">NO RESPONSIBILITY</strong> for rights clearance or licensing disputes</li>
                <li><strong className="text-red-500">NO DUTY</strong> to monitor or police User Content for infringement</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-3">2.3 User Indemnification</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                You agree to <strong className="text-paradiso-gold">indemnify, defend, and hold harmless</strong> A Piece of Reign Publishing, 
                its owners, officers, directors, employees, contractors, and affiliates from any and all:
              </p>
              <ul className="list-disc ml-8 space-y-1 text-gray-300">
                <li>Claims, demands, or lawsuits</li>
                <li>Damages, losses, or liabilities</li>
                <li>Costs and expenses (including reasonable attorney fees)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">2.4 Content Removal & Account Termination</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                We may, at our sole discretion and without prior notice, <strong className="text-red-500">immediately remove</strong> any 
                User Content or <strong className="text-red-500">terminate your account</strong> if we receive infringement claims or complaints.
              </p>
              <p className="text-red-500 font-semibold">
                No refunds will be provided for removed content or terminated accounts resulting from Terms violations.
              </p>
            </div>
          </section>

          {/* Section 3 - Revenue Sharing */}
          <section className="mb-12">
            <h2 className="text-3xl font-display text-paradiso-gold mb-4">3. LICENSING & REVENUE SHARING</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              For production house licensing subscriptions, revenue is distributed as follows:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="card-inferno">
                <h4 className="text-paradiso-gold font-semibold">Platform Operations (30%)</h4>
                <p className="text-gray-400 text-sm">Infrastructure, servers, bandwidth</p>
              </div>
              <div className="card-inferno">
                <h4 className="text-purgatorio-mist font-semibold">ISM Priority Fund (10%)</h4>
                <p className="text-gray-400 text-sm">Designated elite artists</p>
              </div>
              <div className="card-inferno">
                <h4 className="text-gray-300 font-semibold">Governance Treasury (5%)</h4>
                <p className="text-gray-400 text-sm">DAO community decisions</p>
              </div>
              <div className="card-inferno">
                <h4 className="text-gray-300 font-semibold">AI Development (5%)</h4>
                <p className="text-gray-400 text-sm">Continuous improvements</p>
              </div>
            </div>
            <div className="card-inferno border-2 border-paradiso-gold">
              <h4 className="text-paradiso-gold font-semibold text-xl">General Artist Pool (50%)</h4>
              <p className="text-gray-300">Distributed to all active artists by activity weight</p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-12 bg-inferno-charcoal/50 rounded-lg p-8">
            <h2 className="text-3xl font-display text-paradiso-gold mb-4">Contact Information</h2>
            <div className="text-gray-300 space-y-2">
              <p><strong>A Piece of Reign Publishing</strong></p>
              <p>1812 W Burbank Blvd #433<br />Burbank, CA 91506</p>
              <p className="mt-4">
                <strong className="text-white">Email:</strong> <a href="mailto:info@mhclicensing.com" className="text-paradiso-gold hover:underline">info@mhclicensing.com</a><br />
                <strong className="text-white">DMCA:</strong> <a href="mailto:dmca@mhclicensing.com" className="text-paradiso-gold hover:underline">dmca@mhclicensing.com</a><br />
                <strong className="text-white">Support:</strong> <a href="mailto:support@mhclicensing.com" className="text-paradiso-gold hover:underline">support@mhclicensing.com</a>
              </p>
            </div>
          </section>

          {/* Acceptance Clause */}
          <section className="border-4 border-paradiso-gold rounded-lg p-8 bg-gradient-to-r from-inferno-charcoal to-black">
            <h2 className="text-2xl font-display text-paradiso-gold mb-4 text-center">ACCEPTANCE CLAUSE</h2>
            <p className="text-white text-center text-lg font-semibold leading-relaxed">
              By clicking "Upload," "Register," "I Agree," or by using the Service, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service.
            </p>
          </section>

          {/* Full Terms Link */}
          <div className="mt-12 text-center">
            <Link 
              href="/TERMS_OF_SERVICE.md" 
              target="_blank"
              className="text-paradiso-gold hover:text-white underline text-lg"
            >
              → View Full Terms of Service (PDF)
            </Link>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="btn-inferno inline-block px-8 py-3"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
