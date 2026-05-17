import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  HelpCircle, 
  TrendingUp, 
  CreditCard, 
  Tag, 
  MessageCircle, 
  LogOut,
  X,
  Target,
  ArrowRight,
  TrendingDown,
  Info,
  Home,
  Zap,
  History,
  Gift
} from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { Goal, Expense } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import AffordabilityModal from './AffordabilityModal';
import ChatAssistant from './ChatAssistant';
import GoalCard from './GoalCard';
import ExpenseTracker from './ExpenseTracker';
import GoalModal from './GoalModal';
import EditGoalModal from './EditGoalModal';
import GoalDetailModal from './GoalDetailModal';
import GoalTimeline from './GoalTimeline';

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeModal, setActiveModal] = useState<'affordability' | 'chat' | 'expense' | 'goal' | 'roadmap' | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [aiInsights, setAiInsights] = useState<{ score: number, statusMessage: string, insights: string[] } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (!user) return;

    const goalsQuery = query(collection(db, `users/${user.uid}/goals`));
    const expensesQuery = query(collection(db, `users/${user.uid}/expenses`));

    const unsubGoals = onSnapshot(goalsQuery, (snap) => {
      setGoals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    });

    const unsubExpenses = onSnapshot(expensesQuery, (snap) => {
      setExpenses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    });

    return () => {
      unsubGoals();
      unsubExpenses();
    };
  }, [user]);

  useEffect(() => {
    if (!profile || goals.length === 0) return;

    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        // Mocking AI insights locally
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockInsights = {
          score: 85,
          statusMessage: "Your financial momentum is building!",
          insights: [
            `Hey ${profile.name || 'there'}! You're currently saving ₹${savingsAmount.toLocaleString()} this month.`,
            "You've covered 85% of your fixed expenses. Great discipline!",
            "Consider small cuts in variable spending to reach your car goal faster."
          ]
        };
        setAiInsights(mockInsights);
      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchInsights();
  }, [profile, goals.length, expenses.length]);

  const totalIndividualExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = (profile?.fixedExpenses || 0) + totalIndividualExpenses;
  const healthScore = aiInsights?.score || 82; 
  const savingsAmount = (profile?.monthlyIncome || 0) - totalExpenses;
  const savingsRate = profile?.monthlyIncome ? Math.round((savingsAmount / profile.monthlyIncome) * 100) : 0;

  // Aggregate Goal Stats
  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalSaved = goals.reduce((acc, curr) => acc + curr.currentSaved, 0);
  const totalRemaining = totalTarget - totalSaved;
  const aggregateProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const totalMonthlyRequired = goals.reduce((acc, goal) => {
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const monthsDiff = (targetDate.getFullYear() - now.getFullYear()) * 12 + targetDate.getMonth() - now.getMonth();
    const monthsRemaining = Math.max(monthsDiff, 1);
    const remainingForGoal = goal.targetAmount - goal.currentSaved;
    return acc + (remainingForGoal / monthsRemaining);
  }, 0);

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-slate-200 flex overflow-hidden font-sans selection:bg-teal-500/30">
      {/* Sidebar */}
      <aside className="w-64 sidebar-bg flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-black text-xl">S</div>
          <h1 className="text-xl font-bold tracking-tight text-white">Savio</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl text-teal-400 font-medium transition-all">
            <Home className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveModal('roadmap')}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors"
          >
            <Target className="w-5 h-5" /> Financial Roadmap
          </button>
          <button 
            onClick={() => setActiveModal('goal')}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors"
          >
            <Zap className="w-5 h-5" /> Savings Goals
          </button>
          <button 
            onClick={() => setActiveModal('expense')}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors"
          >
            <History className="w-5 h-5" /> Spending History
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors">
            <Gift className="w-5 h-5" /> Exclusive Offers
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
            <p className="text-[10px] uppercase tracking-widest text-teal-500 font-bold mb-1">Pro Plan</p>
            <p className="text-xs text-white">Unlimited goals & priority AI insights active.</p>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        <header className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <span className="text-slate-400 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <h2 className="text-3xl font-light text-white">Welcome back, <span className="font-medium">{profile?.name?.split(' ')[0]}</span></h2>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Savio Score</p>
              <div className="flex items-center gap-2 font-bold text-2xl text-teal-400">
                {healthScore} <span className="text-xs bg-teal-400/20 px-1 rounded font-medium text-teal-400">+3.2%</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 p-1">
              <img src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + profile?.name} className="w-full h-full rounded-full bg-gradient-to-tr from-teal-500 to-emerald-300" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 card-bg rounded-3xl p-6 flex flex-col justify-between h-[180px]">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-medium text-slate-400">Monthly Snapshot</h3>
              <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-full uppercase text-slate-400">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex gap-12">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Income</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(profile?.monthlyIncome || 0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Expenses</p>
                <p className="text-2xl font-semibold text-white">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Saved</p>
                <p className="text-2xl font-semibold text-teal-400">{formatCurrency(savingsAmount)}</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500" style={{ width: `${Math.min(savingsRate, 100)}%` }}></div>
            </div>
          </div>

          <button 
            onClick={() => setActiveModal('affordability')}
            className="group action-gradient rounded-3xl p-6 text-left relative overflow-hidden h-[180px] hover:scale-[1.02] transition-all"
          >
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">Can I Afford<br />This?</h3>
              <p className="text-white/60 text-xs mt-2">Instant AI verdict on your next purchase.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Middle & Right Section */}
          <div className="col-span-2 flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-col gap-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-200">Active Savings Goals</h3>
                <button 
                  onClick={() => setActiveModal('goal')}
                  className="text-teal-400 text-xs hover:underline flex items-center gap-1"
                >
                  Add Goal <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {goals.length > 0 ? goals.map((goal, idx) => (
                  <GoalCard 
                    key={`${goal.id}-${idx}`} 
                    goal={goal} 
                    onEdit={() => setEditingGoal(goal)} 
                    onClick={() => setSelectedGoal(goal)}
                  />
                )) : (
                  <div className="min-w-[280px] bg-white/5 border border-white/10 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-slate-500 text-center space-y-4">
                    <Target className="w-10 h-10 opacity-20" />
                    <p className="text-xs font-medium uppercase tracking-widest">No goals yet</p>
                    <button 
                      onClick={() => setActiveModal('goal')}
                      className="text-teal-400 text-xs font-bold hover:underline"
                    >
                      Create Goal
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 text-teal-400 mb-4 shrink-0">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">AI Copilot Insights</span>
                </div>
                <div className="flex-1 italic text-slate-300 leading-relaxed text-sm space-y-3 overflow-y-auto scrollbar-hide pr-2">
                  {loadingInsights ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-white/5 rounded w-full"></div>
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                    </div>
                  ) : aiInsights ? (
                    aiInsights.insights.map((insight, i) => (
                      <p key={i}>"{insight}"</p>
                    ))
                  ) : (
                    <p>"Loading your personalized insights..."</p>
                  )}
                </div>
                <button 
                  onClick={() => setActiveModal('chat')}
                  className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors shrink-0"
                >
                  Chat with Copilot
                </button>
              </div>

              <div className="space-y-4 flex flex-col">
                <div className="flex-1 card-bg rounded-3xl p-6 border border-white/5 flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-teal-400" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">Financial Mastery</p>
                  <p className="text-xs text-slate-500">You're doing better than 78% of people in your income bracket.</p>
                </div>

                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-orange-500/20 rounded-3xl p-4 flex gap-4 items-center">
                  <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg shrink-0">🏷️</div>
                  <div>
                    <p className="text-xs font-bold text-white">Special Offer for your Trip</p>
                    <p className="text-[10px] text-orange-400/80">12% Off International Flights on MakeMyTrip</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Collaborative Savings & Portfolio */}
          <div className="col-span-1 flex flex-col gap-6 overflow-hidden">
            <div className="card-bg rounded-3xl p-6 border border-white/5 space-y-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400">
                  <Target className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Total Portfolio</span>
                </div>
                <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-6 flex-1 flex flex-col justify-center">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Collaborative Target</p>
                  <p className="text-4xl font-bold text-white tracking-tight">{formatCurrency(totalTarget)}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Already Saved</p>
                    <p className="text-xl font-bold text-teal-400">{formatCurrency(totalSaved)}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Monthly Req.</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(totalMonthlyRequired)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs items-end">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Overall Completion</span>
                    <span className="text-teal-400 font-bold">{Math.round(aggregateProgress)}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 bg-[length:200%_100%] animate-shimmer rounded-full transition-all duration-1000" 
                      style={{ width: `${aggregateProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center italic mt-2">
                    "You've covered {formatCurrency(totalSaved)} of your total {formatCurrency(totalTarget)} goal pool."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {activeModal === 'affordability' && (
          <AffordabilityModal key="affordability-modal" onClose={() => setActiveModal(null)} goals={goals} />
        )}
        {activeModal === 'chat' && (
          <ChatAssistant key="chat-modal" onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'expense' && (
          <ExpenseTracker key="expense-modal" onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'goal' && (
          <GoalModal key="goal-modal" onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'roadmap' && (
          <div key="roadmap-modal" className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-6xl bg-[#0d0d0d] border border-white/10 h-full max-h-[90vh] flex flex-col shadow-2xl rounded-[48px] overflow-hidden"
            >
              <div className="p-10 border-b border-white/5 bg-[#141414] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20">
                    <Target className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display font-medium text-white tracking-tight">Financial Roadmap</h2>
                    <p className="text-xs text-teal-400 font-bold uppercase tracking-widest mt-1">Holistic Growth Strategy</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 scrollbar-hide">
                <div className="lg:col-span-1 space-y-8">
                  <div className="p-8 bg-white/5 rounded-[32px] border border-white/5 space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Savings Pool</p>
                        <p className="text-4xl font-bold text-white tracking-tight">{formatCurrency(totalTarget)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Health</p>
                        <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20">Optimal</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Collaborative Progress</span>
                        <span className="text-white font-bold">{Math.round(aggregateProgress)}%</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${aggregateProgress}%` }}
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Saved</p>
                        <p className="text-lg font-bold text-teal-400">{formatCurrency(totalSaved)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Remaining</p>
                        <p className="text-lg font-bold text-white">{formatCurrency(totalRemaining)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 bg-teal-500/5 rounded-[32px] border border-teal-500/10 space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4">Savio Strategy</h4>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{profile?.roadmap?.summary || `At your current aggregate savings rate of ${formatCurrency(savingsAmount)}/month, you are building solid momentum towards your financial milestones.`}"
                      </p>
                    </div>

                    {profile?.roadmap?.suggestions && (
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Actionable Steps</p>
                        <ul className="space-y-2">
                          {profile.roadmap.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-xs text-slate-400 flex gap-2">
                              <span className="text-teal-500 font-bold">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Recommended Target</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(profile?.roadmap?.monthlySavingsTarget || totalMonthlyRequired)} <span className="text-xs text-slate-500 font-normal">/ month</span></p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3">
                    Milestone Timeline
                    <span className="h-px flex-1 bg-white/5" />
                  </h3>
                  <div className="max-w-2xl">
                    {goals.length > 0 ? (
                      <GoalTimeline goals={goals} onGoalClick={(goal) => setSelectedGoal(goal)} />
                    ) : (
                      <div className="p-10 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-600">
                          <Target className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="text-white font-medium">No active milestones</p>
                          <p className="text-sm text-slate-500">Add segments to your roadmap to start tracking your progress.</p>
                        </div>
                        <button 
                          onClick={() => { setActiveModal(null); setTimeout(() => setActiveModal('goal'), 300); }}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all"
                        >
                          Add Your First Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-white/5 bg-[#141414] flex justify-end gap-4">
                <button 
                   onClick={() => setActiveModal(null)}
                   className="px-8 py-4 text-slate-400 font-bold hover:text-white transition-colors"
                >
                  Close Roadmap
                </button>
                <button 
                  onClick={() => { setActiveModal(null); setTimeout(() => setActiveModal('goal'), 300); }}
                  className="px-8 py-4 bg-teal-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
                >
                  <Plus className="w-5 h-5" /> Add Milestone
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {selectedGoal && (
          <GoalDetailModal key={`detail-${selectedGoal.id}`} goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
        )}
        {editingGoal && (
          <EditGoalModal key={`edit-${editingGoal.id}`} goal={editingGoal} onClose={() => setEditingGoal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
