
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
              Privacy Policy
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
              <h2 className="text-xl font-semibold text-pink-400 mb-3">1. Introduction</h2>
              <p className="leading-relaxed">
                SPICE ("we," "us," "our," or "Company") respects your privacy and is committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dating and lifestyle platform. 
                By using SPICE, you consent to the data practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">2.1 Information You Provide Directly</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Account Information:</strong> Email address, password, phone number, and age verification</li>
                    <li><strong>Profile Information:</strong> Photos, bio, preferences, lifestyle choices, relationship status</li>
                    <li><strong>Identity Verification:</strong> Government-issued ID or other verification documents</li>
                    <li><strong>Communication Data:</strong> Messages, chat history, video calls, and other interactions</li>
                    <li><strong>Payment Information:</strong> Credit card details, billing address (processed by third-party providers)</li>
                    <li><strong>Customer Support:</strong> Information provided when contacting support</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">2.2 Information Collected Automatically</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Device Information:</strong> IP address, device ID, operating system, browser type</li>
                    <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns</li>
                    <li><strong>Location Data:</strong> GPS coordinates, Wi-Fi access points (if location services enabled)</li>
                    <li><strong>Cookies and Tracking:</strong> Web beacons, pixels, and similar technologies</li>
                    <li><strong>Log Files:</strong> Server logs including access times and error reports</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">2.3 Information from Third Parties</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Social Media Integration:</strong> Profile information from connected social accounts</li>
                    <li><strong>Background Checks:</strong> Criminal background information (if you opt-in)</li>
                    <li><strong>Analytics Providers:</strong> Aggregated usage statistics and trends</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">3. How We Use Your Information</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-pink-300 mb-2">We use your information to:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Provide Services:</strong> Create and maintain your account, facilitate matching and connections</li>
                  <li><strong>Improve Matching:</strong> Use algorithms to suggest compatible users based on preferences and behavior</li>
                  <li><strong>Communication:</strong> Enable messaging, video calls, and other interactive features</li>
                  <li><strong>Safety and Security:</strong> Verify identities, detect fraud, and maintain platform safety</li>
                  <li><strong>Customer Support:</strong> Respond to inquiries, troubleshoot issues, and provide assistance</li>
                  <li><strong>Analytics and Improvement:</strong> Analyze usage patterns to improve our services and develop new features</li>
                  <li><strong>Marketing:</strong> Send promotional materials, product updates, and relevant offers (with consent)</li>
                  <li><strong>Legal Compliance:</strong> Comply with legal obligations and protect our rights</li>
                  <li><strong>Payment Processing:</strong> Process subscription payments and billing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">4.1 With Other Users</h3>
                  <p className="leading-relaxed">
                    Your profile information, photos, and activity status are visible to other users as part of the matching service. 
                    You control what information is displayed through your privacy settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">4.2 With Service Providers</h3>
                  <p className="leading-relaxed">
                    We share information with trusted third-party service providers who assist in operating our platform, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Cloud hosting and data storage providers</li>
                    <li>Payment processors and billing services</li>
                    <li>Customer support and help desk services</li>
                    <li>Analytics and marketing platforms</li>
                    <li>Identity verification services</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">4.3 Legal Requirements</h3>
                  <p className="leading-relaxed">
                    We may disclose your information when required by law, court order, or government request, 
                    or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">4.4 Business Transfers</h3>
                  <p className="leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity, 
                    subject to the same privacy protections.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">5. Data Security and Protection</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Encryption:</strong> Data in transit and at rest is encrypted using AES-256 encryption</li>
                  <li><strong>Access Controls:</strong> Strict employee access controls and background checks</li>
                  <li><strong>Secure Infrastructure:</strong> Regular security audits and penetration testing</li>
                  <li><strong>Monitoring:</strong> 24/7 monitoring for suspicious activity and security threats</li>
                  <li><strong>Data Minimization:</strong> We only collect and retain data necessary for our services</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. 
                  While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">6. Your Privacy Rights and Choices</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">6.1 Account Management</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Access and update your profile information at any time</li>
                    <li>Control photo visibility and profile display settings</li>
                    <li>Manage communication preferences and blocking options</li>
                    <li>Delete your account and associated data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">6.2 Data Subject Rights (GDPR/CCPA)</h3>
                  <p className="leading-relaxed">If applicable, you have the right to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                    <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                    <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                    <li><strong>Restriction:</strong> Limit processing of your personal data</li>
                    <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-pink-300 mb-2">6.3 Marketing Communications</h3>
                  <p className="leading-relaxed">
                    You can opt out of marketing emails by clicking the unsubscribe link or updating your preferences in account settings. 
                    You may still receive transactional emails related to your account and service usage.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">7. Data Retention</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  We retain your information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                  <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days of account deletion</li>
                  <li><strong>Legal Requirements:</strong> Some data retained longer for legal compliance</li>
                  <li><strong>Safety Records:</strong> Reports and safety-related data retained for user protection</li>
                  <li><strong>Backup Systems:</strong> Data may persist in backup systems for up to 90 days</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">8. International Data Transfers</h2>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place, including Standard Contractual Clauses and adequacy decisions, 
                to protect your data in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">9. Cookies and Tracking Technologies</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand usage patterns and improve services</li>
                  <li><strong>Marketing Cookies:</strong> Used for targeted advertising and promotional content</li>
                  <li><strong>Third-Party Cookies:</strong> From integrated services like payment processors</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  You can control cookie settings through your browser preferences, though this may affect functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">10. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. 
                If we learn that we have collected information from a child under 18, we will delete such information immediately. 
                If you believe we have collected information from a child under 18, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">11. Third-Party Links and Services</h2>
              <p className="leading-relaxed">
                Our Service may contain links to third-party websites or integrate with third-party services. 
                This Privacy Policy does not apply to third-party sites or services. We encourage you to review the privacy policies 
                of any third-party sites or services you visit or use.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">12. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. 
                We will notify you of material changes via email or through prominent notice on our Service. 
                Your continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-pink-400 mb-3">13. Contact Information</h2>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-black/50 p-4 rounded-lg ml-4">
                  <p className="leading-relaxed">
                    <strong>Privacy Officer</strong><br />
                    Email: privacy@spice-app.com<br />
                    Address: [Company Address]<br />
                    Phone: [Company Phone]
                  </p>
                </div>
                <p className="leading-relaxed">
                  For data subject rights requests, please include "Privacy Request" in your subject line and provide sufficient information 
                  to verify your identity and locate your account.
                </p>
              </div>
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
