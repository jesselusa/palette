import Image from 'next/image'
import { FadeIn } from './fade-in'

export function BeforeAfterGallery() {
  const examples = [
    {
      image: '/example_print.png',
      label: 'Interior design',
    },
    {
      image: '/example_bracelet.png',
      label: 'Jewelry',
    },
    {
      image: '/example_shirt.png',
      label: 'Apparel',
    },
  ]

  return (
    <section className="container py-24">
      <FadeIn>
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            See the difference
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            From simple phone photos to professional studio shots.
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-8 md:grid-cols-3">
        {examples.map((ex, i) => (
          <FadeIn key={i} delay={i * 0.2}>
            <div className="group relative">
              <div className="aspect-[4/5] relative rounded-xl overflow-hidden border bg-muted">
                <Image
                  src={ex.image}
                  alt={ex.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Overlay label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                  <p className="font-medium">{ex.label}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

