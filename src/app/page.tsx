"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Target, 
  Activity, 
  TrendingUp, 
  Calendar, 
  MessageCircle, 
  Users, 
  Crown, 
  Dumbbell, 
  Apple, 
  BarChart3, 
  Settings, 
  Bell, 
  Trophy, 
  Zap,
  Home,
  BookOpen,
  UserCheck,
  Clock,
  Heart,
  Flame,
  CheckCircle,
  Star,
  Play,
  Plus,
  ArrowRight,
  ArrowLeft,
  Timer,
  RotateCcw,
  Check,
  Camera,
  Send,
  LogIn,
  LogOut,
  Mail,
  Edit,
  Upload,
  Save,
  X
} from 'lucide-react'

interface UserProfile {
  name: string
  age: number
  weight: number
  height: number
  goal: string
  level: string
  preferences: string[]
  restrictions: string[]
  isLoggedIn: boolean
  loginMethod?: string
  email?: string
  profileImage?: string
}

interface WorkoutPlan {
  id: string
  name: string
  duration: string
  exercises: number
  difficulty: string
  type: string
  exerciseList: Exercise[]
  isCustom?: boolean
  createdBy?: string
}

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  rest: string
  instructions: string
  tips: string
  muscleGroup: string
}

interface MealPlan {
  id: string
  meal: string
  calories: number
  protein: number
  carbs: number
  fat: number
  foods: string[]
}

interface CommunityPost {
  id: string
  user: string
  time: string
  content: string
  likes: number
  comments: number
  type: 'workout' | 'progress' | 'general'
  workoutData?: {
    workoutName: string
    duration: string
    exercises: number
  }
  image?: string
}

// Função para salvar dados no localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

// Função para carregar dados do localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error)
    return defaultValue
  }
}

export default function PaulaoFit() {
  // Estados principais com persistência
  const [currentView, setCurrentView] = useState('home')
  const [isOnboarding, setIsOnboarding] = useState(() => loadFromStorage('paulao_onboarding', true))
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [isPremium, setIsPremium] = useState(() => loadFromStorage('paulao_premium', false))
  const [userProfile, setUserProfile] = useState<UserProfile>(() => 
    loadFromStorage('paulao_profile', {
      name: '',
      age: 0,
      weight: 0,
      height: 0,
      goal: '',
      level: '',
      preferences: [],
      restrictions: [],
      isLoggedIn: false,
      loginMethod: '',
      email: '',
      profileImage: ''
    })
  )

  // Estados para treino ativo
  const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutTimer, setWorkoutTimer] = useState(0)
  const [restTimer, setRestTimer] = useState(0)
  const [isResting, setIsResting] = useState(false)

  // Estados para publicações
  const [showNewPostDialog, setShowNewPostDialog] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostType, setNewPostType] = useState<'workout' | 'progress' | 'general'>('general')
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => 
    loadFromStorage('paulao_posts', [
      {
        id: '1',
        user: "Marina Silva",
        time: "2h atrás",
        content: "Acabei de completar meu primeiro mês no Paulão Fit! -4kg e muito mais disposição! 💪",
        likes: 23,
        comments: 8,
        type: 'progress'
      },
      {
        id: '2',
        user: "Carlos Mendes",
        time: "4h atrás", 
        content: "Treino de pernas hoje foi insano! Quem mais está sentindo as pernas tremerem? 😅",
        likes: 15,
        comments: 12,
        type: 'workout',
        workoutData: {
          workoutName: "Treino Legs",
          duration: "50 min",
          exercises: 9
        }
      },
      {
        id: '3',
        user: "Ana Costa",
        time: "6h atrás",
        content: "Receita de panqueca proteica que salvou meu café da manhã! Alguém quer a receita?",
        likes: 31,
        comments: 18,
        type: 'general'
      }
    ])
  )

  // Estados para criação de treinos
  const [showCreateWorkoutDialog, setShowCreateWorkoutDialog] = useState(false)
  const [newWorkoutName, setNewWorkoutName] = useState('')
  const [newWorkoutType, setNewWorkoutType] = useState('')
  const [newWorkoutDifficulty, setNewWorkoutDifficulty] = useState('')
  const [newWorkoutExercises, setNewWorkoutExercises] = useState<Exercise[]>([])
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false)
  const [newExercise, setNewExercise] = useState<Partial<Exercise>>({
    name: '',
    sets: 3,
    reps: '10-12',
    rest: '60s',
    instructions: '',
    tips: '',
    muscleGroup: ''
  })

  // Estados para foto de perfil
  const [showProfileImageDialog, setShowProfileImageDialog] = useState(false)
  const [profileImageUrl, setProfileImageUrl] = useState('')

  // Estados para dados dinâmicos
  const [progressData, setProgressData] = useState(() => 
    loadFromStorage('paulao_progress', {
      currentWeight: 78.5,
      goalWeight: 75,
      startWeight: 82,
      workoutsThisWeek: 4,
      caloriesConsumed: 1850,
      caloriesGoal: 2000,
      waterIntake: 2.1,
      waterGoal: 3.0
    })
  )

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(() => 
    loadFromStorage('paulao_workouts', [
      { 
        id: '1', 
        name: 'Treino Push (Peito, Ombro, Tríceps)', 
        duration: '45 min', 
        exercises: 8, 
        difficulty: 'Intermediário', 
        type: 'Academia',
        exerciseList: [
          {
            id: '1',
            name: 'Supino Reto com Barra',
            sets: 4,
            reps: '8-10',
            rest: '90s',
            instructions: 'Deite no banco, pegue a barra com pegada média, desça controladamente até o peito e empurre para cima.',
            tips: 'Mantenha os pés firmes no chão e contraia o core durante todo o movimento.',
            muscleGroup: 'Peito'
          },
          {
            id: '2',
            name: 'Desenvolvimento com Halteres',
            sets: 3,
            reps: '10-12',
            rest: '75s',
            instructions: 'Sentado, segure os halteres na altura dos ombros e empurre para cima até estender os braços.',
            tips: 'Evite arquear demais as costas. Mantenha o core contraído.',
            muscleGroup: 'Ombro'
          },
          {
            id: '3',
            name: 'Crucifixo Inclinado',
            sets: 3,
            reps: '12-15',
            rest: '60s',
            instructions: 'No banco inclinado, abra os braços em movimento de arco, sentindo o alongamento do peito.',
            tips: 'Controle o movimento na descida. Não deixe os halteres descerem muito.',
            muscleGroup: 'Peito'
          },
          {
            id: '4',
            name: 'Elevação Lateral',
            sets: 3,
            reps: '12-15',
            rest: '60s',
            instructions: 'Em pé, eleve os halteres lateralmente até a altura dos ombros.',
            tips: 'Mantenha uma leve flexão nos cotovelos. Controle o movimento.',
            muscleGroup: 'Ombro'
          },
          {
            id: '5',
            name: 'Tríceps Testa',
            sets: 3,
            reps: '10-12',
            rest: '60s',
            instructions: 'Deitado, flexione apenas os cotovelos, levando a barra em direção à testa.',
            tips: 'Mantenha os cotovelos fixos. Movimento apenas do antebraço.',
            muscleGroup: 'Tríceps'
          },
          {
            id: '6',
            name: 'Mergulho no Banco',
            sets: 3,
            reps: '8-12',
            rest: '75s',
            instructions: 'Apoie as mãos no banco atrás de você e desça o corpo flexionando os cotovelos.',
            tips: 'Mantenha o corpo próximo ao banco. Desça até sentir alongamento no peito.',
            muscleGroup: 'Tríceps'
          },
          {
            id: '7',
            name: 'Flexão de Braço',
            sets: 3,
            reps: 'Máximo',
            rest: '60s',
            instructions: 'Posição de prancha, desça o corpo até quase tocar o chão e empurre para cima.',
            tips: 'Mantenha o corpo alinhado. Se necessário, apoie os joelhos.',
            muscleGroup: 'Peito'
          },
          {
            id: '8',
            name: 'Tríceps Corda',
            sets: 3,
            reps: '12-15',
            rest: '60s',
            instructions: 'No cabo, puxe a corda para baixo estendendo completamente os braços.',
            tips: 'Mantenha os cotovelos colados ao corpo. Aperte o tríceps no final.',
            muscleGroup: 'Tríceps'
          }
        ]
      },
      { 
        id: '2', 
        name: 'Treino Pull (Costas, Bíceps)', 
        duration: '40 min', 
        exercises: 7, 
        difficulty: 'Intermediário', 
        type: 'Academia',
        exerciseList: [
          {
            id: '1',
            name: 'Puxada Frontal',
            sets: 4,
            reps: '8-10',
            rest: '90s',
            instructions: 'Puxe a barra até a altura do peito, contraindo as costas.',
            tips: 'Mantenha o peito estufado e os ombros para trás.',
            muscleGroup: 'Costas'
          },
          {
            id: '2',
            name: 'Remada Curvada',
            sets: 4,
            reps: '8-10',
            rest: '90s',
            instructions: 'Inclinado para frente, puxe a barra em direção ao abdômen.',
            tips: 'Mantenha as costas retas e contraia o core.',
            muscleGroup: 'Costas'
          },
          {
            id: '3',
            name: 'Rosca Direta',
            sets: 3,
            reps: '10-12',
            rest: '60s',
            instructions: 'Flexione os cotovelos levando a barra em direção ao peito.',
            tips: 'Mantenha os cotovelos fixos ao lado do corpo.',
            muscleGroup: 'Bíceps'
          },
          {
            id: '4',
            name: 'Puxada Alta',
            sets: 3,
            reps: '12-15',
            rest: '60s',
            instructions: 'Puxe o cabo de cima para baixo, contraindo as costas.',
            tips: 'Foque na contração das costas, não dos braços.',
            muscleGroup: 'Costas'
          },
          {
            id: '5',
            name: 'Rosca Martelo',
            sets: 3,
            reps: '10-12',
            rest: '60s',
            instructions: 'Com pegada neutra, flexione os cotovelos alternadamente.',
            tips: 'Movimento controlado, sem balançar o corpo.',
            muscleGroup: 'Bíceps'
          },
          {
            id: '6',
            name: 'Remada Unilateral',
            sets: 3,
            reps: '10-12',
            rest: '60s',
            instructions: 'Apoiado no banco, puxe o halter em direção ao quadril.',
            tips: 'Mantenha as costas retas e contraia bem no final.',
            muscleGroup: 'Costas'
          },
          {
            id: '7',
            name: 'Rosca Concentrada',
            sets: 3,
            reps: '12-15',
            rest: '60s',
            instructions: 'Sentado, apoie o cotovelo na coxa e flexione o braço.',
            tips: 'Movimento lento e controlado, foque na contração.',
            muscleGroup: 'Bíceps'
          }
        ]
      },
      { 
        id: '3', 
        name: 'Treino Legs (Pernas, Glúteos)', 
        duration: '50 min', 
        exercises: 9, 
        difficulty: 'Avançado', 
        type: 'Academia',
        exerciseList: [
          {
            id: '1',
            name: 'Agachamento Livre',
            sets: 4,
            reps: '8-10',
            rest: '2min',
            instructions: 'Desça até as coxas ficarem paralelas ao chão, mantendo as costas retas.',
            tips: 'Mantenha os joelhos alinhados com os pés. Desça controladamente.',
            muscleGroup: 'Quadríceps/Glúteos'
          },
          {
            id: '2',
            name: 'Leg Press 45°',
            sets: 4,
            reps: '12-15',
            rest: '90s',
            instructions: 'Empurre a plataforma com os pés na largura dos ombros.',
            tips: 'Desça até formar 90° nos joelhos. Não trave completamente.',
            muscleGroup: 'Quadríceps'
          },
          {
            id: '3',
            name: 'Stiff',
            sets: 4,
            reps: '10-12',
            rest: '90s',
            instructions: 'Desça a barra mantendo as pernas semi-flexionadas.',
            tips: 'Sinta o alongamento dos posteriores. Mantenha as costas retas.',
            muscleGroup: 'Posteriores'
          },
          {
            id: '4',
            name: 'Afundo',
            sets: 3,
            reps: '10 cada perna',
            rest: '75s',
            instructions: 'Dê um passo à frente e desça flexionando ambos os joelhos.',
            tips: 'Mantenha o tronco ereto. Alterne as pernas.',
            muscleGroup: 'Quadríceps/Glúteos'
          },
          {
            id: '5',
            name: 'Cadeira Extensora',
            sets: 3,
            reps: '12-15',
            rest: '60s',
            instructions: 'Estenda as pernas contraindo o quadríceps.',
            tips: 'Movimento controlado. Pause no topo da contração.',
            muscleGroup: 'Quadríceps'
          },
          {
            id: '6',
            name: 'Mesa Flexora',
            sets: 3,
            reps: '12-15',
            rest: '60s',
            instructions: 'Flexione as pernas levando os calcanhares em direção aos glúteos.',
            tips: 'Contraia bem os posteriores no final do movimento.',
            muscleGroup: 'Posteriores'
          },
          {
            id: '7',
            name: 'Elevação Pélvica',
            sets: 3,
            reps: '15-20',
            rest: '60s',
            instructions: 'Deitado, eleve o quadril contraindo os glúteos.',
            tips: 'Aperte bem os glúteos no topo. Pause por 1 segundo.',
            muscleGroup: 'Glúteos'
          },
          {
            id: '8',
            name: 'Panturrilha em Pé',
            sets: 4,
            reps: '15-20',
            rest: '45s',
            instructions: 'Eleve-se na ponta dos pés contraindo as panturrilhas.',
            tips: 'Amplitude completa. Pause no topo da contração.',
            muscleGroup: 'Panturrilhas'
          },
          {
            id: '9',
            name: 'Agachamento Búlgaro',
            sets: 3,
            reps: '10 cada perna',
            rest: '75s',
            instructions: 'Com o pé traseiro apoiado, desça flexionando a perna da frente.',
            tips: 'Foque na perna da frente. Mantenha o equilíbrio.',
            muscleGroup: 'Quadríceps/Glúteos'
          }
        ]
      },
      { 
        id: '4', 
        name: 'HIIT em Casa', 
        duration: '20 min', 
        exercises: 6, 
        difficulty: 'Iniciante', 
        type: 'Casa',
        exerciseList: [
          {
            id: '1',
            name: 'Burpees',
            sets: 4,
            reps: '30s trabalho / 30s descanso',
            rest: '30s',
            instructions: 'Agache, apoie as mãos, pule para trás, flexão, pule para frente, salte.',
            tips: 'Mantenha o ritmo constante. Respire adequadamente.',
            muscleGroup: 'Corpo todo'
          },
          {
            id: '2',
            name: 'Mountain Climbers',
            sets: 4,
            reps: '30s trabalho / 30s descanso',
            rest: '30s',
            instructions: 'Em posição de prancha, alterne os joelhos em direção ao peito.',
            tips: 'Mantenha o core contraído. Movimento rápido.',
            muscleGroup: 'Core/Cardio'
          },
          {
            id: '3',
            name: 'Jumping Jacks',
            sets: 4,
            reps: '30s trabalho / 30s descanso',
            rest: '30s',
            instructions: 'Salte abrindo pernas e braços simultaneamente.',
            tips: 'Aterrisse suavemente. Mantenha o ritmo.',
            muscleGroup: 'Cardio'
          },
          {
            id: '4',
            name: 'Agachamento com Salto',
            sets: 4,
            reps: '30s trabalho / 30s descanso',
            rest: '30s',
            instructions: 'Agache e salte explosivamente para cima.',
            tips: 'Aterrisse suavemente. Desça controladamente.',
            muscleGroup: 'Pernas'
          },
          {
            id: '5',
            name: 'Prancha',
            sets: 4,
            reps: '30s trabalho / 30s descanso',
            rest: '30s',
            instructions: 'Mantenha o corpo reto apoiado nos antebraços.',
            tips: 'Não deixe o quadril cair. Respire normalmente.',
            muscleGroup: 'Core'
          },
          {
            id: '6',
            name: 'High Knees',
            sets: 4,
            reps: '30s trabalho / 30s descanso',
            rest: '30s',
            instructions: 'Corra no lugar elevando os joelhos até a altura do quadril.',
            tips: 'Mantenha o tronco ereto. Movimento rápido.',
            muscleGroup: 'Cardio'
          }
        ]
      }
    ])
  )

  const [mealPlans] = useState<MealPlan[]>([
    { id: '1', meal: 'Café da Manhã', calories: 420, protein: 25, carbs: 45, fat: 12, foods: ['Ovos mexidos', 'Aveia', 'Banana', 'Café'] },
    { id: '2', meal: 'Almoço', calories: 650, protein: 45, carbs: 55, fat: 18, foods: ['Frango grelhado', 'Arroz integral', 'Brócolis', 'Salada'] },
    { id: '3', meal: 'Lanche', calories: 280, protein: 20, carbs: 25, fat: 8, foods: ['Whey protein', 'Banana', 'Pasta de amendoim'] },
    { id: '4', meal: 'Jantar', calories: 580, protein: 40, carbs: 35, fat: 22, foods: ['Salmão', 'Batata doce', 'Aspargos', 'Azeite'] }
  ])

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWorkoutActive && !isResting) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWorkoutActive, isResting])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isResting, restTimer])

  // Salvar dados automaticamente quando mudarem
  useEffect(() => {
    saveToStorage('paulao_profile', userProfile)
  }, [userProfile])

  useEffect(() => {
    saveToStorage('paulao_premium', isPremium)
  }, [isPremium])

  useEffect(() => {
    saveToStorage('paulao_progress', progressData)
  }, [progressData])

  useEffect(() => {
    saveToStorage('paulao_onboarding', isOnboarding)
  }, [isOnboarding])

  useEffect(() => {
    saveToStorage('paulao_posts', communityPosts)
  }, [communityPosts])

  useEffect(() => {
    saveToStorage('paulao_workouts', workoutPlans)
  }, [workoutPlans])

  // Funções estáveis para inputs (usando useCallback com dependências corretas)
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserProfile(prev => ({ ...prev, name: value }))
  }, [])

  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserProfile(prev => ({ ...prev, age: parseInt(value) || 0 }))
  }, [])

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserProfile(prev => ({ ...prev, weight: parseInt(value) || 0 }))
  }, [])

  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserProfile(prev => ({ ...prev, height: parseInt(value) || 0 }))
  }, [])

  const handleGoalChange = useCallback((value: string) => {
    setUserProfile(prev => ({ ...prev, goal: value }))
  }, [])

  const handleLevelChange = useCallback((value: string) => {
    setUserProfile(prev => ({ ...prev, level: value }))
  }, [])

  const togglePreference = useCallback((pref: string) => {
    setUserProfile(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }))
  }, [])

  const handleOnboardingComplete = useCallback(() => {
    setIsOnboarding(false)
    setCurrentView('home')
  }, [])

  const nextStep = useCallback(() => {
    setOnboardingStep(prev => Math.min(prev + 1, 4))
  }, [])

  const prevStep = useCallback(() => {
    setOnboardingStep(prev => Math.max(prev - 1, 1))
  }, [])

  // Funções de login
  const handleGoogleLogin = useCallback(() => {
    // Simulação de login com Google
    setUserProfile(prev => ({
      ...prev,
      isLoggedIn: true,
      loginMethod: 'Google',
      email: 'usuario@gmail.com',
      name: prev.name || 'Usuário Google'
    }))
    alert('Login realizado com sucesso! 🎉')
  }, [])

  const handleLogout = useCallback(() => {
    setUserProfile(prev => ({
      ...prev,
      isLoggedIn: false,
      loginMethod: '',
      email: ''
    }))
    alert('Logout realizado com sucesso!')
  }, [])

  // Funções para foto de perfil
  const handleProfileImageUpload = useCallback(() => {
    if (!profileImageUrl.trim()) {
      alert('Por favor, insira uma URL válida para a imagem!')
      return
    }

    // Validar se é uma URL válida
    try {
      new URL(profileImageUrl)
      setUserProfile(prev => ({
        ...prev,
        profileImage: profileImageUrl
      }))
      setProfileImageUrl('')
      setShowProfileImageDialog(false)
      alert('Foto de perfil atualizada com sucesso! 📸')
    } catch {
      alert('URL inválida! Por favor, insira uma URL válida.')
    }
  }, [profileImageUrl])

  const removeProfileImage = useCallback(() => {
    setUserProfile(prev => ({
      ...prev,
      profileImage: ''
    }))
    alert('Foto de perfil removida!')
  }, [])

  // Funções para treino
  const startWorkout = useCallback((workoutId: string) => {
    const workout = workoutPlans.find(w => w.id === workoutId)
    if (workout) {
      setActiveWorkout(workout)
      setCurrentExerciseIndex(0)
      setIsWorkoutActive(true)
      setWorkoutTimer(0)
      setCurrentView('workout')
    }
  }, [workoutPlans])

  const nextExercise = useCallback(() => {
    if (activeWorkout && currentExerciseIndex < activeWorkout.exerciseList.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      setIsResting(false)
      setRestTimer(0)
    }
  }, [activeWorkout, currentExerciseIndex])

  const prevExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1)
      setIsResting(false)
      setRestTimer(0)
    }
  }, [currentExerciseIndex])

  const startRest = useCallback(() => {
    if (activeWorkout) {
      const currentExercise = activeWorkout.exerciseList[currentExerciseIndex]
      const restTime = parseInt(currentExercise.rest.replace(/\D/g, '')) || 60
      setRestTimer(restTime)
      setIsResting(true)
    }
  }, [activeWorkout, currentExerciseIndex])

  const finishWorkout = useCallback(() => {
    setProgressData(prev => ({
      ...prev,
      workoutsThisWeek: Math.min(prev.workoutsThisWeek + 1, 7)
    }))
    
    // Criar post automático do treino
    if (activeWorkout && userProfile.isLoggedIn) {
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        user: userProfile.name || 'Usuário',
        time: 'Agora',
        content: `Acabei de completar o ${activeWorkout.name}! 💪 Que treino incrível!`,
        likes: 0,
        comments: 0,
        type: 'workout',
        workoutData: {
          workoutName: activeWorkout.name,
          duration: Math.floor(workoutTimer / 60) + ' min',
          exercises: activeWorkout.exercises
        }
      }
      setCommunityPosts(prev => [newPost, ...prev])
    }
    
    setActiveWorkout(null)
    setIsWorkoutActive(false)
    setWorkoutTimer(0)
    setCurrentExerciseIndex(0)
    setCurrentView('home')
    alert('Treino concluído! Parabéns! 💪')
  }, [activeWorkout, workoutTimer, userProfile])

  // Funções para criação de treinos
  const createCustomWorkout = useCallback(() => {
    if (!userProfile.isLoggedIn) {
      alert('Faça login para criar treinos personalizados!')
      return
    }

    if (!newWorkoutName.trim() || !newWorkoutType || !newWorkoutDifficulty || newWorkoutExercises.length === 0) {
      alert('Preencha todos os campos e adicione pelo menos um exercício!')
      return
    }

    const newWorkout: WorkoutPlan = {
      id: Date.now().toString(),
      name: newWorkoutName,
      duration: `${newWorkoutExercises.length * 3} min`,
      exercises: newWorkoutExercises.length,
      difficulty: newWorkoutDifficulty,
      type: newWorkoutType,
      exerciseList: newWorkoutExercises,
      isCustom: true,
      createdBy: userProfile.name
    }

    setWorkoutPlans(prev => [newWorkout, ...prev])
    
    // Reset form
    setNewWorkoutName('')
    setNewWorkoutType('')
    setNewWorkoutDifficulty('')
    setNewWorkoutExercises([])
    setShowCreateWorkoutDialog(false)
    
    alert('Treino personalizado criado com sucesso! 🎯')
  }, [userProfile, newWorkoutName, newWorkoutType, newWorkoutDifficulty, newWorkoutExercises])

  const addExerciseToWorkout = useCallback(() => {
    if (!newExercise.name || !newExercise.muscleGroup || !newExercise.instructions) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name!,
      sets: newExercise.sets || 3,
      reps: newExercise.reps || '10-12',
      rest: newExercise.rest || '60s',
      instructions: newExercise.instructions!,
      tips: newExercise.tips || '',
      muscleGroup: newExercise.muscleGroup!
    }

    setNewWorkoutExercises(prev => [...prev, exercise])
    
    // Reset exercise form
    setNewExercise({
      name: '',
      sets: 3,
      reps: '10-12',
      rest: '60s',
      instructions: '',
      tips: '',
      muscleGroup: ''
    })
    setShowAddExerciseDialog(false)
    
    alert('Exercício adicionado ao treino! ✅')
  }, [newExercise])

  const removeExerciseFromWorkout = useCallback((exerciseId: string) => {
    setNewWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId))
  }, [])

  // Funções para publicações
  const createPost = useCallback(() => {
    if (!userProfile.isLoggedIn) {
      alert('Faça login para criar publicações!')
      return
    }
    
    if (!newPostContent.trim()) {
      alert('Escreva algo para publicar!')
      return
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      user: userProfile.name || 'Usuário',
      time: 'Agora',
      content: newPostContent,
      likes: 0,
      comments: 0,
      type: newPostType
    }

    setCommunityPosts(prev => [newPost, ...prev])
    setNewPostContent('')
    setShowNewPostDialog(false)
    alert('Post publicado com sucesso! 🎉')
  }, [userProfile, newPostContent, newPostType])

  const likePost = useCallback((postId: string) => {
    setCommunityPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    )
  }, [])

  // Funções para ações funcionais
  const addWaterIntake = useCallback(() => {
    setProgressData(prev => ({
      ...prev,
      waterIntake: Math.min(prev.waterIntake + 0.25, prev.waterGoal)
    }))
  }, [])

  const logCalories = useCallback((calories: number) => {
    setProgressData(prev => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + calories
    }))
  }, [])

  const completeWorkout = useCallback(() => {
    setProgressData(prev => ({
      ...prev,
      workoutsThisWeek: Math.min(prev.workoutsThisWeek + 1, 7)
    }))
    alert('Treino concluído! Parabéns! 💪')
  }, [])

  const upgradeToPremiun = useCallback(() => {
    setIsPremium(true)
    alert('Bem-vindo ao Paulão Fit Premium! 👑')
  }, [])

  // Função para formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Componente de Onboarding com inputs estáveis
  const OnboardingFlow = useMemo(() => {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Dumbbell className="h-8 w-8 text-[#00ff41] mr-2" />
              <h1 className="text-2xl font-bold text-[#00ff41]">Paulão Fit</h1>
            </div>
            <CardTitle className="text-white">Vamos começar sua jornada!</CardTitle>
            <CardDescription className="text-gray-400">
              Passo {onboardingStep} de 4
            </CardDescription>
            <Progress value={(onboardingStep / 4) * 100} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">Nome</Label>
                  <Input 
                    id="name" 
                    placeholder="Seu nome"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={userProfile.name}
                    onChange={handleNameChange}
                    autoComplete="off"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age" className="text-white">Idade</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="25"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={userProfile.age || ''}
                      onChange={handleAgeChange}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-white">Peso (kg)</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      placeholder="70"
                      className="bg-gray-800 border-gray-700 text-white"
                      value={userProfile.weight || ''}
                      onChange={handleWeightChange}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="height" className="text-white">Altura (cm)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    placeholder="175"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={userProfile.height || ''}
                    onChange={handleHeightChange}
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Qual seu objetivo principal?</Label>
                  <Select value={userProfile.goal} onValueChange={handleGoalChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione seu objetivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                      <SelectItem value="ganho-massa">Ganho de Massa Muscular</SelectItem>
                      <SelectItem value="performance">Melhora de Performance</SelectItem>
                      <SelectItem value="saude">Saúde e Bem-estar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Qual seu nível de experiência?</Label>
                  <Select value={userProfile.level} onValueChange={handleLevelChange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione seu nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Preferências alimentares</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['Vegetariano', 'Vegano', 'Low Carb', 'Sem Glúten', 'Sem Lactose', 'Flexível'].map((pref) => (
                      <Button
                        key={pref}
                        variant={userProfile.preferences.includes(pref) ? "default" : "outline"}
                        size="sm"
                        className={userProfile.preferences.includes(pref) 
                          ? "bg-[#00ff41] text-black hover:bg-[#00cc33]" 
                          : "border-gray-700 text-white hover:bg-gray-800"
                        }
                        onClick={() => togglePreference(pref)}
                      >
                        {pref}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="bg-gradient-to-r from-[#00ff41] to-[#00cc33] p-6 rounded-lg">
                  <Trophy className="h-12 w-12 text-black mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">Perfil Criado!</h3>
                  <p className="text-black/80">
                    Agora vamos gerar seus planos personalizados com IA
                  </p>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Gerando plano de dieta...</span>
                    <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Criando treinos personalizados...</span>
                    <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Configurando metas...</span>
                    <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {onboardingStep > 1 && (
                <Button variant="outline" onClick={prevStep} className="border-gray-700 text-white hover:bg-gray-800">
                  Voltar
                </Button>
              )}
              <Button 
                onClick={onboardingStep === 4 ? handleOnboardingComplete : nextStep}
                className="bg-[#00ff41] text-black hover:bg-[#00cc33] ml-auto"
              >
                {onboardingStep === 4 ? 'Começar!' : 'Próximo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }, [onboardingStep, userProfile, handleNameChange, handleAgeChange, handleWeightChange, handleHeightChange, handleGoalChange, handleLevelChange, togglePreference, handleOnboardingComplete, nextStep, prevStep])

  const Navigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 md:relative md:bg-transparent md:border-0 md:p-0">
      <div className="flex justify-around md:justify-start md:space-x-6">
        {[
          { id: 'home', icon: Home, label: 'Início' },
          { id: 'plans', icon: BookOpen, label: 'Planos' },
          { id: 'community', icon: Users, label: 'Comunidade' },
          { id: 'progress', icon: BarChart3, label: 'Progresso' },
          { id: 'profile', icon: User, label: 'Perfil' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentView(id)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              currentView === id 
                ? 'text-[#00ff41] bg-gray-800' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // Componente de Treino Ativo
  const WorkoutView = () => {
    if (!activeWorkout) return null

    const currentExercise = activeWorkout.exerciseList[currentExerciseIndex]
    const progress = ((currentExerciseIndex + 1) / activeWorkout.exerciseList.length) * 100

    return (
      <div className="space-y-6">
        {/* Header do Treino */}
        <div className="bg-gradient-to-r from-[#00ff41]/20 to-[#00cc33]/20 p-6 rounded-2xl border border-[#00ff41]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{activeWorkout.name}</h2>
              <p className="text-gray-400">Exercício {currentExerciseIndex + 1} de {activeWorkout.exerciseList.length}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#00ff41]">{formatTime(workoutTimer)}</div>
              <p className="text-sm text-gray-400">Tempo total</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Timer de Descanso */}
        {isResting && (
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700/50">
            <CardContent className="p-6 text-center">
              <Timer className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Descanso</h3>
              <div className="text-4xl font-bold text-blue-400 mb-4">{formatTime(restTimer)}</div>
              <Button 
                onClick={() => setIsResting(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Pular Descanso
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Exercício Atual */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl">{currentExercise.name}</CardTitle>
              <Badge className="bg-[#00ff41] text-black">{currentExercise.muscleGroup}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informações do Exercício */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold text-[#00ff41]">{currentExercise.sets}</div>
                <div className="text-sm text-gray-400">Séries</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold text-[#00ff41]">{currentExercise.reps}</div>
                <div className="text-sm text-gray-400">Repetições</div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold text-[#00ff41]">{currentExercise.rest}</div>
                <div className="text-sm text-gray-400">Descanso</div>
              </div>
            </div>

            {/* Instruções */}
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-white mb-2">📋 Instruções:</h4>
                <p className="text-gray-300 text-sm">{currentExercise.instructions}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">💡 Dicas:</h4>
                <p className="text-gray-300 text-sm">{currentExercise.tips}</p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={prevExercise}
                disabled={currentExerciseIndex === 0}
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button 
                onClick={startRest}
                disabled={isResting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Timer className="h-4 w-4 mr-2" />
                Descansar
              </Button>
              <Button 
                onClick={nextExercise}
                disabled={currentExerciseIndex === activeWorkout.exerciseList.length - 1}
                className="flex-1 bg-[#00ff41] text-black hover:bg-[#00cc33]"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Exercícios */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Lista de Exercícios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeWorkout.exerciseList.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentExerciseIndex 
                      ? 'bg-[#00ff41]/20 border border-[#00ff41]/30' 
                      : index < currentExerciseIndex
                      ? 'bg-green-900/20 border border-green-700/30'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => setCurrentExerciseIndex(index)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === currentExerciseIndex 
                        ? 'bg-[#00ff41] text-black' 
                        : index < currentExerciseIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {index < currentExerciseIndex ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{exercise.name}</h4>
                      <p className="text-sm text-gray-400">{exercise.sets} séries • {exercise.reps} reps</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {exercise.muscleGroup}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Botões de Controle */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setActiveWorkout(null)
              setIsWorkoutActive(false)
              setCurrentView('plans')
            }}
            className="flex-1 border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Planos
          </Button>
          <Button 
            onClick={finishWorkout}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Finalizar Treino
          </Button>
        </div>
      </div>
    )
  }

  const HomeView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Olá, {userProfile.name || 'Paulão'}! 💪</h2>
            <p className="text-gray-400">Vamos treinar hoje?</p>
            {userProfile.isLoggedIn && (
              <p className="text-sm text-[#00ff41]">Logado via {userProfile.loginMethod}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!userProfile.isLoggedIn && (
              <Button 
                onClick={handleGoogleLogin}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login Google
              </Button>
            )}
            {!isPremium && (
              <Button 
                onClick={upgradeToPremiun}
                className="bg-gradient-to-r from-[#00ff41] to-[#00cc33] text-black hover:from-[#00cc33] hover:to-[#00aa2a]"
              >
                <Crown className="h-4 w-4 mr-2" />
                Premium
              </Button>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Calorias</p>
                <p className="font-bold text-white">{progressData.caloriesConsumed}/{progressData.caloriesGoal}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-[#00ff41]" />
              <div>
                <p className="text-sm text-gray-400">Treinos</p>
                <p className="font-bold text-white">{progressData.workoutsThisWeek}/5</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg cursor-pointer" onClick={addWaterIntake}>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Água (clique +)</p>
                <p className="font-bold text-white">{progressData.waterIntake}L/{progressData.waterGoal}L</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-400">Peso</p>
                <p className="font-bold text-white">{progressData.currentWeight}kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Workout */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-[#00ff41]" />
            Treino de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-[#00ff41]/10 to-[#00cc33]/10 p-4 rounded-lg border border-[#00ff41]/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Treino Push (Peito, Ombro, Tríceps)</h3>
              <Badge className="bg-[#00ff41] text-black">Intermediário</Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />45 min</span>
              <span className="flex items-center"><Activity className="h-4 w-4 mr-1" />8 exercícios</span>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-[#00ff41] text-black hover:bg-[#00cc33]"
                onClick={() => startWorkout('1')}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Treino
              </Button>
              <Button 
                variant="outline" 
                className="border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black"
                onClick={completeWorkout}
              >
                Concluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Apple className="h-5 w-5 mr-2 text-[#00ff41]" />
            Refeições de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mealPlans.slice(0, 2).map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">{meal.meal}</h4>
                  <p className="text-sm text-gray-400">{meal.calories} kcal • {meal.protein}g proteína</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-gray-700 text-white hover:bg-gray-700"
                  onClick={() => logCalories(meal.calories)}
                >
                  Consumir
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full border-gray-700 text-white hover:bg-gray-800"
              onClick={() => setCurrentView('plans')}
            >
              Ver Todas as Refeições
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Coach */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-purple-400" />
            IA Coach Paulão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black/30 p-4 rounded-lg mb-4">
            <p className="text-white text-sm mb-2">💡 <strong>Dica do dia:</strong></p>
            <p className="text-gray-300 text-sm">
              "Lembre-se de beber água antes, durante e após o treino. Hidratação adequada melhora sua performance em até 15%!"
            </p>
          </div>
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => alert('Chat com IA Coach em breve! 🤖')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversar com o Coach
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const PlansView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Seus Planos</h2>
        <Dialog open={showCreateWorkoutDialog} onOpenChange={setShowCreateWorkoutDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#00ff41] text-black hover:bg-[#00cc33]"
              disabled={!userProfile.isLoggedIn}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Treino
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Treino Personalizado</DialogTitle>
              <DialogDescription className="text-gray-400">
                Crie seu próprio treino com exercícios personalizados
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Nome do Treino</Label>
                  <Input
                    placeholder="Ex: Meu Treino de Peito"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={newWorkoutName}
                    onChange={(e) => setNewWorkoutName(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-white">Tipo</Label>
                  <Select value={newWorkoutType} onValueChange={setNewWorkoutType}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Academia">Academia</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Funcional">Funcional</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-white">Dificuldade</Label>
                <Select value={newWorkoutDifficulty} onValueChange={setNewWorkoutDifficulty}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Exercícios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">Exercícios ({newWorkoutExercises.length})</Label>
                  <Dialog open={showAddExerciseDialog} onOpenChange={setShowAddExerciseDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-[#00ff41] text-black hover:bg-[#00cc33]">
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800">
                      <DialogHeader>
                        <DialogTitle className="text-white">Adicionar Exercício</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-white">Nome do Exercício *</Label>
                          <Input
                            placeholder="Ex: Supino Reto"
                            className="bg-gray-800 border-gray-700 text-white"
                            value={newExercise.name || ''}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-white">Séries</Label>
                            <Input
                              type="number"
                              placeholder="3"
                              className="bg-gray-800 border-gray-700 text-white"
                              value={newExercise.sets || ''}
                              onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                            />
                          </div>
                          <div>
                            <Label className="text-white">Repetições</Label>
                            <Input
                              placeholder="10-12"
                              className="bg-gray-800 border-gray-700 text-white"
                              value={newExercise.reps || ''}
                              onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label className="text-white">Descanso</Label>
                            <Input
                              placeholder="60s"
                              className="bg-gray-800 border-gray-700 text-white"
                              value={newExercise.rest || ''}
                              onChange={(e) => setNewExercise(prev => ({ ...prev, rest: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-white">Grupo Muscular *</Label>
                          <Select value={newExercise.muscleGroup || ''} onValueChange={(value) => setNewExercise(prev => ({ ...prev, muscleGroup: value }))}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                              <SelectValue placeholder="Selecione o grupo muscular" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="Peito">Peito</SelectItem>
                              <SelectItem value="Costas">Costas</SelectItem>
                              <SelectItem value="Ombro">Ombro</SelectItem>
                              <SelectItem value="Bíceps">Bíceps</SelectItem>
                              <SelectItem value="Tríceps">Tríceps</SelectItem>
                              <SelectItem value="Quadríceps">Quadríceps</SelectItem>
                              <SelectItem value="Posteriores">Posteriores</SelectItem>
                              <SelectItem value="Glúteos">Glúteos</SelectItem>
                              <SelectItem value="Panturrilhas">Panturrilhas</SelectItem>
                              <SelectItem value="Core">Core</SelectItem>
                              <SelectItem value="Cardio">Cardio</SelectItem>
                              <SelectItem value="Corpo todo">Corpo todo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white">Instruções *</Label>
                          <Textarea
                            placeholder="Como executar o exercício..."
                            className="bg-gray-800 border-gray-700 text-white"
                            value={newExercise.instructions || ''}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, instructions: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label className="text-white">Dicas</Label>
                          <Textarea
                            placeholder="Dicas para melhor execução..."
                            className="bg-gray-800 border-gray-700 text-white"
                            value={newExercise.tips || ''}
                            onChange={(e) => setNewExercise(prev => ({ ...prev, tips: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddExerciseDialog(false)}
                            className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={addExerciseToWorkout}
                            className="flex-1 bg-[#00ff41] text-black hover:bg-[#00cc33]"
                          >
                            Adicionar Exercício
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {newWorkoutExercises.map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                      <div>
                        <span className="text-white text-sm font-medium">{exercise.name}</span>
                        <span className="text-gray-400 text-xs ml-2">
                          {exercise.sets}x{exercise.reps} • {exercise.muscleGroup}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeExerciseFromWorkout(exercise.id)}
                        className="border-red-700 text-red-400 hover:bg-red-900"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {newWorkoutExercises.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Nenhum exercício adicionado ainda
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateWorkoutDialog(false)}
                  className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={createCustomWorkout}
                  className="flex-1 bg-[#00ff41] text-black hover:bg-[#00cc33]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Criar Treino
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!userProfile.isLoggedIn && (
        <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-700/50">
          <CardContent className="p-4 text-center">
            <LogIn className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white mb-2">Faça login para criar treinos</h3>
            <p className="text-gray-300 text-sm mb-4">
              Entre com sua conta Google para criar treinos personalizados
            </p>
            <Button 
              onClick={handleGoogleLogin}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login com Google
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="workouts" className="data-[state=active]:bg-[#00ff41] data-[state=active]:text-black">
            Treinos
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="data-[state=active]:bg-[#00ff41] data-[state=active]:text-black">
            Nutrição
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="space-y-4">
          {workoutPlans.map((workout) => (
            <Card key={workout.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{workout.name}</h3>
                    {workout.isCustom && (
                      <p className="text-xs text-[#00ff41]">Criado por {workout.createdBy}</p>
                    )}
                  </div>
                  <Badge variant={workout.difficulty === 'Avançado' ? 'destructive' : workout.difficulty === 'Intermediário' ? 'default' : 'secondary'}>
                    {workout.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{workout.duration}</span>
                  <span className="flex items-center"><Activity className="h-4 w-4 mr-1" />{workout.exercises} exercícios</span>
                  <span className="flex items-center"><Dumbbell className="h-4 w-4 mr-1" />{workout.type}</span>
                </div>
                
                {/* Preview dos exercícios */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Exercícios:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {workout.exerciseList.slice(0, 4).map((exercise, index) => (
                      <div key={exercise.id} className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
                        {index + 1}. {exercise.name} - {exercise.sets}x{exercise.reps}
                      </div>
                    ))}
                    {workout.exerciseList.length > 4 && (
                      <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded text-center">
                        +{workout.exerciseList.length - 4} mais exercícios
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#00ff41] text-black hover:bg-[#00cc33]"
                  onClick={() => startWorkout(workout.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Treino
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
            <h3 className="font-semibold text-white mb-4">Plano Nutricional - Hoje</h3>
            <div className="space-y-3">
              {mealPlans.map((meal) => (
                <div key={meal.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{meal.meal}</h4>
                    <span className="text-sm text-[#00ff41] font-semibold">{meal.calories} kcal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-3">
                    <span>Proteína: {meal.protein}g</span>
                    <span>Carbs: {meal.carbs}g</span>
                    <span>Gordura: {meal.fat}g</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {meal.foods.map((food, index) => (
                      <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                        {food}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-[#00ff41] text-black hover:bg-[#00cc33]"
                    onClick={() => logCalories(meal.calories)}
                  >
                    Marcar como Consumido
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4 bg-[#00ff41] text-black hover:bg-[#00cc33]"
              onClick={() => alert('Lista de compras gerada! 📝')}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Gerar Lista de Compras
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  const ProgressView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Seu Progresso</h2>

      {/* Weight Progress */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00ff41]" />
            Evolução do Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Peso inicial: {progressData.startWeight}kg</span>
              <span className="text-gray-400">Meta: {progressData.goalWeight}kg</span>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-[#00ff41] mb-2">{progressData.currentWeight}kg</div>
              <div className="text-sm text-gray-400">Peso atual</div>
              <div className="text-sm text-[#00ff41] mt-1">
                -{(progressData.startWeight - progressData.currentWeight).toFixed(1)}kg perdidos
              </div>
            </div>
            <Progress 
              value={((progressData.startWeight - progressData.currentWeight) / (progressData.startWeight - progressData.goalWeight)) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Treinos da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00ff41] mb-2">{progressData.workoutsThisWeek}/5</div>
              <Progress value={(progressData.workoutsThisWeek / 5) * 100} className="mb-2" />
              <p className="text-sm text-gray-400">Meta semanal</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Hidratação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{progressData.waterIntake}L</div>
              <Progress value={(progressData.waterIntake / progressData.waterGoal) * 100} className="mb-2" />
              <p className="text-sm text-gray-400">Meta: {progressData.waterGoal}L/dia</p>
              <Button 
                size="sm" 
                className="mt-2 bg-blue-600 hover:bg-blue-700"
                onClick={addWaterIntake}
              >
                + 250ml
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
            Conquistas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
              <div className="bg-yellow-500 p-2 rounded-full">
                <Star className="h-4 w-4 text-black" />
              </div>
              <div>
                <h4 className="font-medium text-white">Primeira Semana Completa!</h4>
                <p className="text-sm text-gray-400">Completou 5 treinos em uma semana</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg">
              <div className="bg-blue-500 p-2 rounded-full">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Hidratação em Dia</h4>
                <p className="text-sm text-gray-400">7 dias consecutivos atingindo a meta de água</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const CommunityView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Comunidade Paulão Fit</h2>
        <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#00ff41] text-black hover:bg-[#00cc33]"
              disabled={!userProfile.isLoggedIn}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Nova Publicação</DialogTitle>
              <DialogDescription className="text-gray-400">
                Compartilhe seu progresso, treino ou dicas com a comunidade
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Tipo de publicação</Label>
                <Select value={newPostType} onValueChange={(value: 'workout' | 'progress' | 'general') => setNewPostType(value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="general">Geral</SelectItem>
                    <SelectItem value="workout">Treino</SelectItem>
                    <SelectItem value="progress">Progresso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Conteúdo</Label>
                <Textarea
                  placeholder="Compartilhe sua experiência..."
                  className="bg-gray-800 border-gray-700 text-white"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewPostDialog(false)}
                  className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={createPost}
                  className="flex-1 bg-[#00ff41] text-black hover:bg-[#00cc33]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!userProfile.isLoggedIn && (
        <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-700/50">
          <CardContent className="p-4 text-center">
            <LogIn className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white mb-2">Faça login para participar</h3>
            <p className="text-gray-300 text-sm mb-4">
              Entre com sua conta Google para criar publicações e interagir com a comunidade
            </p>
            <Button 
              onClick={handleGoogleLogin}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login com Google
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Challenge */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Zap className="h-5 w-5 mr-2 text-purple-400" />
            Desafio da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Desafio 30 Burpees</h3>
              <p className="text-gray-300 text-sm mb-4">
                Complete 30 burpees em uma sessão. Poste seu tempo e motive outros membros!
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">1.247 participantes</span>
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => alert('Desafio aceito! Boa sorte! 💪')}
                >
                  Participar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Feed da Comunidade</h3>
        
        {communityPosts.map((post) => (
          <Card key={post.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-[#00ff41] p-2 rounded-full">
                  <User className="h-4 w-4 text-black" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{post.user}</h4>
                  <p className="text-sm text-gray-400">{post.time}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-auto ${
                    post.type === 'workout' ? 'border-[#00ff41] text-[#00ff41]' :
                    post.type === 'progress' ? 'border-blue-400 text-blue-400' :
                    'border-gray-600 text-gray-300'
                  }`}
                >
                  {post.type === 'workout' ? '💪 Treino' : 
                   post.type === 'progress' ? '📈 Progresso' : '💬 Geral'}
                </Badge>
              </div>
              
              <p className="text-gray-300 mb-4">{post.content}</p>
              
              {post.workoutData && (
                <div className="bg-gray-800 p-3 rounded-lg mb-4">
                  <h5 className="font-medium text-white mb-1">{post.workoutData.workoutName}</h5>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{post.workoutData.duration}</span>
                    <span className="flex items-center"><Activity className="h-3 w-3 mr-1" />{post.workoutData.exercises} exercícios</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <button 
                  className="flex items-center space-x-1 hover:text-[#00ff41] transition-colors"
                  onClick={() => likePost(post.id)}
                >
                  <Heart className="h-4 w-4" />
                  <span>{post.likes}</span>
                </button>
                <button 
                  className="flex items-center space-x-1 hover:text-[#00ff41] transition-colors"
                  onClick={() => alert('Comentários em breve! 💬')}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.comments}</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const ProfileView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Perfil</h2>
        <div className="flex items-center space-x-2">
          {userProfile.isLoggedIn && (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-red-700 text-red-400 hover:bg-red-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
          <Button 
            variant="outline" 
            className="border-gray-700 text-white hover:bg-gray-800"
            onClick={() => alert('Configurações em breve! ⚙️')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Login Section */}
      {!userProfile.isLoggedIn && (
        <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <LogIn className="h-5 w-5 mr-2 text-red-400" />
              Faça Login
            </CardTitle>
            <CardDescription className="text-gray-400">
              Entre com sua conta para sincronizar seus dados e participar da comunidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGoogleLogin}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Continuar com Google
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Info */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              {userProfile.profileImage ? (
                <img 
                  src={userProfile.profileImage} 
                  alt="Foto de perfil" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#00ff41]"
                />
              ) : (
                <div className="bg-[#00ff41] p-4 rounded-full">
                  <User className="h-8 w-8 text-black" />
                </div>
              )}
              <Dialog open={showProfileImageDialog} onOpenChange={setShowProfileImageDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="absolute -bottom-1 -right-1 bg-gray-800 hover:bg-gray-700 p-1 h-6 w-6"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Alterar Foto de Perfil</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Cole a URL de uma imagem para usar como foto de perfil
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">URL da Imagem</Label>
                      <Input
                        placeholder="https://exemplo.com/minha-foto.jpg"
                        className="bg-gray-800 border-gray-700 text-white"
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                      />
                    </div>
                    {profileImageUrl && (
                      <div className="text-center">
                        <img 
                          src={profileImageUrl} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#00ff41]"
                          onError={() => alert('URL de imagem inválida!')}
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      {userProfile.profileImage && (
                        <Button 
                          variant="outline" 
                          onClick={removeProfileImage}
                          className="flex-1 border-red-700 text-red-400 hover:bg-red-900"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remover Foto
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => setShowProfileImageDialog(false)}
                        className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleProfileImageUpload}
                        className="flex-1 bg-[#00ff41] text-black hover:bg-[#00cc33]"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{userProfile.name || 'Paulão'}</h3>
              <p className="text-gray-400">{userProfile.goal || 'Objetivo não definido'}</p>
              {userProfile.isLoggedIn && (
                <p className="text-sm text-[#00ff41]">{userProfile.email}</p>
              )}
              {isPremium && (
                <Badge className="bg-gradient-to-r from-[#00ff41] to-[#00cc33] text-black mt-2">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00ff41]">{userProfile.age || 25}</div>
              <div className="text-sm text-gray-400">Anos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00ff41]">{userProfile.height || 175}</div>
              <div className="text-sm text-gray-400">cm</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00ff41]">{progressData.currentWeight}</div>
              <div className="text-sm text-gray-400">kg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00ff41]">{userProfile.level || 'Iniciante'}</div>
              <div className="text-sm text-gray-400">Nível</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-[#00ff41]/10 to-[#00cc33]/10 border-[#00ff41]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Crown className="h-5 w-5 mr-2 text-[#00ff41]" />
              Upgrade para Premium
            </CardTitle>
            <CardDescription className="text-gray-400">
              Desbloqueie todo o potencial do Paulão Fit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#00ff41] mb-2">R$ 29,90</div>
                  <div className="text-sm text-gray-400 mb-4">por mês</div>
                  <Button 
                    className="w-full bg-[#00ff41] text-black hover:bg-[#00cc33]"
                    onClick={upgradeToPremiun}
                  >
                    Assinar Mensal
                  </Button>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center border-2 border-[#00ff41]">
                  <div className="text-xs text-[#00ff41] mb-2">MAIS POPULAR</div>
                  <div className="text-2xl font-bold text-[#00ff41] mb-2">R$ 79,90</div>
                  <div className="text-sm text-gray-400 mb-4">trimestral</div>
                  <Button 
                    className="w-full bg-[#00ff41] text-black hover:bg-[#00cc33]"
                    onClick={upgradeToPremiun}
                  >
                    Assinar Trimestral
                  </Button>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#00ff41] mb-2">R$ 249,90</div>
                  <div className="text-sm text-gray-400 mb-4">anual</div>
                  <Button 
                    className="w-full bg-[#00ff41] text-black hover:bg-[#00cc33]"
                    onClick={upgradeToPremiun}
                  >
                    Assinar Anual
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  <span>Planos personalizados ilimitados com IA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  <span>Chat com IA Coach 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  <span>Acesso total à comunidade</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  <span>Relatórios detalhados de progresso</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-[#00ff41]" />
                  <span>Vídeos exclusivos e receitas premium</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Notificações</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-700 text-white hover:bg-gray-800"
              onClick={() => alert('Configurações de notificação em breve! 🔔')}
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
          <Separator className="bg-gray-800" />
          <div className="flex items-center justify-between">
            <span className="text-white">Modo Escuro</span>
            <div className="text-[#00ff41]">Ativado</div>
          </div>
          <Separator className="bg-gray-800" />
          <div className="flex items-center justify-between">
            <span className="text-white">Privacidade</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-700 text-white hover:bg-gray-800"
              onClick={() => alert('Configurações de privacidade em breve! 🔒')}
            >
              Gerenciar
            </Button>
          </div>
          <Separator className="bg-gray-800" />
          <div className="flex items-center justify-between">
            <span className="text-white">Resetar Onboarding</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-700 text-red-400 hover:bg-red-900"
              onClick={() => {
                setIsOnboarding(true)
                setOnboardingStep(1)
                alert('Onboarding resetado! Você pode refazer seu perfil.')
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (isOnboarding) {
    return OnboardingFlow
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Dumbbell className="h-8 w-8 text-[#00ff41]" />
            <h1 className="text-2xl font-bold text-[#00ff41]">Paulão Fit</h1>
          </div>
          <div className="flex items-center space-x-4">
            {!userProfile.isLoggedIn ? (
              <Button 
                onClick={handleGoogleLogin}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Olá, {userProfile.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-gray-800"
                  onClick={() => alert('Notificações em breve! 🔔')}
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            )}
            {isPremium && (
              <Badge className="bg-gradient-to-r from-[#00ff41] to-[#00cc33] text-black">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 pb-20 md:pb-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Navigation */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24">
              <Navigation />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {currentView === 'home' && <HomeView />}
            {currentView === 'plans' && <PlansView />}
            {currentView === 'community' && <CommunityView />}
            {currentView === 'progress' && <ProgressView />}
            {currentView === 'profile' && <ProfileView />}
            {currentView === 'workout' && <WorkoutView />}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Navigation />
      </div>
    </div>
  )
}