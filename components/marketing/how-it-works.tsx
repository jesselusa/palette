import { Upload, Wand2, Download } from 'lucide-react'
import { FadeIn } from './fade-in'

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload product',
      description: 'Upload a simple photo of your product. We\'ll automatically remove the background.',
    },
    {
      icon: Wand2,
      title: 'Describe scene',
      description: 'Tell Palette where you want to place your product (e.g., "on a marble table in sunlight").',
    },
    {
      icon: Download,
      title: 'Download & sell',
      description: 'Get professional variations in seconds. Download high-res images ready for your store.',
    },
  ]

  return (
    <section className="container py-24 bg-muted/30">
      <FadeIn>
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            How it works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Three simple steps to transform your product photography.
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-8 md:grid-cols-3 relative">
        {/* Connecting lines for desktop */}
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border -z-10" />

        {steps.map((step, i) => (
          <FadeIn key={i} delay={i * 0.2} className="flex flex-col items-center text-center gap-4 relative bg-background md:bg-transparent p-6 md:p-0 rounded-xl md:rounded-none border md:border-none shadow-sm md:shadow-none">
            <div className="h-24 w-24 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center shadow-sm mb-2">
              <step.icon className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              {step.description}
            </p>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

