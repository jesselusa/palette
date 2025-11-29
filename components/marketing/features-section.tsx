import { Card, CardContent } from '@/components/ui/card'
import { Layers, Zap, Image as ImageIcon, ShieldCheck, LayoutGrid, Smartphone } from 'lucide-react'
import { FadeIn } from './fade-in'

export function FeaturesSection() {
  const features = [
    {
      icon: Layers,
      title: 'Smart composition',
      description: 'Palette understands product placement, lighting, and shadows to create realistic scenes.',
    },
    {
      icon: Zap,
      title: 'Lightning fast',
      description: 'Generate multiple variations in minutes. Scale your content creation effortlessly.',
    },
    {
      icon: ImageIcon,
      title: 'High resolution',
      description: 'Get crisp, store-ready, high-resolution images, suitable for any e-commerce platform.',
    },
    {
      icon: LayoutGrid,
      title: 'Batch generation',
      description: 'Create multiple angles and settings at once to build a complete product gallery.',
    },
    {
      icon: ShieldCheck,
      title: 'Commercial rights',
      description: 'You own 100% of the images you generate. Use them anywhere without restrictions.',
    },
    {
      icon: Smartphone,
      title: 'Mobile optimized',
      description: 'Create on the go. Our platform works perfectly on your phone or tablet.',
    },
  ]

  return (
    <section className="container py-24">
      <FadeIn>
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Powerful features designed for modern e-commerce brands.
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <Card className="border-muted/60 shadow-sm hover:shadow-md transition-all h-full">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

