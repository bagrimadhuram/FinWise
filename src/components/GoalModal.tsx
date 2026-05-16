import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Target, Calendar, IndianRupee, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

const GOAL_TYPES = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'car', icon: '🚘', label: 'Car' },
  { id: 'travel', icon: '✈️', label: 'Travel' },
  { id: 'wedding', icon: '💍', label: 'Wedding' },
  { id: 'edu', icon: '👶', label: 'Education' },
  { id: 'emergency', icon: '🛡️', label: 'Emergency' },
  { id: 'gadget', icon: '📱', label: 'Gadget' },
  { id: 'other', icon: '🎯', label: 'Other' },
];

export default function GoalModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [type, setType] = useState('other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveGoal = async () => {
    if (!name || !targetAmount || !targetDate || !user) return;
    setIsSubmitting(true);
    try {
      const selectedType = GOAL_TYPES.find(t => t.id === type);
      await addDoc(collection(db, `users/${user.uid}/goals`), {
        userId: user.uid,
        name,
        targetAmount: parseInt(targetAmount),
        targetDate: new Date(targetDate).toISOString(),
        currentSaved: 0,
        status: 'On Track',
        icon: selectedType?.icon || '🎯',
        type,
        createdAt: serverTimestamp()
      });
      onClose();
    } catch (error) {
      console.error("Save Goal Error:", error);
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
              <Target className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-2xl font-display font-medium tracking-tight">Set New Goal</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 bg-[#0a0a0a]">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Goal Name</label>
              <input 
                type="text" 
                placeholder="e.g. Dream Europe Trip"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all text-white"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-600">₹</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xl font-bold text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input 
                    type="date" 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Goal Category</label>
            <div className="grid grid-cols-4 gap-2">
              {GOAL_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all",
                    type === t.id ? "border-teal-500 bg-teal-500/10 text-teal-400" : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                  )}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[10px] font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={saveGoal}
            disabled={isSubmitting || !name || !targetAmount || !targetDate}
            className="w-full py-5 bg-teal-500 text-black rounded-[24px] font-bold text-lg shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 hover:bg-teal-400 transition-all disabled:opacity-50 outline-none"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Financial Goal'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
