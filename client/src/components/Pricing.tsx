import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pricingPlans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: 'Forever',
    description: 'Get started with limited features',
    features: [
      'Up to 100 leads per month',
      'Basic lead discovery',
      'Email templates',
      'Manual outreach only',
      'Community support',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Basic',
    price: '$99',
    period: '/month',
    description: 'For freelancers and small teams',
    features: [
      'Up to 2,000 leads per month',
      'AI lead discovery',
      'Personalized emails',
      'Basic automation',
      'Email support',
      'Monthly reports',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$299',
    period: '/month',
    description: 'For growing agencies',
    features: [
      'Unlimited leads',
      'Advanced AI discovery',
      'AI email generation',
      'Full automation',
      'Priority support',
      'Advanced analytics',
      'Multi-inbox sending',
      'Custom workflows',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: 'Custom',
    period: 'pricing',
    description: 'For enterprise teams',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      'API access',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
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
            Choose the plan that fits your needs. All plans include a 14-day free trial.
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
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
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
      </div>
    </section>
  );
}
