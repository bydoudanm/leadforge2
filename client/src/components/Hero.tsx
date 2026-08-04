import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const liveStats = [
  { icon: '🏢', text: '18,432 businesses searched for web design help in the last 24 hours' },
  { icon: '📊', text: '7,891 weak SEO opportunities detected globally' },
  { icon: '🔍', text: '12,456 outdated websites identified' },
  { icon: '📱', text: '5,234 social-media-only businesses found' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      {/* Background with hero image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663650809757/eFaTuxdwpBPRDRMwcG8ZPj/leadforge-hero-bg-ZqWXu8Kr7GUVCWwhtDExwV.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
      </div>

      <div className="relative z-10 container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6"
          >
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">AI-Powered Lead Discovery</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="text-white">Find, contact, and close</span>
            <br />
            <span className="text-gradient">businesses that need your services — automatically.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
          >
            LeadForge is an AI-powered system that discovers high-intent leads, reaches out to them, and helps you convert them into paying clients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold rounded-lg border-slate-600 text-slate-200 hover:bg-slate-900/50"
            >
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Live Intelligence Feed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 glow-blue"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-400">Live Intelligence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-blue-500/50 transition-colors"
              >
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-sm text-slate-300">{stat.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
