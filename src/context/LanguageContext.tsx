
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the available languages
export type Language = "en" | "pt" | "es";

// Define the context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create a default context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create translations for each language
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.findExams": "Find Exams",
    "nav.schedule": "Schedule",
    "nav.account": "Account",
    "nav.profile": "Profile",
    "nav.myExams": "My Scheduled Exams",
    "nav.signOut": "Sign Out",
    "nav.signIn": "Sign In",

    // Home page
    "home.title": "Book Your Medical Imaging",
    "home.subtitle": "Appointment Today",
    "home.description": "Fast and easy scheduling for all your medical imaging needs. Find the nearest facility and book your appointment in minutes.",
    "home.searchPlaceholder": "Search for exams or labs...",
    "home.search": "Search",
    "home.services": "Available Diagnostic Services",
    "home.viewAll": "View All Services",
    
    // Exam cards
    "exam.mri.title": "MRI Scan",
    "exam.mri.description": "High-resolution magnetic resonance imaging for detailed internal body examination.",
    "exam.ct.title": "CT Scan",
    "exam.ct.description": "Advanced computed tomography scanning for cross-sectional body imaging.",
    "exam.xray.title": "X-Ray",
    "exam.xray.description": "Quick and efficient diagnostic imaging for bones and chest examinations.",
    
    // Auth page
    "auth.createAccount": "Create an Account",
    "auth.welcomeBack": "Welcome Back",
    "auth.fullName": "Full Name",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signUp": "Sign Up",
    "auth.signIn": "Sign In",
    "auth.waiting": "Please wait...",
    "auth.haveAccount": "Already have an account?",
    "auth.noAccount": "Don't have an account?",
    
    // Search page
    "search.title": "Find Medical Exams",
    "search.label": "Search",
    "search.placeholder": "Search exams by name...",
    "search.examType": "Exam Type",
    "search.allTypes": "All Types",
    "search.city": "City",
    "search.allCities": "All Cities",
    "search.scheduleExam": "Schedule Exam",
    
    // My Exams page
    "myExams.title": "My Scheduled Exams",
    "myExams.loading": "Loading appointments...",
    "myExams.noExams": "You don't have any scheduled exams yet.",
    "myExams.findExams": "Find and Schedule Exams",
    "myExams.exam": "Exam",
    "myExams.laboratory": "Laboratory",
    "myExams.date": "Date",
    "myExams.time": "Time",
    "myExams.status": "Status",
    "myExams.price": "Price",
    
    // Language
    "language.english": "English",
    "language.portuguese": "Portuguese",
    "language.spanish": "Spanish",
  },
  pt: {
    // Navigation
    "nav.findExams": "Encontrar Exames",
    "nav.schedule": "Agendar",
    "nav.account": "Conta",
    "nav.profile": "Perfil",
    "nav.myExams": "Meus Exames Agendados",
    "nav.signOut": "Sair",
    "nav.signIn": "Entrar",
    
    // Home page
    "home.title": "Agende Seus Exames",
    "home.subtitle": "de Imagem Médica Hoje",
    "home.description": "Agendamento rápido e fácil para todas as suas necessidades de imagem médica. Encontre o laboratório mais próximo e agende sua consulta em minutos.",
    "home.searchPlaceholder": "Pesquisar exames ou laboratórios...",
    "home.search": "Pesquisar",
    "home.services": "Serviços de Diagnóstico Disponíveis",
    "home.viewAll": "Ver Todos os Serviços",
    
    // Exam cards
    "exam.mri.title": "Ressonância Magnética",
    "exam.mri.description": "Imagem por ressonância magnética de alta resolução para exame detalhado interno do corpo.",
    "exam.ct.title": "Tomografia Computadorizada",
    "exam.ct.description": "Digitalização avançada de tomografia computadorizada para imagens de seção transversal do corpo.",
    "exam.xray.title": "Raio-X",
    "exam.xray.description": "Imagens diagnósticas rápidas e eficientes para exames ósseos e torácicos.",
    
    // Auth page
    "auth.createAccount": "Criar uma Conta",
    "auth.welcomeBack": "Bem-vindo de Volta",
    "auth.fullName": "Nome Completo",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.signUp": "Cadastrar",
    "auth.signIn": "Entrar",
    "auth.waiting": "Aguarde por favor...",
    "auth.haveAccount": "Já tem uma conta?",
    "auth.noAccount": "Não tem uma conta?",
    
    // Search page
    "search.title": "Encontrar Exames Médicos",
    "search.label": "Pesquisar",
    "search.placeholder": "Pesquisar exames por nome...",
    "search.examType": "Tipo de Exame",
    "search.allTypes": "Todos os Tipos",
    "search.city": "Cidade",
    "search.allCities": "Todas as Cidades",
    "search.scheduleExam": "Agendar Exame",
    
    // My Exams page
    "myExams.title": "Meus Exames Agendados",
    "myExams.loading": "Carregando agendamentos...",
    "myExams.noExams": "Você ainda não tem exames agendados.",
    "myExams.findExams": "Encontrar e Agendar Exames",
    "myExams.exam": "Exame",
    "myExams.laboratory": "Laboratório",
    "myExams.date": "Data",
    "myExams.time": "Horário",
    "myExams.status": "Status",
    "myExams.price": "Preço",
    
    // Language
    "language.english": "Inglês",
    "language.portuguese": "Português",
    "language.spanish": "Espanhol",
  },
  es: {
    // Navigation
    "nav.findExams": "Buscar Exámenes",
    "nav.schedule": "Programar",
    "nav.account": "Cuenta",
    "nav.profile": "Perfil",
    "nav.myExams": "Mis Exámenes Programados",
    "nav.signOut": "Cerrar Sesión",
    "nav.signIn": "Iniciar Sesión",
    
    // Home page
    "home.title": "Reserve Su Imagen Médica",
    "home.subtitle": "Cita Hoy",
    "home.description": "Programación rápida y fácil para todas sus necesidades de imágenes médicas. Encuentre el centro más cercano y reserve su cita en minutos.",
    "home.searchPlaceholder": "Buscar exámenes o laboratorios...",
    "home.search": "Buscar",
    "home.services": "Servicios de Diagnóstico Disponibles",
    "home.viewAll": "Ver Todos los Servicios",
    
    // Exam cards
    "exam.mri.title": "Resonancia Magnética",
    "exam.mri.description": "Imágenes de resonancia magnética de alta resolución para un examen interno detallado del cuerpo.",
    "exam.ct.title": "Tomografía Computarizada",
    "exam.ct.description": "Escaneo avanzado de tomografía computarizada para imágenes transversales del cuerpo.",
    "exam.xray.title": "Rayos X",
    "exam.xray.description": "Imágenes diagnósticas rápidas y eficientes para exámenes de huesos y tórax.",
    
    // Auth page
    "auth.createAccount": "Crear una Cuenta",
    "auth.welcomeBack": "Bienvenido de Nuevo",
    "auth.fullName": "Nombre Completo",
    "auth.email": "Correo Electrónico",
    "auth.password": "Contraseña",
    "auth.signUp": "Registrarse",
    "auth.signIn": "Iniciar Sesión",
    "auth.waiting": "Por favor espere...",
    "auth.haveAccount": "¿Ya tiene una cuenta?",
    "auth.noAccount": "¿No tiene una cuenta?",
    
    // Search page
    "search.title": "Buscar Exámenes Médicos",
    "search.label": "Buscar",
    "search.placeholder": "Buscar exámenes por nombre...",
    "search.examType": "Tipo de Examen",
    "search.allTypes": "Todos los Tipos",
    "search.city": "Ciudad",
    "search.allCities": "Todas las Ciudades",
    "search.scheduleExam": "Programar Examen",
    
    // My Exams page
    "myExams.title": "Mis Exámenes Programados",
    "myExams.loading": "Cargando citas...",
    "myExams.noExams": "Aún no tiene exámenes programados.",
    "myExams.findExams": "Buscar y Programar Exámenes",
    "myExams.exam": "Examen",
    "myExams.laboratory": "Laboratorio",
    "myExams.date": "Fecha",
    "myExams.time": "Hora",
    "myExams.status": "Estado",
    "myExams.price": "Precio",
    
    // Language
    "language.english": "Inglés",
    "language.portuguese": "Portugués",
    "language.spanish": "Español",
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Initialize with browser language or default to English
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'pt' || browserLang === 'es') {
      return browserLang as Language;
    }
    return 'en';
  };

  // Try to get language from localStorage or use browser language
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || getBrowserLanguage();
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Update language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  useEffect(() => {
    // Set the html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
