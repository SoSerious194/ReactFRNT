import React from "react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Terms and Conditions
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 mb-4">
                By accessing and using PTFlow ("the Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-700 mb-4">
                PTFlow is a fitness coaching platform that provides personalized
                workout plans, nutrition guidance, progress tracking, and
                communication tools between fitness coaches and clients. Our
                services include web and mobile applications, AI-powered
                recommendations, and subscription-based content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Accounts
              </h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.1 Account Creation
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  You must provide accurate and complete information when
                  creating an account
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account credentials
                </li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person or entity may not maintain multiple accounts</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.2 Account Security
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  You are responsible for all activities that occur under your
                  account
                </li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
                <li>
                  We are not liable for any loss arising from unauthorized use
                  of your account
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Subscription and Payment
              </h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.1 Subscription Plans
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  We offer various subscription plans with different features
                  and pricing
                </li>
                <li>Subscription fees are billed monthly in advance</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We may change subscription prices with 30 days' notice</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.2 Payment Terms
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Payment is due in advance for each billing period</li>
                <li>Failed payments may result in service suspension</li>
                <li>
                  You authorize us to charge your payment method automatically
                </li>
                <li>All prices are in USD unless otherwise specified</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.3 Cancellation
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You may cancel your subscription at any time</li>
                <li>
                  Cancellation takes effect at the end of the current billing
                  period
                </li>
                <li>No refunds for partial billing periods</li>
                <li>Access to paid features ends upon cancellation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Acceptable Use
              </h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.1 Permitted Uses
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  Use the service for personal fitness and health purposes
                </li>
                <li>Follow workout plans and nutrition guidance as intended</li>
                <li>Communicate respectfully with coaches and other users</li>
                <li>Provide accurate health and fitness information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.2 Prohibited Uses
              </h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Share your account credentials with others</li>
                <li>
                  Use the service for commercial purposes without permission
                </li>
                <li>Upload malicious software or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to reverse engineer or hack the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Health and Safety Disclaimer
              </h2>
              <p className="text-gray-700 mb-4">
                <strong>IMPORTANT:</strong> PTFlow provides fitness and
                nutrition information for educational purposes only. This
                information is not intended as medical advice, diagnosis, or
                treatment. Always consult with a qualified healthcare
                professional before starting any exercise program or making
                significant dietary changes.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  You assume all risks associated with using our fitness
                  programs
                </li>
                <li>
                  We are not responsible for any injuries or health issues
                </li>
                <li>
                  Stop exercising immediately if you experience pain or
                  discomfort
                </li>
                <li>Seek medical attention for any health concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-gray-700 mb-4">
                The service and its original content, features, and
                functionality are owned by PTFlow and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  You may not copy, modify, or distribute our content without
                  permission
                </li>
                <li>User-generated content remains your property</li>
                <li>
                  You grant us a license to use your content to provide the
                  service
                </li>
                <li>We respect third-party intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of the service, to
                understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Service Availability
              </h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>
                  We strive to maintain high service availability but cannot
                  guarantee 100% uptime
                </li>
                <li>
                  We may perform maintenance that temporarily affects service
                  availability
                </li>
                <li>We are not liable for service interruptions or downtime</li>
                <li>
                  We may modify or discontinue features with reasonable notice
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-4">
                To the maximum extent permitted by law, PTFlow shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from
                your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Indemnification
              </h2>
              <p className="text-gray-700 mb-4">
                You agree to defend, indemnify, and hold harmless PTFlow and its
                officers, directors, employees, and agents from and against any
                claims, damages, obligations, losses, liabilities, costs, or
                debt, and expenses (including attorney's fees).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Termination
              </h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and access to the
                service immediately, without prior notice or liability, for any
                reason whatsoever, including without limitation if you breach
                the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Governing Law
              </h2>
              <p className="text-gray-700 mb-4">
                These Terms shall be interpreted and governed by the laws of
                [Your Jurisdiction], without regard to its conflict of law
                provisions. Our failure to enforce any right or provision of
                these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Changes to Terms
              </h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will try to provide at least 30 days' notice prior to any new
                terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Contact Information
              </h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions,
                please contact us at:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@ptflow.com
                  <br />
                  <strong>Address:</strong> PTFlow Legal Team
                  <br />
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
