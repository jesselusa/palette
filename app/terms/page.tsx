import Link from 'next/link'
import { Metadata } from 'next'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Terms of Service - Palette',
  description: 'Terms of Service for Palette Pics AI product photography service.',
}

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing or using Palette Pics ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, you may not use the Service.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating 
                the "Last updated" date at the top of this page. Your continued use of the Service after such changes constitutes 
                acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Palette Pics is an AI-powered product photography service that allows users to generate professional e-commerce 
                product images using artificial intelligence. The Service uses Google Gemini AI technology to transform user-uploaded 
                product photos into studio-quality imagery based on text prompts.
              </p>
              <p>
                The Service is provided "as is" and we do not guarantee that the Service will be uninterrupted, secure, or error-free.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To use the Service, you must create an account. You may sign up using:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google OAuth authentication</li>
                <li>Email and password</li>
              </ul>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur 
                under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
              <p>
                You must be at least 13 years old to use the Service. If you are under 18, you represent that you have your parent's 
                or guardian's permission to use the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Usage limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Service has the following usage limits:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Free tier:</strong> Users receive 1 free image generation per week.</li>
                <li><strong>Daily limit:</strong> All users are subject to a hard cap of 20 image generations per day to prevent abuse and control costs.</li>
              </ul>
              <p>
                We reserve the right to modify these limits at any time. We will notify users of any material changes to usage limits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual property rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>Your content:</strong> You retain all ownership rights to images you upload to the Service. By uploading content, 
                you grant us a limited license to use, store, and process your images solely for the purpose of providing the Service.
              </p>
              <p>
                <strong>Generated images:</strong> You own the rights to images generated for you through the Service. You may use 
                generated images for any lawful purpose, including commercial use. However, you are responsible for ensuring that your 
                use of generated images complies with all applicable laws and does not infringe on the rights of others.
              </p>
              <p>
                <strong>Service content:</strong> All content, features, and functionality of the Service, including but not limited to 
                text, graphics, logos, and software, are owned by Palette Pics or its licensors and are protected by copyright, trademark, 
                and other intellectual property laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Prohibited uses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree not to use the Service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>For any illegal purpose or in violation of any local, state, national, or international law</li>
                <li>To generate content that infringes on the intellectual property rights of others</li>
                <li>To generate content that is defamatory, obscene, pornographic, or otherwise objectionable</li>
                <li>To generate content that promotes violence, hate speech, or discrimination</li>
                <li>To impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity</li>
                <li>To interfere with or disrupt the Service or servers or networks connected to the Service</li>
                <li>To attempt to gain unauthorized access to any portion of the Service or any other accounts, computer systems, or networks</li>
                <li>To use automated systems (bots, scrapers) to access the Service without our express written permission</li>
              </ul>
              <p>
                Violation of these prohibitions may result in immediate termination of your account and legal action.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. AI-generated content disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Images generated by the Service are created using artificial intelligence and may not always meet your expectations. 
                The Service uses Google Gemini AI technology, and we do not control the specific output of the AI model.
              </p>
              <p>
                You acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Generated images may contain errors, artifacts, or unexpected elements</li>
                <li>AI-generated content may not accurately represent real-world products or scenarios</li>
                <li>You are responsible for reviewing and verifying generated images before use</li>
                <li>We are not liable for any consequences resulting from your use of generated images</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Account termination and deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You may delete your account at any time through your account settings. When you delete your account:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your account information will be permanently deleted</li>
                <li>All uploaded images and generated images associated with your account will be permanently deleted</li>
                <li>This action cannot be undone</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these 
                Terms or for any other reason we deem necessary to protect the Service or other users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PALETTE PICS AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, AND LICENSORS 
                SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
                OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, 
                RESULTING FROM YOUR USE OF THE SERVICE.
              </p>
              <p>
                OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE USE OF OR INABILITY TO USE THE SERVICE SHALL 
                BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless Palette Pics and its affiliates, officers, employees, agents, and 
                licensors from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, 
                arising out of or in any way connected with your use of the Service, your violation of these Terms, or your violation 
                of any rights of another.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Governing law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its 
                conflict of law provisions. Any disputes arising out of or relating to these Terms or the Service shall be resolved in 
                the courts of the United States.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Severability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated 
                to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Entire agreement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms constitute the entire agreement between you and Palette Pics regarding the use of the Service and supersede 
                all prior agreements and understandings, whether written or oral.
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

