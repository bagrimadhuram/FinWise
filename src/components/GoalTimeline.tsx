import { motion } from 'motion/react';
import { Goal } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Calendar, Target } from 'lucide-react';

export default function GoalTimeline({ goals, onGoalClick }: { goals: Goal[], onGoalClick?: (goal: Goal) => void }) {
  const sortedGoals = [...goals].sort((a, b) => 
    new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  if (goals.length === 0) return null;

  return (
    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
      {sortedGoals.map((goal, index) => {
        const progress = (goal.currentSaved / goal.targetAmount) * 100;
        const targetDate = new Date(goal.targetDate);
        
        return (
          <motion.div 
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline Dot */}
            <div className={cn(
              "absolute -left-[29px] w-4 h-4 rounded-full border-2 bg-[#0a0a0a] z-10 top-1.5 transition-colors",
              goal.status === 'On Track' ? "border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.3)]" : 
              goal.status === 'At Risk' ? "border-orange-500" : "border-slate-600"
            )} />

            <div 
              onClick={() => onGoalClick?.(goal)}
              className={cn(
                "bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group",
                onGoalClick ? "cursor-pointer hover:border-teal-500/50" : "cursor-default"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-teal-400 transition-colors">{goal.name}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  goal.status === 'On Track' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : 
                  goal.status === 'At Risk' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-white/5 text-slate-400 border-white/10"
                )}>
                  {goal.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Saved</p>
                    <p className="text-sm font-bold text-teal-400">{formatCurrency(goal.currentSaved)}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Remaining</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(goal.targetAmount - goal.currentSaved)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Progress</span>
                    <span className="text-teal-400 font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        goal.status === 'At Risk' ? "bg-orange-500" : "bg-teal-500"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
