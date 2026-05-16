export enum EmploymentType {
  SALARIED = 'Salaried',
  SELF_EMPLOYED = 'Self-employed',
}

export interface VariableSpendHabits {
  food: number;
  shopping: number;
  entertainment: number;
  transport: number;
  health: number;
  travel: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  city: string;
  employmentType: EmploymentType;
  monthlyIncome: number;
  fixedExpenses: number;
  variableSpendHabits: VariableSpendHabits;
  totalSavings: number;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: string;
  targetAmount: number;
  targetDate: string;
  currentSaved: number;
  status: 'On Track' | 'At Risk' | 'Achieved';
  icon: string;
  createdAt: string;
}

export interface Expense {
  id?: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  isRecurring: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}
