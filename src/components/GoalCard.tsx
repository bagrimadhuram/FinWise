import { motion } from 'motion/react';
import { Target, Calendar, ArrowRight, Settings2 } from 'lucide-react';
import { Goal } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onClick: () => void;
}

export default function GoalCard({ goal, onEdit, onClick }: GoalCardProps) {
  const progress = (goal.currentSaved / goal.targetAmount) * 100;
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="min-w-[280px] bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 flex flex-col justify-between cursor-pointer hover:border-teal-500/50 transition-colors"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-2xl">
            {goal.icon || '🎯'}
          </div>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            goal.status === 'On Track' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : 
            goal.status === 'At Risk' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-white/5 text-white border-white/10"
          )}>
            {goal.status}
          </span>
        </div>
        <h4 className="text-lg font-bold text-white mb-1">{goal.name}</h4>
        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
          <Calendar className="w-3 h-3" />
          Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
      </div>

      <div className="space-y-4 mt-6">
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-400">{formatCurrency(goal.currentSaved)} / {formatCurrency(goal.targetAmount)}</span>
            <span className="text-white font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={cn(
                "h-full rounded-full",
                goal.status === 'At Risk' ? "bg-orange-500" : "bg-teal-500"
              )}
            />
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <Settings2 className="w-3 h-3" /> Edit Goal
        </button>
      </div>
    </motion.div>
  );
}
