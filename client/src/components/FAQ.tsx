import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does LeadForge find businesses with no website?',
    answer: 'LeadForge uses advanced AI algorithms that scan millions of business records, social media profiles, and online directories to identify companies without a web presence. Our system analyzes over 50 data points to ensure accuracy.',
  },
  {
    question: 'Can I customize the AI-generated emails?',
    answer: 'Absolutely! Our AI generates personalized emails based on your style and preferences. You can edit, customize, and refine every email before sending. The more you use LeadForge, the better it learns your voice.',
  },
  {
    question: 'What email providers are supported?',
    answer: 'LeadForge supports Gmail, Outlook, Yahoo Mail, and any IMAP/SMTP email provider. You can connect multiple email accounts to send from different addresses and maximize deliverability.',
  },
  {
    question: 'How accurate is the lead data?',
    answer: 'Our data comes from verified sources and is updated daily. We maintain a 95%+ accuracy rate for contact information. All leads are verified before being added to your list.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans include a 14-day free trial with full access to features. No credit card required to start. You can explore all capabilities before committing.',
  },
  {
    question: 'Can I export my leads?',
    answer: 'Yes, you can export leads in CSV, Excel, or JSON format. You can also integrate with your CRM using our API or pre-built integrations with Salesforce, HubSpot, and more.',
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer email support for all plans, priority support for Pro and Agency plans, and a dedicated account manager for Agency customers. We also have extensive documentation and video tutorials.',
  },
  {
    question: 'How do you ensure email deliverability?',
    answer: 'We use industry-leading email infrastructure, SPF/DKIM/DMARC authentication, and intelligent sending patterns to maximize deliverability. Our average delivery rate is 98%+.',
  },
];

export default function FAQ() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950 -z-10"></div>

      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Frequently Asked
            <br />
            <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-xl text-slate-400">
            Everything you need to know about LeadForge
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg px-6 data-[state=open]:border-blue-500/50 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-white hover:text-blue-400 transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-300 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
