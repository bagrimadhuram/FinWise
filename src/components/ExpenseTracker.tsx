import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, CreditCard, Calendar, Tag, ChevronDown, Check } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍕' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'health', label: 'Health & Wellness', icon: '🏥' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'bills', label: 'Bills & Utilities', icon: '📑' },
  { id: 'other', label: 'Other', icon: '📦' },
];

export default function ExpenseTracker({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveExpense = async () => {
    if (!amount || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/expenses`), {
        userId: user.uid,
        amount: parseInt(amount),
        category,
        date: new Date(date).toISOString(),
        isRecurring: false,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (error) {
      console.error("Save Expense Error:", error);
    } finally {
      setIsSubmitting(false);
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
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#141414] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
              <CreditCard className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-2xl font-display font-medium tracking-tight">Log Expense</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8 bg-[#0a0a0a]">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">How much did you spend?</label>
            <div className="relative max-w-xs mx-auto">
              <span className="absolute left-6 top-3 text-4xl font-bold text-slate-700">₹</span>
              <input 
                type="number" 
                autoFocus
                placeholder="0"
                className="w-full px-6 pt-10 pb-6 bg-white/5 border border-white/10 rounded-[32px] text-5xl font-bold text-center outline-none focus:ring-4 focus:ring-teal-500/10 transition-all text-white"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
            <div className="grid grid-cols-4 gap-3 max-h-[200px] overflow-y-auto scrollbar-hide pr-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                    category === cat.id ? "border-teal-500 bg-teal-500/10 text-teal-400" : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                  )}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-bold uppercase">{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Account</label>
              <div className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-600 flex items-center justify-between">
                Main Wallet
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <button 
            onClick={saveExpense}
            disabled={isSubmitting || !amount}
            className="w-full py-5 bg-teal-500 text-black rounded-[24px] font-bold text-lg shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 hover:bg-teal-400 transition-all disabled:opacity-50 outline-none"
          >
            {isSubmitting ? 'Recording...' : 'Record Expense'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
