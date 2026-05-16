import { motion } from 'motion/react';
import { Target, Wallet, Tag, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden text-slate-200">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 card-gradient rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-black font-bold text-xl">F</span>
          </div>
          <span className="text-2xl font-display font-bold text-white tracking-tight">FinWise</span>
        </div>
        <button 
          onClick={() => signInWithGoogle()}
          className="px-6 py-2 bg-white/5 text-white border border-white/10 rounded-full font-medium shadow-sm hover:bg-white/10 transition-all active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-8 leading-tight tracking-tight">
            Know where your money is going.<br />
            <span className="text-teal-400">Know where it can go.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            AI-powered financial planning built for salaried professionals. Build structured roadmaps toward your goals with a smart friend who knows money.
          </p>
          <button 
            onClick={() => signInWithGoogle()}
            className="px-8 py-4 bg-teal-500 text-black rounded-full text-lg font-bold shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all flex items-center gap-2 mx-auto active:scale-95 group"
          >
            Start My Financial Plan — It's Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Social Proof */}
        <div className="mt-20 py-8 border-y border-white/5">
          <p className="text-slate-500 font-medium mb-0">Join 10,000+ people already saving smarter</p>
        </div>

        {/* Value Prop Row */}
        <div className="grid md:grid-cols-3 gap-12 mt-24">
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-[#141414] shadow-lg border border-white/5"
          >
            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Target className="text-teal-500 w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold mb-3 text-white">Set Goals → Get a Roadmap</h3>
            <p className="text-slate-400">Tell us what you want, and our AI will build a step-by-step savings plan that actually works.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-[#141414] shadow-lg border border-white/5"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Wallet className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold mb-3 text-white">"Can I Afford This?"</h3>
            <p className="text-slate-400">Get instant, non-judgmental advice on any purchase before you spend. No more guessing.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-[#141414] shadow-lg border border-white/5"
          >
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Tag className="text-purple-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-bold mb-3 text-white">Deals Timed for You</h3>
            <p className="text-slate-400">Discover handpicked deals precisely when you're ready to buy, timed to your savings milestones.</p>
          </motion.div>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
