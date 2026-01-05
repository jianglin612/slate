import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-slate-400 text-sm mb-8">Last updated: January 5, 2025</p>

          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                When you use Slate, we collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Account information (name, email address) from your Google or Microsoft account</li>
                <li>Email metadata (subject, sender, date) for task extraction</li>
                <li>Calendar event information (title, time, attendees) for task extraction</li>
                <li>Tasks and reports you create within the application</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Provide, maintain, and improve our services</li>
                <li>Extract and suggest tasks from your emails and calendar</li>
                <li>Generate reports and summaries of your work</li>
                <li>Send you updates and notifications about your reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
              <p className="text-slate-400">
                We do not sell, trade, or otherwise transfer your personal information to third parties.
                We may share information with trusted third-party service providers who assist us in
                operating our application (such as AI processing for task extraction), subject to
                confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
              <p className="text-slate-400">
                We implement appropriate security measures to protect your personal information.
                All data is encrypted in transit using TLS and OAuth tokens are encrypted at rest.
                However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
              <p className="text-slate-400">
                You can access, update, or delete your account information at any time through the
                Settings page. You can also disconnect your Google or Microsoft account to stop
                data syncing. To delete your account entirely, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
              <p className="text-slate-400">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@fromslate.com" className="text-blue-400 hover:text-blue-300">
                  privacy@fromslate.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
