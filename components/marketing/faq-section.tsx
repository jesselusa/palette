import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function FAQSection() {
  const faqs = [
    {
      question: 'Do I own the images I generate?',
      answer: 'Yes! You have full commercial ownership of all images you generate on our platform. You can use them for your website, social media, ads, and anywhere else.',
    },
    {
      question: 'What file format and resolution are the downloads?',
      answer: 'Images are provided in high-quality PNG format. Standard generation is 1024x1024px, and Pro users can upscale to 2048x2048px for extra crisp details.',
    },
    {
      question: 'Can I use photos taken with my phone?',
      answer: 'Absolutely! In fact, that\'s what Palette is best at. Take a clear photo of your product in good lighting, upload it, and we\'ll handle the rest.',
    },
  ]

  return (
    <section className="container py-24 max-w-3xl">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about Palette.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-center justify-center text-lg hover:no-underline">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-center text-muted-foreground text-base max-w-2xl mx-auto">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

