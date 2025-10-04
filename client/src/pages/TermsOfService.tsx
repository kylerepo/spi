
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/attached_assets/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png)',
          filter: 'blur(2px)',
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Content Container */}
      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        <div className="bg-black/70 rounded-2xl border-2 border-pink-500/60 shadow-lg shadow-pink-500/20 backdrop-blur-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-bold mb-3"
              style={{ 
                background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
              }}
            >
              Terms of Service
            </h1>
            <div 
              className="w-16 h-1 mx-auto rounded-full mb-4"
              style={{
                background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
                boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
              }}
            />
            <p className="text-white/80">Effective Date: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-6 text-white/90">
            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By creating an account or using SPICE ("we," "us," "our," or the "Service"), you ("you" or "user") agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, you may not access or use our Service. These Terms constitute a legally binding agreement between you and SPICE.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">2. Eligibility and Age Requirements</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>Age Verification:</strong> You must be at least 18 years of age to create an account or use this Service. 
                  By using SPICE, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.
                </p>
                <p className="leading-relaxed">
                  <strong>Adult Content:</strong> This platform contains adult content and is designed exclusively for consenting adults seeking lifestyle connections. 
                  We may require age verification documentation at our discretion.
                </p>
                <p className="leading-relaxed">
                  <strong>Prohibited Users:</strong> You may not use this Service if you are a registered sex offender or have been convicted of any crime involving violence, 
                  sexual misconduct, or crimes against minors.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">3. Account Registration and Security</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>Account Information:</strong> You agree to provide accurate, current, and complete information during registration and to update such information 
                  to keep it accurate, current, and complete.
                </p>
                <p className="leading-relaxed">
                  <strong>Account Security:</strong> You are responsible for safeguarding your password and all activities that occur under your account. 
                  You agree to notify us immediately of any unauthorized use of your account.
                </p>
                <p className="leading-relaxed">
                  <strong>One Account Per Person:</strong> You may only maintain one account at a time. Creating multiple accounts may result in suspension of all accounts.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">4. User Conduct and Prohibited Activities</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Service for any unlawful purpose or to solicit illegal activities</li>
                  <li>Harass, abuse, threaten, or intimidate other users</li>
                  <li>Post content that is hateful, discriminatory, or promotes violence</li>
                  <li>Share explicit sexual content without explicit consent from all parties</li>
                  <li>Impersonate any person or entity or misrepresent your identity</li>
                  <li>Use automated scripts, bots, or other automated means to access the Service</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Transmit viruses, malware, or other harmful code</li>
                  <li>Solicit money, goods, or services from other users</li>
                  <li>Use the Service for commercial purposes without our written consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">5. Content and Intellectual Property</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>User Content:</strong> You retain ownership of content you post ("User Content") but grant SPICE a worldwide, non-exclusive, 
                  royalty-free license to use, reproduce, modify, distribute, and display such content in connection with operating the Service.
                </p>
                <p className="leading-relaxed">
                  <strong>Content Standards:</strong> All User Content must comply with our Community Guidelines and applicable laws. 
                  You represent that you have all necessary rights to post your User Content.
                </p>
                <p className="leading-relaxed">
                  <strong>SPICE Property:</strong> The Service, including its design, features, and functionality, is owned by SPICE and protected by copyright, 
                  trademark, and other intellectual property laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">6. Privacy and Data Protection</h2>
              <p className="leading-relaxed">
                Your privacy is important to us. Our collection and use of your information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">7. Premium Services and Payments</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>Subscription Services:</strong> SPICE offers premium subscription services with additional features. 
                  By purchasing a subscription, you agree to pay all fees and charges associated with your selected plan.
                </p>
                <p className="leading-relaxed">
                  <strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date. 
                  You may cancel your subscription at any time through your account settings.
                </p>
                <p className="leading-relaxed">
                  <strong>Refund Policy:</strong> All sales are final. We do not offer refunds except as required by applicable law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">8. Safety and Reporting</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>Personal Safety:</strong> You are solely responsible for your interactions with other users. 
                  We strongly recommend meeting in public places and informing friends or family of your plans.
                </p>
                <p className="leading-relaxed">
                  <strong>Reporting:</strong> If you encounter inappropriate behavior, you can report users through our reporting system. 
                  We investigate all reports and may take action including account suspension or termination.
                </p>
                <p className="leading-relaxed">
                  <strong>Background Checks:</strong> SPICE does not conduct background checks on users. 
                  You are responsible for your own safety and due diligence when meeting others.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">9. Account Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violation of these Terms, 
                illegal activity, or any other reason we deem appropriate. You may also delete your account at any time through account settings. 
                Upon termination, your access to the Service will cease, and we may delete your account information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">10. Disclaimers and Limitation of Liability</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>Service Availability:</strong> The Service is provided "as is" and "as available" without warranties of any kind. 
                  We do not guarantee uninterrupted access or error-free operation.
                </p>
                <p className="leading-relaxed">
                  <strong>User Interactions:</strong> We are not responsible for the conduct of any user or the accuracy of user profiles. 
                  Any interactions, including meetings, are at your own risk.
                </p>
                <p className="leading-relaxed">
                  <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, SPICE shall not be liable for any indirect, 
                  incidental, special, or consequential damages arising out of or relating to your use of the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">11. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless SPICE from and against any claims, damages, losses, and expenses, 
                including legal fees, arising out of or relating to your use of the Service, your User Content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">12. Governing Law and Dispute Resolution</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  <strong>Governing Law:</strong> These Terms are governed by the laws of [State/Country], without regard to conflict of law principles.
                </p>
                <p className="leading-relaxed">
                  <strong>Arbitration:</strong> Any disputes arising out of these Terms shall be resolved through binding arbitration in accordance with 
                  the rules of the American Arbitration Association, except for claims that may be brought in small claims court.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">13. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. 
                Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">14. Contact Information</h2>
              <div className="space-y-2">
                <p className="leading-relaxed">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <p className="leading-relaxed ml-4">
                  Email: legal@spice-app.com<br />
                  Address: [Company Address]<br />
                  Phone: [Company Phone]
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">15. Severability</h2>
              <p className="leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated 
                to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
              </p>
            </section>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.history.back()}
              className="py-4 px-8 bg-gray-900 text-white font-bold text-lg rounded-full border-3 border-pink-500/50 transition-all duration-300 hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/50 animate-glow"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255, 20, 147, 0.5);
            border-color: rgba(255, 20, 147, 0.5);
          }
          50% {
            box-shadow: 0 0 16px rgba(255, 20, 147, 1);
            border-color: rgba(255, 20, 147, 1);
          }
        }

        .animate-glow {
          animation: glow 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
