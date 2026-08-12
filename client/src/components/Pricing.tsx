import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Best for testing the data & starting outreach',
    features: [
      '2,000 verified leads',
      'Access to businesses without websites',
      'Basic filters (location, category)',
      'Clean & structured lead data',
      'CSV export',
      'Connect up to 2 inboxes',
      'Basic sending access',
      'Limited daily sending volume',
    ],
    cta: 'Start Getting Leads',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$79',
    period: '/month',
    description: 'For freelancers & small teams scaling outreach',
    features: [
      '10,000 leads/month',
      'Advanced filters (niche targeting, location depth)',
      'Higher-quality data enrichment',
      'Faster lead access',
      'Connect up to 5 inboxes',
      'Automated sending system',
      'Lead distribution across inboxes',
      'Basic AI message generation',
      'Simple personalization',
    ],
    cta: 'Scale My Leads',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro',
    price: '$299',
    period: '/month',
    description: 'For agencies & serious outbound operators',
    features: [
      '50,000 leads/month',
      'Premium data quality',
      'Advanced segmentation',
      'Priority data processing',
      'Smart lead categorization',
      'Connect up to 15 inboxes',
      'High-volume sending system',
      'Optimized inbox rotation',
      'Advanced AI copy generation',
      'Smart personalization at scale',
      'Campaign optimization suggestions',
    ],
    cta: 'Automate My Outreach',
    highlighted: false,
  },
  {
    name: 'Scale',
    price: '$499',
    period: '/month',
    description: 'For high-volume operators & growth teams',
    features: [
      '100,000+ leads/month',
      'Maximum data coverage',
      'Priority access to new datasets',
      'Custom lead sourcing logic',
      'Fastest delivery speed',
      'Unlimited inbox connections',
      'Full sending infrastructure',
      'Advanced deliverability optimization',
      'AI campaign automation',
      'Dynamic personalization engine',
      'Performance-based message optimization',
      'Priority support',
      'Dedicated onboarding',
    ],
    cta: 'Upgrade to Scale',
    highlighted: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Pricing() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/10 to-slate-950 -z-10"></div>

      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Simple, Transparent
            <br />
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            We provide the data — outreach is optional.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                plan.highlighted ? 'md:scale-105 md:z-10' : ''
              }`}
            >
              {/* Glow effect for highlighted plan */}
              {plan.highlighted && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-2xl -z-10"></div>
              )}

              <div
                className={`h-full bg-slate-900/50 backdrop-blur-sm border rounded-xl p-8 flex flex-col ${
                  plan.highlighted
                    ? 'border-blue-500/50 shadow-2xl shadow-blue-500/20'
                    : 'border-slate-700/50 hover:border-blue-500/50'
                } transition-colors`}
              >
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className="text-xs font-semibold px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 text-sm">{plan.period}</span>
                  </div>
                </div>

                <Button
                  className={`w-full mb-8 font-semibold py-6 rounded-lg transition-all ${
                    plan.highlighted
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">Need massive lead volumes?</h3>
            <p className="text-slate-400 mb-6">
              For teams that need 200K+ / 500K+ / 1M+ leads with custom data sourcing and enterprise-level data pipelines.
            </p>
            <Button className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-6 px-8 rounded-lg">
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
