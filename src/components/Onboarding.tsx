import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check, Sparkles, Building2, UserCircle, IndianRupee, PieChart, Coins, Target } from 'lucide-react';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { EmploymentType, UserProfile } from '../types';
import { cn } from '../lib/utils';

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    city: '',
    employmentType: EmploymentType.SALARIED,
    monthlyIncome: 50000,
    fixedExpenses: 20000,
    variableSpendHabits: {
      food: 3,
      shopping: 2,
      entertainment: 2,
      transport: 2,
      health: 1,
      travel: 1,
    },
    totalSavings: 0,
    goals: [] as string[]
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const profile: UserProfile = {
        uid: user.uid,
        name: formData.name || user.displayName || 'User',
        age: formData.age,
        city: formData.city,
        employmentType: formData.employmentType,
        monthlyIncome: formData.monthlyIncome,
        fixedExpenses: formData.fixedExpenses,
        variableSpendHabits: formData.variableSpendHabits,
        totalSavings: formData.totalSavings,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profile);

      // Save initial goals to Firestore
      const goalPromises = formData.goals.map(goalId => {
        const goalInfo = [
          { id: 'home', icon: '🏠', label: 'Buy a Home', amount: 5000000 },
          { id: 'car', icon: '🚘', label: 'Buy a Car', amount: 1500000 },
          { id: 'travel', icon: '✈️', label: 'International Trip', amount: 300000 },
          { id: 'wedding', icon: '💍', label: 'Wedding', amount: 2000000 },
          { id: 'edu', icon: '👶', label: 'Education', amount: 1000000 },
          { id: 'emergency', icon: '🛡️', label: 'Emergency Fund', amount: 500000 },
          { id: 'gadget', icon: '📱', label: 'Gadgets', amount: 100000 },
          { id: 'retirement', icon: '🏖️', label: 'Early Retirement', amount: 10000000 },
        ].find(g => g.id === goalId);

        return addDoc(collection(db, `users/${user.uid}/goals`), {
          userId: user.uid,
          name: goalInfo?.label || 'New Goal',
          targetAmount: goalInfo?.amount || 100000,
          targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
          currentSaved: 0,
          status: 'On Track',
          icon: goalInfo?.icon || '🎯',
          type: goalId,
          createdAt: new Date().toISOString()
        });
      });

      await Promise.all(goalPromises);

      // Call AI to generate initial goals or roadmap if needed
      await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      await refreshProfile();
    } catch (error) {
      console.error("Onboarding Save Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "Basic Info", icon: UserCircle },
    { title: "Income", icon: IndianRupee },
    { title: "Variable Spending", icon: PieChart },
    { title: "Savings", icon: Coins },
    { title: "Goals", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-slate-200">
      <div className="max-w-2xl w-full bg-[#0d0d0d] rounded-[40px] shadow-2xl overflow-hidden border border-white/5 flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="md:w-64 bg-[#0d0d0d] border-r border-white/5 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-black text-xl">F</div>
              <span className="font-display font-bold text-xl uppercase tracking-tighter">FinWise</span>
            </div>
            <div className="space-y-6">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all",
                    step === i ? "bg-teal-500 text-black border-teal-500 scale-110 shadow-lg shadow-teal-500/20" : 
                    step > i ? "bg-white/10 border-transparent text-teal-400" : "border-white/10 text-slate-500"
                  )}>
                    {step > i ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    "font-medium transition-opacity",
                    step === i ? "text-white" : "text-slate-500"
                  )}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-slate-500 text-sm">
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 flex flex-col justify-between bg-[#0a0a0a]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              {step === 0 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-display font-medium text-white">Tell us about yourself</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-white"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rohan Sharma"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-2">Age</label>
                        <input 
                          type="number" 
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none text-white"
                          value={formData.age}
                          onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-500 mb-2">City</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none text-white"
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Mumbai"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-4">Employment Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[EmploymentType.SALARIED, EmploymentType.SELF_EMPLOYED].map(t => (
                          <button
                            key={t}
                            onClick={() => setFormData({ ...formData, employmentType: t })}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all font-medium flex items-center justify-center gap-2",
                              formData.employmentType === t ? "border-teal-500 bg-teal-500/10 text-teal-400" : "border-white/5 hover:border-white/20 text-slate-400"
                            )}
                          >
                            {t === EmploymentType.SALARIED ? <Building2 className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-display font-medium text-white">Income & Fixed Expenses</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="flex justify-between items-center text-sm font-semibold text-slate-500 mb-2">
                        Monthly Salary (Post-tax) <span className="text-white">₹{formData.monthlyIncome.toLocaleString()}</span>
                      </label>
                      <input 
                        type="range" min="10000" max="500000" step="5000"
                        className="w-full accent-teal-500 bg-white/5"
                        value={formData.monthlyIncome}
                        onChange={e => setFormData({ ...formData, monthlyIncome: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="flex justify-between items-center text-sm font-semibold text-slate-500 mb-2">
                        Fixed Monthly Expenses <span className="text-white">₹{formData.fixedExpenses.toLocaleString()}</span>
                      </label>
                      <input 
                        type="range" min="0" max={formData.monthlyIncome} step="1000"
                        className="w-full accent-teal-500 bg-white/5"
                        value={formData.fixedExpenses}
                        onChange={e => setFormData({ ...formData, fixedExpenses: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-slate-500 mt-2">Rent, EMIs, Insurance, Subscriptions...</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                      <p className="text-sm font-medium text-slate-500 mb-1">Estimated Disposable Income</p>
                      <p className="text-3xl font-display font-bold text-teal-400">₹{(formData.monthlyIncome - formData.fixedExpenses).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-display font-medium text-white">Spending Habits</h2>
                  <p className="text-slate-500 -mt-6">Rate your typical spending from Low (1) to High (5)</p>
                  <div className="grid grid-cols-1 gap-6">
                    {Object.entries(formData.variableSpendHabits).map(([cat, val]) => (
                      <div key={cat} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold capitalize">
                          <span className="text-slate-300">{cat}</span>
                          <span className="text-teal-400">{val}/5</span>
                        </div>
                        <input 
                          type="range" min="1" max="5" 
                          className="w-full accent-teal-500 h-1.5 bg-white/5"
                          value={val}
                          onChange={e => setFormData({
                            ...formData,
                            variableSpendHabits: { ...formData.variableSpendHabits, [cat]: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-display font-medium text-white">Existing Savings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-2">Current Total Savings (Approx)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-teal-500 outline-none text-white"
                          value={formData.totalSavings}
                          onChange={e => setFormData({ ...formData, totalSavings: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <p className="text-sm text-slate-500 mt-4 italic">"This includes your bank balance, fixed deposits, and liquid investments."</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-display font-medium text-teal-400">What are you saving for?</h2>
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
                    {[
                      { id: 'home', icon: '🏠', label: 'Buy a Home' },
                      { id: 'car', icon: '🚘', label: 'Buy a Car' },
                      { id: 'travel', icon: '✈️', label: 'International Trip' },
                      { id: 'wedding', icon: '💍', label: 'Wedding' },
                      { id: 'edu', icon: '👶', label: 'Education' },
                      { id: 'emergency', icon: '🛡️', label: 'Emergency Fund' },
                      { id: 'gadget', icon: '📱', label: 'Gadgets' },
                      { id: 'retirement', icon: '🏖️', label: 'Early Retirement' },
                    ].map(goal => (
                      <button
                        key={goal.id}
                        onClick={() => {
                          const newGoals = formData.goals.includes(goal.id) 
                            ? formData.goals.filter(g => g !== goal.id)
                            : [...formData.goals, goal.id];
                          setFormData({ ...formData, goals: newGoals });
                        }}
                        className={cn(
                          "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                          formData.goals.includes(goal.id) ? "border-teal-500 bg-teal-500/10" : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <span className="text-3xl">{goal.icon}</span>
                        <span className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            {step > 0 && (
              <button 
                onClick={prevStep}
                className="flex-1 py-4 border border-white/10 rounded-2xl font-bold text-slate-400 flex items-center justify-center gap-2 hover:bg-white/5 transition-all outline-none"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button 
              onClick={step === steps.length - 1 ? handleSubmit : nextStep}
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-teal-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all disabled:opacity-50 outline-none"
            >
              {isSubmitting ? 'Personalizing...' : step === steps.length - 1 ? 'Build My Roadmap' : 'Save & Continue'}
              {!isSubmitting && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
