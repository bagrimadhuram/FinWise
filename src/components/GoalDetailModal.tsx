import { motion } from 'motion/react';
import { X, Calendar, Target, TrendingUp, ChevronRight, IndianRupee, Clock, Info } from 'lucide-react';
import { Goal } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface GoalDetailModalProps {
  goal: Goal;
  onClose: () => void;
}

export default function GoalDetailModal({ goal, onClose }: GoalDetailModalProps) {
  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const monthsDiff = (targetDate.getFullYear() - now.getFullYear()) * 12 + targetDate.getMonth() - now.getMonth();
  const monthsRemaining = Math.max(monthsDiff, 1);
  const remainingAmount = goal.targetAmount - goal.currentSaved;
  const monthlyRequired = remainingAmount / monthsRemaining;
  const progress = (goal.currentSaved / goal.targetAmount) * 100;

  // Generate some dummy milestones for the specific goal
  const milestones = [
    { label: 'Started', amount: 0, date: new Date(goal.createdAt).toLocaleDateString(), completed: true },
    { label: 'Quarter Way', amount: goal.targetAmount * 0.25, completed: goal.currentSaved >= goal.targetAmount * 0.25 },
    { label: 'Half Way', amount: goal.targetAmount * 0.5, completed: goal.currentSaved >= goal.targetAmount * 0.5 },
    { label: 'Near Finish', amount: goal.targetAmount * 0.75, completed: goal.currentSaved >= goal.targetAmount * 0.75 },
    { label: 'Goal Reached', amount: goal.targetAmount, date: targetDate.toLocaleDateString(), completed: goal.currentSaved >= goal.targetAmount },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-4xl w-full bg-[#0d0d0d] rounded-[48px] shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row h-[80vh]"
      >
        {/* Left Side: Overview */}
        <div className="md:w-2/5 p-10 bg-[#141414] border-r border-white/5 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-4xl border border-white/10">
              {goal.icon}
            </div>
            <div>
              <h2 className="text-3xl font-display font-medium text-white tracking-tight">{goal.name}</h2>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-block mt-2",
                goal.status === 'On Track' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : 
                "bg-orange-500/10 text-orange-400 border-orange-500/20"
              )}>
                {goal.status}
              </span>
            </div>
          </div>

          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Goal</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(goal.targetAmount)}</p>
              </div>
              <div className="space-y-1 text-teal-400">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Already Saved</p>
                <p className="text-2xl font-bold">{formatCurrency(goal.currentSaved)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Time Remaining</p>
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <p className="text-xl font-bold">{monthsRemaining} Months</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-500/5 border border-teal-500/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-teal-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">Required Savings</span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white leading-tight">
                  {formatCurrency(monthlyRequired)}
                  <span className="text-sm font-normal text-slate-500 ml-1">/ month</span>
                </p>
                <p className="text-xs text-slate-400">Save this amount regularly to reach your goal by {targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Timeline */}
        <div className="flex-1 p-10 overflow-y-auto scrollbar-hide flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-medium text-white tracking-tight flex items-center gap-3">
              <Target className="w-5 h-5 text-teal-400" />
              Progress Roadmap
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative pl-8 space-y-10 flex-1 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {milestones.map((ms, idx) => (
              <div key={idx} className="relative">
                <div className={cn(
                  "absolute -left-[29px] w-4 h-4 rounded-full border-2 bg-[#0d0d0d] z-10 top-1.5",
                  ms.completed ? "border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.3)]" : "border-white/10"
                )} />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={cn("font-bold transition-colors", ms.completed ? "text-white" : "text-slate-500")}>
                      {ms.label}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{formatCurrency(ms.amount)} requirement</p>
                  </div>
                  {ms.completed && (
                    <div className="px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-500/20">
                      Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4">
            <Info className="w-5 h-5 text-teal-400 shrink-0 mt-1" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Savio Strategy Tip</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                To reach this goal faster, consider increasing your monthly contribution by 10%. 
                Based on your current spending patterns, we suggest reducing "Entertainment" expenses next month.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
