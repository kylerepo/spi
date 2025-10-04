import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  HelpCircle,
  Shield,
  MessageCircle,
  AlertTriangle,
  FileText,
  Mail,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'

interface SupportProps {
  onBack: () => void
}

export default function Support({ onBack }: SupportProps) {
  const handleContactSupport = () => {
    window.location.href = 'mailto:support@spice-app.com?subject=SPICE Support Request'
  }

  const handleReportIssue = () => {
    window.location.href = 'mailto:support@spice-app.com?subject=Report Issue - SPICE App'
  }

  const supportSections = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of using SPICE',
      icon: HelpCircle,
      items: [
        'Creating your profile',
        'Setting up preferences',
        'Understanding matching',
        'Safety guidelines'
      ]
    },
    {
      title: 'Safety & Security',
      description: 'Stay safe while exploring connections',
      icon: Shield,
      items: [
        'Reporting users',
        'Blocking and unmatching',
        'Privacy settings',
        'Meeting safely'
      ]
    },
    {
      title: 'Account Management',
      description: 'Managing your SPICE account',
      icon: FileText,
      items: [
        'Updating profile information',
        'Managing photos',
        'Subscription settings',
        'Account deletion'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
            data-testid="button-back-to-profile"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Support</h1>
        <p className="text-white/70 text-sm">Get help and find answers</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card className="bg-black/50 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-pink-500/10"
                onClick={handleContactSupport}
                data-testid="button-contact-support"
              >
                <Mail className="h-4 w-4 mr-3" />
                Contact Support
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-pink-500/10"
                onClick={handleReportIssue}
                data-testid="button-report-issue"
              >
                <AlertTriangle className="h-4 w-4 mr-3" />
                Report an Issue
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-pink-500/10"
                data-testid="button-live-chat"
              >
                <MessageCircle className="h-4 w-4 mr-3" />
                Live Chat (Coming Soon)
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* Help Sections */}
          {supportSections.map((section, index) => (
            <Card key={index} className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <section.icon className="h-5 w-5 mr-2 text-pink-400" />
                  {section.title}
                </CardTitle>
                <p className="text-white/70 text-sm">{section.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white/80 hover:text-white hover:bg-pink-500/10 font-normal"
                        data-testid={`button-help-${section.title.toLowerCase().replace(' ', '-')}-${itemIndex}`}
                      >
                        {item}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                      {itemIndex < section.items.length - 1 && (
                        <Separator className="bg-pink-500/20" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Community Guidelines */}
          <Card className="bg-black/50 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-white/80 space-y-3 text-sm">
                <p>
                  <strong className="text-pink-400">Respect:</strong> Treat all members with kindness and respect. 
                  No harassment, discrimination, or hate speech.
                </p>
                <p>
                  <strong className="text-pink-400">Consent:</strong> Always respect boundaries. 
                  Obtain clear, enthusiastic consent for any interactions.
                </p>
                <p>
                  <strong className="text-pink-400">Authenticity:</strong> Use real, recent photos and accurate profile information. 
                  No catfishing or impersonation.
                </p>
                <p>
                  <strong className="text-pink-400">Privacy:</strong> Respect others' privacy. 
                  Don't share personal information or intimate content without permission.
                </p>
                <p>
                  <strong className="text-pink-400">Safety:</strong> Report any suspicious behavior or violations. 
                  Meet in public places and trust your instincts.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-black/50 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-white/80 text-sm">
                <div>
                  <strong className="text-pink-400">Email Support:</strong><br />
                  support@spice-app.com
                </div>
                <div>
                  <strong className="text-pink-400">Response Time:</strong><br />
                  Within 24 hours (Monday - Friday)
                </div>
                <div>
                  <strong className="text-pink-400">Emergency Safety:</strong><br />
                  For immediate safety concerns, contact local authorities first.
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}