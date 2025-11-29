import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Privacy Policy - Palette',
  description: 'Privacy Policy for Palette Pics AI product photography service.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="relative h-12 w-40">
              <Image 
                src="/logo_16x9.jpeg" 
                alt="Palette" 
                fill 
                sizes="160px"
                className="object-cover object-left"
                priority
              />
            </div>
          </Link>
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-foreground">Back to home</span>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl py-12 md:py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Palette Pics ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your information when you use our AI-powered product photography service 
                ("the Service").
              </p>
              <p>
                By using the Service, you consent to the data practices described in this Privacy Policy. If you do not agree with 
                the practices described in this policy, please do not use the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Information we collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We collect information that you provide directly to us and information that is automatically collected when you use 
                the Service:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account information</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email address</li>
                    <li>Full name (if provided)</li>
                    <li>Profile picture (if using OAuth authentication)</li>
                    <li>Account creation date</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Image data</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Product images you upload to the Service</li>
                    <li>AI-generated images created through the Service</li>
                    <li>Text prompts you provide for image generation</li>
                    <li>Generation history and metadata</li>
                  </ul>
                </div>


                <div>
                  <h4 className="font-semibold mb-2">Usage data</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Number of images generated</li>
                    <li>Date and time of service usage</li>
                    <li>IP address and browser information</li>
                    <li>Device information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. How we use your information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process your image generation requests</li>
                <li>Authenticate your identity and manage your account</li>
                <li>Send you service-related communications (account updates, security alerts)</li>
                <li>Enforce our Terms of Service and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Analyze usage patterns to improve the Service</li>
              </ul>
              <p>
                We do not sell your personal information to third parties. We do not use your uploaded images or generated images 
                for training AI models or for any purpose other than providing the Service to you.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Third-party services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use third-party service providers to help us operate the Service and manage your data. These third parties may collect, 
                process, or store your information in the course of providing their services to us:
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Authentication and data storage providers</h4>
                  <p>
                    We use third-party services for user authentication, database storage, and file storage. Your account information, 
                    uploaded images, and generated images are stored securely by these providers in accordance with their privacy policies 
                    and security standards.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">AI service providers</h4>
                  <p>
                    We use third-party AI services to generate images. When you generate images, your prompts and uploaded images are sent 
                    to these AI service providers for processing. These providers may collect certain information in accordance with their 
                    privacy policies.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Hosting and infrastructure providers</h4>
                  <p>
                    Our Service is hosted on third-party cloud infrastructure. These providers may collect certain technical information 
                    (such as IP addresses) as part of their hosting services, in accordance with their privacy policies.
                  </p>
                </div>
              </div>
              
              <p>
                We require all third-party service providers to maintain appropriate security measures and to use your information only 
                for the purposes of providing services to us. However, we are not responsible for the privacy practices of these third-party 
                services, and we encourage you to review their privacy policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Data storage and security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your data is stored securely using industry-standard security measures:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Private storage:</strong> Your uploaded images and generated images are stored in private, authenticated-access-only buckets</li>
                <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                <li><strong>Access controls:</strong> Only you can access your images through authenticated sessions</li>
                <li><strong>Secure authentication:</strong> We use secure authentication methods (OAuth and password hashing)</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use 
                commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We retain your information for as long as your account is active or as needed to provide you with the Service. 
                Specifically:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information is retained while your account is active</li>
                <li>Uploaded images and generated images are retained until you delete them or delete your account</li>
                <li>Usage data may be retained for analytical purposes</li>
              </ul>
              <p>
                When you delete your account, all associated data, including uploaded images and generated images, is permanently 
                deleted from our systems within a reasonable timeframe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Your rights and choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Access and correction</h4>
                  <p>
                    You can access and update your account information at any time through your account settings.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Data deletion</h4>
                  <p>
                    You can delete your account and all associated data at any time through your account settings. This action is 
                    permanent and cannot be undone.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Opt-out of communications</h4>
                  <p>
                    You can opt out of non-essential communications by adjusting your account preferences. We will still send you 
                    important service-related communications (such as security alerts).
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Do not track</h4>
                  <p>
                    Your browser may offer a "Do Not Track" option. We do not currently respond to "Do Not Track" signals, but we 
                    do not use tracking technologies beyond what is necessary to provide the Service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Cookies and tracking technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use minimal cookies and tracking technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session cookies:</strong> Used to maintain your authenticated session</li>
                <li><strong>Essential cookies:</strong> Required for the Service to function properly</li>
              </ul>
              <p>
                We do not use third-party advertising cookies or tracking pixels. We do not share your information with advertising 
                networks or data brokers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Children's privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Service is not intended for children under the age of 13. We do not knowingly collect personal information from 
                children under 13. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us and we will delete such information.
              </p>
              <p>
                If you are between the ages of 13 and 18, you represent that you have your parent's or guardian's permission to use 
                the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. International data transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries 
                may have data protection laws that differ from those in your country. By using the Service, you consent to the transfer 
                of your information to these countries.
              </p>
              <p>
                We take appropriate safeguards to ensure that your information receives an adequate level of protection regardless of 
                where it is processed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. California privacy rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you are a California resident, you have certain rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>The right to know what personal information we collect, use, and disclose</li>
                <li>The right to delete your personal information</li>
                <li>The right to opt out of the sale of personal information (we do not sell personal information)</li>
                <li>The right to non-discrimination for exercising your privacy rights</li>
              </ul>
              <p>
                To exercise these rights, please use the account deletion feature in your account settings or contact us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Changes to this privacy policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the 
                "Last updated" date at the top of this page and, if the changes are significant, we may provide additional notice 
                through the Service or by email.
              </p>
              <p>
                Your continued use of the Service after such changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Contact us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about this Privacy Policy or our data practices, please review your account settings where you 
                can manage your data and delete your account.
              </p>
              <p>
                For additional privacy-related inquiries, you may contact us through the Service.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Palette Pics. All rights reserved.</p>
        </div>
      </main>
    </div>
  )
}

