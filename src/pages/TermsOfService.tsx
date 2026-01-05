import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
          <p className="text-slate-400 text-sm mb-8">Last updated: January 5, 2025</p>

          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-slate-400">
                By accessing or using Slate, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
              <p className="text-slate-400">
                Slate is an AI-powered task reporting application that helps professionals track
                and report their work by extracting tasks from emails and calendar events.
                The service requires authentication through Google or Microsoft accounts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. User Responsibilities</h2>
              <p className="mb-3 text-slate-400">You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-400">
                <li>Provide accurate account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to access accounts or data belonging to others</li>
                <li>Not interfere with or disrupt the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Intellectual Property</h2>
              <p className="text-slate-400">
                The Slate application, including its design, features, and content, is owned by us
                and protected by intellectual property laws. You retain ownership of any content
                you create using our service, including tasks and reports.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. AI-Generated Content</h2>
              <p className="text-slate-400">
                Slate uses artificial intelligence to extract and suggest tasks from your emails
                and calendar. While we strive for accuracy, AI-generated suggestions may not
                always be accurate or complete. You are responsible for reviewing and verifying
                any information before use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
              <p className="text-slate-400">
                Slate is provided "as is" without warranties of any kind. We are not liable for
                any indirect, incidental, or consequential damages arising from your use of
                the service. Our total liability shall not exceed the amount you paid for
                the service in the past twelve months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Termination</h2>
              <p className="text-slate-400">
                We may suspend or terminate your access to Slate at any time for violations of
                these terms or for any other reason. You may also terminate your account at
                any time through the Settings page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Changes to Terms</h2>
              <p className="text-slate-400">
                We may update these terms from time to time. We will notify you of significant
                changes by posting a notice on our website. Your continued use of Slate after
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Contact Us</h2>
              <p className="text-slate-400">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@fromslate.com" className="text-blue-400 hover:text-blue-300">
                  legal@fromslate.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
