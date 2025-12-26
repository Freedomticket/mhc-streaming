import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-inferno-charcoal">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-purgatorio-mist">Last updated: December 2025</p>
          </div>

          <div className="card-inferno space-y-8">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-300 mb-4">We collect information you provide directly to us, including:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Account information (username, email, password)</li>
                <li>Profile information (display name, bio, avatar)</li>
                <li>Content you upload (videos, music, images)</li>
                <li>Communications and interactions on the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-300 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. Contact Us</h2>
              <p className="text-gray-300">For privacy questions, contact:</p>
              <p className="text-paradiso-gold mt-2">
                <a href="mailto:privacy@mhclicensing.com" className="hover:text-white transition-colors">
                  privacy@mhclicensing.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-purgatorio-mist hover:text-white transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
