import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { Goal } from '../types';

interface AffordabilityResult {
  verdict: 'green' | 'amber' | 'red';
  title: string;
  description: string;
  impact: string;
  alternatives: string[];
}

export default function AffordabilityModal({ onClose, goals }: { onClose: () => void, goals: Goal[] }) {
  const { profile } = useAuth();
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [whenToBuy, setWhenToBuy] = useState('as soon as possible');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AffordabilityResult | null>(null);

  const checkAffordability = async () => {
    if (!item || !price) return;
    setLoading(true);
    try {
      // Mocking AI affordability check
      await new Promise(resolve => setTimeout(resolve, 1500));
      const p = parseInt(price);
      const disposable = (profile?.monthlyIncome || 0) - (profile?.fixedExpenses || 0);
      
      let verdict: 'green' | 'amber' | 'red' = 'green';
      let title = "Go for it!";
      let description = `You have ₹${disposable.toLocaleString()} disposable income which easily covers this ₹${p.toLocaleString()} purchase without delaying milestones.`;
      
      if (p > disposable * 2) {
        verdict = 'red';
        title = "Probably not right now";
        description = `This ₹${p.toLocaleString()} purchase is more than 2 months of your disposable income. It will significantly strain your emergency fund.`;
      } else if (p > disposable) {
        verdict = 'amber';
        title = "Proceed with caution";
        description = `You can afford this, but it will consume your entire monthly surplus. Consider if there's a cheaper version.`;
      }

      setResult({
        verdict,
        title,
        description,
        impact: verdict === 'green' ? "Zero delay to your active goals." : `May delay your ${goals[0]?.name || 'next milestone'} by 3-4 weeks.`,
        alternatives: p > 20000 ? ["Wait for a seasonal sale", "Consider a refurbished model", "Save for 2 more months first"] : ["Check for coupon codes", "Compare with competitors"]
      });
    } catch (error) {
      console.error("Affordability check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="max-w-xl w-full bg-[#0d0d0d] rounded-[40px] shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 border border-teal-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-medium text-white tracking-tight">Can I Afford This?</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="p-8 bg-[#0a0a0a]">
          {!result ? (
            <div className="space-y-6">
              <p className="text-slate-400">FinWise AI will analyze your disposable income, goals, and emergency fund to give you an honest verdict.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">What's the purchase?</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sony PS5 Pro"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-xl font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white"
                    value={item}
                    onChange={e => setItem(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">How much does it cost?</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-600">₹</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-3xl font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">When do you plan to buy?</label>
                  <select 
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-3xl text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white appearance-none"
                    value={whenToBuy}
                    onChange={e => setWhenToBuy(e.target.value)}
                  >
                    <option value="as soon as possible">As soon as possible</option>
                    <option value="in 1 month">In 1 month</option>
                    <option value="in 3 months">In 3 months</option>
                    <option value="after 6 months">After 6 months</option>
                    <option value="next year">Next year</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={checkAffordability}
                disabled={loading || !item || !price}
                className="w-full py-5 bg-teal-500 text-black rounded-[24px] font-bold text-lg shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 hover:bg-teal-400 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Analyze with AI'}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={cn(
                "p-8 rounded-[32px] flex flex-col items-center text-center gap-4 border",
                result.verdict === 'green' ? "bg-emerald-500/10 text-emerald-100 border-emerald-500/20" :
                result.verdict === 'amber' ? "bg-amber-500/10 text-amber-100 border-amber-500/20" : "bg-rose-500/10 text-rose-100 border-rose-500/20"
              )}>
                {result.verdict === 'green' ? <CheckCircle2 className="w-16 h-16 text-emerald-500" /> :
                 result.verdict === 'amber' ? <AlertTriangle className="w-16 h-16 text-amber-500" /> : <XCircle className="w-16 h-16 text-rose-500" />}
                <div>
                  <h3 className="text-2xl font-display font-bold mb-2 tracking-tight">{result.title}</h3>
                  <p className="font-medium opacity-80">{result.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Goal Impact</h4>
                  <p className="text-slate-200 text-sm font-medium">{result.impact}</p>
                </div>

                {result.alternatives.length > 0 && (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Smart Alternatives</h4>
                    <ul className="space-y-3">
                      {result.alternatives.map((alt, i) => (
                        <li key={i} className="flex gap-2 text-slate-300 text-sm font-medium">
                          <span className="text-teal-500 font-bold">•</span>
                          {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 border border-white/10 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all"
                >
                  Check Another
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-white/10 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all"
                >
                  Got It!
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
