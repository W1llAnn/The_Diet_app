import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Leaf } from 'lucide-react';
import type { Page } from '@/App';
import Vivi from '@/components/Vivi';

interface OnboardingProps {
  onNavigate: (page: Page) => void;
}

const goals = [
  { id: 'lose', label: 'Lose weight', emoji: '⚖️' },
  { id: 'gain', label: 'Gain weight', emoji: '💪' },
  { id: 'maintain', label: 'Maintain weight', emoji: '🌱' },
  { id: 'build', label: 'Build muscle', emoji: '🏋️' },
  { id: 'energy', label: 'More energy', emoji: '⚡' },
  { id: 'health', label: 'Eat healthier', emoji: '🥗' },
  { id: 'manage', label: 'Manage a condition', emoji: '🩺' },
  { id: 'sleep', label: 'Better sleep', emoji: '😴' },
];

const activityLevels = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', factor: 1.2 },
  { id: 'light', label: 'Lightly active', desc: 'Exercise 1-3 days/week', factor: 1.375 },
  { id: 'moderate', label: 'Moderately active', desc: 'Exercise 3-5 days/week', factor: 1.55 },
  { id: 'very', label: 'Very active', desc: 'Exercise 6-7 days/week', factor: 1.725 },
  { id: 'extra', label: 'Extra active', desc: 'Hard daily exercise or job', factor: 1.9 },
];

const dietaryPrefs = [
  { id: 'none', label: 'No restrictions', emoji: '✅' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥕' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
  { id: 'keto', label: 'Keto', emoji: '🥑' },
  { id: 'paleo', label: 'Paleo', emoji: '🍖' },
  { id: 'halal', label: 'Halal', emoji: '☪️' },
  { id: 'kosher', label: 'Kosher', emoji: '✡️' },
];

const allergies = [
  'Gluten', 'Dairy', 'Eggs', 'Nuts', 'Peanuts', 'Shellfish', 'Soy', 'Sesame', 'Fish',
];

const conditions = [
  { id: 'diabetes', label: 'Diabetes', emoji: '🩸' },
  { id: 'obesity', label: 'Obesity', emoji: '⚖️' },
  { id: 'hypertension', label: 'Hypertension', emoji: '❤️' },
  { id: 'kidney', label: 'Kidney disease', emoji: '🫘' },
  { id: 'digestive', label: 'Digestive disorders', emoji: '🌿' },
  { id: 'pcos', label: 'PCOS', emoji: '🌸' },
  { id: 'cholesterol', label: 'High cholesterol', emoji: '🫀' },
  { id: 'none', label: 'None of these', emoji: '✅' },
];

const habits = [
  { id: 'water', label: 'Drink more water', emoji: '💧' },
  { id: 'breakfast', label: 'Eat breakfast daily', emoji: '🍳' },
  { id: 'veggies', label: 'More vegetables', emoji: '🥬' },
  { id: 'lesssugar', label: 'Reduce sugar', emoji: '🍬' },
  { id: 'cooking', label: 'Cook at home', emoji: '👨‍🍳' },
  { id: 'mindful', label: 'Mindful eating', emoji: '🧘' },
];

const steps = ['Welcome', 'Goals', 'About you', 'Body', 'Activity', 'Conditions', 'Allergies', 'Diet', 'Target', 'Habits'];

export default function Onboarding({ onNavigate }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    goals: [] as string[],
    gender: '',
    age: 28,
    height: 170,
    weight: 70,
    activity: '',
    conditions: [] as string[],
    allergies: [] as string[],
    diet: 'none',
    targetWeight: 68,
    habits: [] as string[],
  });

  const toggle = (key: 'goals' | 'conditions' | 'allergies' | 'habits', value: string) => {
    setData((d) => {
      const arr = d[key];
      return { ...d, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const next = () => (step < steps.length - 1 ? setStep(step + 1) : onNavigate('dashboard'));
  const back = () => (step > 0 ? setStep(step - 1) : onNavigate('register'));

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <header className="px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between border-b border-border bg-white/50 backdrop-blur safe-area-top">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold text-text-primary">Vivora</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-20 sm:w-32 lg:w-64 h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-text-secondary font-medium whitespace-nowrap">{step + 1}/{steps.length}</span>
        </div>
        <button onClick={() => onNavigate('dashboard')} className="text-sm text-text-secondary hover:text-primary flex-shrink-0">Skip</button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Vivi size={120} mood="waving" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Welcome to Vivora!</h1>
              <p className="text-lg text-text-secondary mt-4 max-w-md mx-auto leading-relaxed">
                I'm Vivi, your nutrition companion. Let's spend a few minutes getting to know you, so I can help you feel your best.
              </p>
              <div className="bg-white rounded-2xl p-5 mt-8 shadow-soft text-left max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Vivi size={40} mood="happy" animate={false} />
                  <p className="text-sm text-text-primary">This takes about 3 minutes. You can change anything later.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Goals */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">What are your goals?</h2>
              <p className="text-text-secondary mt-2">Pick all that resonate. We'll build your plan around them.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggle('goals', g.id)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.goals.includes(g.id) ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{g.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{g.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Gender */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">What's your gender?</h2>
              <p className="text-text-secondary mt-2">This helps us calculate your nutritional needs accurately.</p>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {[
                  { id: 'female', label: 'Female', emoji: '👩' },
                  { id: 'male', label: 'Male', emoji: '👨' },
                  { id: 'other', label: 'Other', emoji: '🧑' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setData({ ...data, gender: g.id })}
                    className={`p-4 sm:p-6 rounded-2xl border-2 transition-all text-center ${
                      data.gender === g.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-3xl sm:text-4xl mb-1.5 sm:mb-2">{g.emoji}</div>
                    <p className="text-sm font-medium text-text-primary">{g.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Age */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">How old are you?</h2>
              <p className="text-text-secondary mt-2">Your age affects your calorie and nutrient needs.</p>
              <div className="bg-white rounded-2xl p-8 mt-6 shadow-soft text-center">
                <p className="text-6xl font-bold text-primary">{data.age}</p>
                <p className="text-text-secondary mt-1">years old</p>
                <input
                  type="range"
                  min={13}
                  max={100}
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: +e.target.value })}
                  className="w-full mt-6"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                  <span>13</span><span>100</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Height & Weight */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Your body</h2>
              <p className="text-text-secondary mt-2">This stays private. We use it to personalize your plan.</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                  <p className="text-sm text-text-secondary">Height</p>
                  <p className="text-4xl font-bold text-primary mt-2">{data.height}<span className="text-lg text-text-secondary ml-1">cm</span></p>
                  <input type="range" min={120} max={220} value={data.height} onChange={(e) => setData({ ...data, height: +e.target.value })} className="w-full mt-4" />
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft text-center">
                  <p className="text-sm text-text-secondary">Weight</p>
                  <p className="text-4xl font-bold text-primary mt-2">{data.weight}<span className="text-lg text-text-secondary ml-1">kg</span></p>
                  <input type="range" min={30} max={200} value={data.weight} onChange={(e) => setData({ ...data, weight: +e.target.value })} className="w-full mt-4" />
                </div>
              </div>
              <div className="bg-primary-50 rounded-2xl p-4 mt-4 flex items-center gap-3">
                <Vivi size={36} mood="happy" animate={false} />
                <p className="text-sm text-text-primary">Your BMI is <span className="font-bold">{(data.weight / Math.pow(data.height / 100, 2)).toFixed(1)}</span> — that's a great starting point!</p>
              </div>
            </div>
          )}

          {/* Step 5: Activity */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">How active are you?</h2>
              <p className="text-text-secondary mt-2">Be honest — there's no wrong answer here.</p>
              <div className="space-y-3 mt-6">
                {activityLevels.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setData({ ...data, activity: a.id })}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      data.activity === a.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-text-primary">{a.label}</p>
                      <p className="text-sm text-text-secondary">{a.desc}</p>
                    </div>
                    {data.activity === a.id && <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"><Check size={14} className="text-white" /></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Conditions */}
          {step === 6 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Any medical conditions?</h2>
              <p className="text-text-secondary mt-2">This helps Vivi tailor recommendations. All optional.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {conditions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggle('conditions', c.id)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.conditions.includes(c.id) ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{c.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{c.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Allergies */}
          {step === 7 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Any food allergies?</h2>
              <p className="text-text-secondary mt-2">We'll make sure to flag these in every recommendation.</p>
              <div className="flex flex-wrap gap-2 mt-6">
                {allergies.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggle('allergies', a)}
                    className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                      data.allergies.includes(a) ? 'border-accent bg-accent-50 text-accent-700' : 'border-border bg-white text-text-primary hover:border-accent-200'
                    }`}
                  >
                    {data.allergies.includes(a) && '✓ '}{a}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: Diet */}
          {step === 8 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Dietary preferences?</h2>
              <p className="text-text-secondary mt-2">How do you like to eat? We'll respect it always.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {dietaryPrefs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setData({ ...data, diet: d.id })}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.diet === d.id ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{d.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{d.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 9: Target weight */}
          {step === 9 && (
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">What's your target weight?</h2>
              <p className="text-text-secondary mt-2">No rush — we'll get there gently, together.</p>
              <div className="bg-white rounded-2xl p-8 mt-6 shadow-soft text-center">
                <p className="text-6xl font-bold text-primary">{data.targetWeight}<span className="text-lg text-text-secondary ml-1">kg</span></p>
                <input type="range" min={40} max={180} value={data.targetWeight} onChange={(e) => setData({ ...data, targetWeight: +e.target.value })} className="w-full mt-6" />
                <p className="text-sm text-text-secondary mt-4">
                  That's <span className="font-bold text-primary">{Math.abs(data.weight - data.targetWeight)} kg</span> {data.targetWeight < data.weight ? 'to lose' : 'to gain'} — totally doable!
                </p>
              </div>
            </div>
          )}

          {/* Step 10: Habits */}
          {step === 10 && (
            <div>
              <div className="flex justify-center mb-4">
                <Vivi size={80} mood="excited" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">Let's build some habits!</h2>
              <p className="text-text-secondary mt-2">Pick a few daily habits you'd like to work on. Small steps, big change.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                {habits.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => toggle('habits', h.id)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all text-center ${
                      data.habits.includes(h.id) ? 'border-primary bg-primary-50' : 'border-border bg-white hover:border-primary-200'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">{h.emoji}</div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary">{h.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 sm:mt-8">
            <button onClick={back} className="btn-ghost flex items-center gap-2">
              <ArrowLeft size={18} /> Back
            </button>
            <button onClick={next} className="btn-primary flex items-center gap-2">
              {step === steps.length - 1 ? 'Enter Vivora' : 'Continue'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
