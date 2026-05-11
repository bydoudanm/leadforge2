import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-700/50">
      <div className="container max-w-6xl flex items-center justify-between py-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚡</span>
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            LeadForge
          </span>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="hidden md:flex items-center gap-8"
        >
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              {link.label}
            </a>
          ))}
        </motion.nav>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden md:flex items-center gap-3"
        >
          <Button
            variant="ghost"
            className="text-slate-300 hover:text-white"
          >
            Login
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Sign Up
          </Button>
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 p-4"
        >
          <nav className="space-y-3 mb-4">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block text-slate-300 hover:text-white transition-colors text-sm font-medium py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="space-y-2 border-t border-slate-700/50 pt-4">
            <Button
              variant="ghost"
              className="w-full text-slate-300 hover:text-white justify-start"
            >
              Login
            </Button>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Sign Up
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  );
}
