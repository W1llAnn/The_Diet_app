export type Page =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot'
  | 'onboarding'
  | 'dashboard'
  | 'diary'
  | 'search'
  | 'product'
  | 'planner'
  | 'recipes'
  | 'medical'
  | 'ai'
  | 'progress'
  | 'achievements'
  | 'community'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'premium'
  | 'help'
  | 'about';

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
  category: string;
  healthScore: number;
  glycemicIndex?: number;
  allergens?: string[];
  vitamins?: string[];
  isFavorite?: boolean;
}

export interface MealEntry {
  id: string;
  food: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const sampleFoods: FoodItem[] = [
  { id: '1', name: 'Greek Yogurt', emoji: '🥛', calories: 100, protein: 17, carbs: 6, fat: 0.7, serving: '1 cup (245g)', category: 'Dairy', healthScore: 92, glycemicIndex: 12, vitamins: ['B12', 'Calcium', 'Probiotics'] },
  { id: '2', name: 'Avocado Toast', emoji: '🥑', calories: 280, protein: 8, carbs: 30, fat: 15, serving: '2 slices', category: 'Grains', healthScore: 85, glycemicIndex: 35, allergens: ['Gluten'], vitamins: ['K', 'E', 'Folate'] },
  { id: '3', name: 'Grilled Salmon', emoji: '🐟', calories: 367, protein: 40, carbs: 0, fat: 22, serving: '6 oz (170g)', category: 'Seafood', healthScore: 95, glycemicIndex: 0, vitamins: ['D', 'B12', 'Omega-3', 'Selenium'] },
  { id: '4', name: 'Quinoa Bowl', emoji: '🥗', calories: 222, protein: 8, carbs: 39, fat: 3.5, serving: '1 cup (185g)', category: 'Grains', healthScore: 90, glycemicIndex: 53, vitamins: ['Iron', 'Magnesium', 'Folate'] },
  { id: '5', name: 'Almonds', emoji: '🌰', calories: 164, protein: 6, carbs: 6, fat: 14, serving: '1 oz (28g)', category: 'Nuts', healthScore: 88, glycemicIndex: 15, allergens: ['Tree Nuts'], vitamins: ['E', 'Magnesium'] },
  { id: '6', name: 'Banana', emoji: '🍌', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: '1 medium', category: 'Fruits', healthScore: 78, glycemicIndex: 51, vitamins: ['B6', 'C', 'Potassium'] },
  { id: '7', name: 'Blueberries', emoji: '🫐', calories: 84, protein: 1.1, carbs: 21, fat: 0.5, serving: '1 cup (148g)', category: 'Fruits', healthScore: 95, glycemicIndex: 53, vitamins: ['C', 'K', 'Antioxidants'] },
  { id: '8', name: 'Oatmeal', emoji: '🥣', calories: 154, protein: 6, carbs: 27, fat: 3, serving: '1 cup cooked', category: 'Grains', healthScore: 87, glycemicIndex: 55, allergens: ['Gluten'], vitamins: ['Iron', 'Zinc', 'Fiber'] },
  { id: '9', name: 'Chicken Breast', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '3 oz (85g)', category: 'Protein', healthScore: 89, glycemicIndex: 0, vitamins: ['B6', 'Niacin', 'Selenium'] },
  { id: '10', name: 'Spinach Salad', emoji: '🥬', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: '1 cup (30g)', category: 'Vegetables', healthScore: 97, glycemicIndex: 15, vitamins: ['K', 'A', 'Iron', 'Folate'] },
  { id: '11', name: 'Brown Rice', emoji: '🍚', calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: '1 cup (195g)', category: 'Grains', healthScore: 82, glycemicIndex: 50, vitamins: ['B1', 'B3', 'Magnesium'] },
  { id: '12', name: 'Dark Chocolate', emoji: '🍫', calories: 170, protein: 2, carbs: 13, fat: 12, serving: '1 oz (28g)', category: 'Snacks', healthScore: 70, glycemicIndex: 23, allergens: ['Dairy'], vitamins: ['Iron', 'Magnesium'] },
];

export const foodCategories = [
  { name: 'Fruits', emoji: '🍎', color: 'bg-accent-50' },
  { name: 'Vegetables', emoji: '🥕', color: 'bg-primary-50' },
  { name: 'Protein', emoji: '🍗', color: 'bg-accent-50' },
  { name: 'Grains', emoji: '🌾', color: 'bg-info-50' },
  { name: 'Dairy', emoji: '🥛', color: 'bg-primary-50' },
  { name: 'Nuts', emoji: '🌰', color: 'bg-accent-50' },
  { name: 'Seafood', emoji: '🐟', color: 'bg-info-50' },
  { name: 'Snacks', emoji: '🍿', color: 'bg-primary-50' },
];

export const medicalConditions = [
  { id: 'diabetes', name: 'Diabetes', emoji: '🩸', description: 'Blood sugar management', color: 'bg-accent-50 text-accent-700' },
  { id: 'obesity', name: 'Obesity', emoji: '⚖️', description: 'Weight management', color: 'bg-primary-50 text-primary-700' },
  { id: 'hypertension', name: 'Hypertension', emoji: '❤️', description: 'Blood pressure control', color: 'bg-info-50 text-info-700' },
  { id: 'kidney', name: 'Kidney Disease', emoji: '🫘', description: 'Renal diet support', color: 'bg-accent-50 text-accent-700' },
  { id: 'digestive', name: 'Digestive Disorders', emoji: '🌿', description: 'Gut health support', color: 'bg-primary-50 text-primary-700' },
  { id: 'allergies', name: 'Food Allergies', emoji: '🚫', description: 'Allergen avoidance', color: 'bg-info-50 text-info-700' },
];

export const testimonials = [
  { name: 'Sarah M.', role: 'Teacher, 34', avatar: '👩', text: "Vivora changed how I think about food. I'm not restricting — I'm choosing. Lost 12 lbs in 3 months without feeling like I was on a diet.", rating: 5 },
  { name: 'James K.', role: 'Dad, 42', avatar: '👨', text: "As a diabetic, I was scared of food. Now I have a companion that helps me make smart choices. My A1C dropped from 7.8 to 6.4.", rating: 5 },
  { name: 'Lena T.', role: 'Student, 19', avatar: '👩‍🎓', text: "The AI assistant is like having a nutritionist in my pocket. It answers my questions without making me feel dumb. Love the mascot!", rating: 5 },
  { name: 'Robert H.', role: 'Retired, 68', avatar: '👴', text: "At my age, I needed something simple. Vivora is gentle and clear. My doctor was impressed with my last checkup.", rating: 5 },
  { name: 'Aisha P.', role: 'Designer, 28', avatar: '👩‍🎨', text: "Finally an app that feels human. No guilt, no shame. Just gentle nudges in the right direction. The meal plans are delicious.", rating: 5 },
  { name: 'Marco D.', role: 'Athlete, 26', avatar: '🏃', text: "Even as a pro athlete, I learned things about nutrition I didn't know. The macro tracking is precise and the AI advice is spot on.", rating: 5 },
];

export const faqs = [
  { q: 'Is Vivora free to use?', a: 'Yes! The core features — calorie tracking, food search, and the AI assistant — are free. Premium unlocks personalized meal plans, advanced analytics, and specialized medical nutrition support.' },
  { q: 'How does the AI nutrition assistant work?', a: 'Vivi, our AI, learns your goals, preferences, and any medical conditions. It then offers personalized advice, meal suggestions, and answers your nutrition questions in plain language — no judgment, just support.' },
  { q: 'Can Vivora help with my medical condition?', a: 'Absolutely. Vivora supports diabetes, obesity, hypertension, kidney disease, digestive disorders, and food allergies. Recommendations adapt to your condition and your doctor\'s guidance.' },
  { q: 'Will I feel restricted or guilty?', a: 'Never. Vivora is built on positive reinforcement. Instead of saying "you exceeded calories," Vivi suggests "let\'s balance your next meal." It\'s a companion, not a critic.' },
  { q: 'Is my data private and secure?', a: 'Your health data is encrypted and never sold. You can export or delete your data anytime. We follow HIPAA-aligned security practices.' },
  { q: 'Does Vivora sync with Apple Health or Google Fit?', a: 'Yes — Premium users can sync activity, weight, and water data with Apple Health and Google Fit. Smart scale and wearable integrations are coming soon.' },
];

export const landingFeatures = [
  { icon: '🤖', title: 'AI Nutrition Assistant', text: 'Ask anything, anytime. Vivi answers in plain language with personalized advice.' },
  { icon: '🥗', title: 'Smart Meal Planning', text: 'Get weekly meal plans tailored to your goals, tastes, and medical needs.' },
  { icon: '🔥', title: 'Gentle Calorie Tracking', text: 'Track without the guilt. Vivi celebrates progress, not perfection.' },
  { icon: '🩺', title: 'Medical Nutrition Support', text: 'Specialized guidance for diabetes, hypertension, allergies, and more.' },
  { icon: '📊', title: 'Beautiful Progress Charts', text: 'See your journey unfold with clear, motivating visuals.' },
  { icon: '🏆', title: 'Achievements & Streaks', text: 'Celebrate healthy habits with rewards that actually feel good.' },
];

export const recipes = [
  { id: 'r1', name: 'Mediterranean Buddha Bowl', emoji: '🥗', calories: 420, time: '20 min', difficulty: 'Easy', tags: ['Vegetarian', 'High Fiber'], healthScore: 95, ai: true },
  { id: 'r2', name: 'Salmon & Avocado Toast', emoji: '🥑', calories: 380, time: '15 min', difficulty: 'Easy', tags: ['High Protein', 'Omega-3'], healthScore: 92, ai: true },
  { id: 'r3', name: 'Berry Chia Pudding', emoji: '🫐', calories: 240, time: '10 min', difficulty: 'Easy', tags: ['Vegetarian', 'Low GI'], healthScore: 90, ai: false },
  { id: 'r4', name: 'Grilled Chicken Quinoa', emoji: '🍗', calories: 510, time: '30 min', difficulty: 'Medium', tags: ['High Protein', 'Gluten-Free'], healthScore: 94, ai: false },
  { id: 'r5', name: 'Sweet Potato Lentil Soup', emoji: '🍲', calories: 290, time: '40 min', difficulty: 'Easy', tags: ['Vegan', 'High Fiber'], healthScore: 93, ai: true },
  { id: 'r6', name: 'Greek Yogurt Parfait', emoji: ' parfait', calories: 220, time: '5 min', difficulty: 'Easy', tags: ['Vegetarian', 'Probiotics'], healthScore: 88, ai: false },
];

export const achievements = [
  { id: 'a1', name: 'First Step', emoji: '🌱', description: 'Complete your first day', unlocked: true, date: '2 days ago' },
  { id: 'a2', name: 'Hydration Hero', emoji: '💧', description: 'Drink 8 glasses of water for 7 days', unlocked: true, date: 'Yesterday' },
  { id: 'a3', name: 'Week Warrior', emoji: '⚔️', description: 'Log meals for 7 consecutive days', unlocked: true, date: 'Today' },
  { id: 'a4', name: 'Protein Pro', emoji: '💪', description: 'Hit protein goal for 14 days', unlocked: false, progress: 71 },
  { id: 'a5', name: 'Green Machine', emoji: '🥬', description: 'Eat 5 servings of veggies for 30 days', unlocked: false, progress: 40 },
  { id: 'a6', name: 'Early Bird', emoji: '🌅', description: 'Log breakfast before 9 AM for 10 days', unlocked: false, progress: 60 },
  { id: 'a7', name: 'Mindful Eater', emoji: '🧘', description: '30 days of balanced meals', unlocked: false, progress: 23 },
  { id: 'a8', name: 'Vivi\'s Best Friend', emoji: '💚', description: 'Chat with Vivi 50 times', unlocked: false, progress: 34 },
];
