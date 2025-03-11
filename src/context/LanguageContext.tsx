import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the available languages
export type Language = "en" | "pt" | "es";

// Define the context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  formatPrice: (price: number) => string;
}

// Create a default context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Exchange rates (approximate)
const exchangeRates = {
  en: 1,      // USD (base)
  pt: 5.5,    // BRL to USD
  es: 0.85    // EUR to USD
};

// Currency symbols
const currencySymbols = {
  en: "$",    // USD
  pt: "R$",   // BRL
  es: "€"     // EUR
};

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
    
    // Exam names and descriptions
    "exam.blood_test.name": "Blood Test",
    "exam.blood_test.description": "Comprehensive blood analysis to assess overall health and detect abnormalities.",
    "exam.x_ray.name": "X-Ray",
    "exam.x_ray.description": "Quick and efficient diagnostic imaging for bones and chest examinations.",
    "exam.mri.name": "MRI Scan",
    "exam.mri.description": "High-resolution magnetic resonance imaging for detailed internal body examination.",
    "exam.ct_scan.name": "CT Scan",
    "exam.ct_scan.description": "Advanced computed tomography scanning for cross-sectional body imaging.",
    "exam.ultrasound.name": "Ultrasound",
    "exam.ultrasound.description": "Non-invasive imaging technique using sound waves to visualize internal organs.",
    "exam.endoscopy.name": "Endoscopy",
    "exam.endoscopy.description": "Examination of internal organs using a flexible tube with a camera.",
    "exam.colonoscopy.name": "Colonoscopy",
    "exam.colonoscopy.description": "Examination of the colon and large intestine using a flexible tube with a camera.",
    "exam.mammogram.name": "Mammogram",
    "exam.mammogram.description": "X-ray imaging of the breast to detect early signs of breast cancer.",
    "exam.other.name": "Other Exam",
    "exam.other.description": "Specialized diagnostic procedure tailored to specific medical needs.",
    
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
    "search.noResults": "No exams found. Please try a different search.",
    "search.noResultsWithFilters": "No exams found matching your search criteria. Try adjusting your filters.",
    
    // Exam types
    "examType.all_types": "All Types",
    "examType.blood_test": "Blood Test",
    "examType.x_ray": "X-Ray",
    "examType.mri": "MRI",
    "examType.ct_scan": "CT Scan",
    "examType.ultrasound": "Ultrasound",
    "examType.endoscopy": "Endoscopy",
    "examType.colonoscopy": "Colonoscopy",
    "examType.mammogram": "Mammogram",
    "examType.other": "Other",
    
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
    "exam.ct.description": "Digitalização avançada de tomografia computarizada para imagens de seção transversal do corpo.",
    "exam.xray.title": "Raio-X",
    "exam.xray.description": "Imagens diagnósticas rápidas e eficientes para exames ósseos e torácicos.",
    
    // Exam names and descriptions
    "exam.blood_test.name": "Exame de Sangue",
    "exam.blood_test.description": "Análise completa de sangue para avaliar a saúde geral e detectar anormalidades.",
    "exam.x_ray.name": "Raio-X",
    "exam.x_ray.description": "Imagens diagnósticas rápidas e eficientes para exames ósseos e torácicos.",
    "exam.mri.name": "Ressonância Magnética",
    "exam.mri.description": "Imagem por ressonância magnética de alta resolução para exame detalhado interno do corpo.",
    "exam.ct_scan.name": "Tomografia Computarizada",
    "exam.ct_scan.description": "Digitalização avançada de tomografia computarizada para imagens de seção transversal do corpo.",
    "exam.ultrasound.name": "Ultrassom",
    "exam.ultrasound.description": "Técnica de imagem não invasiva usando ondas sonoras para visualizar órgãos internos.",
    "exam.endoscopy.name": "Endoscopia",
    "exam.endoscopy.description": "Exame de órgãos internos usando um tubo flexível com uma câmera.",
    "exam.colonoscopy.name": "Colonoscopia",
    "exam.colonoscopy.description": "Exame do cólon e intestino grosso usando um tubo flexível com uma câmera.",
    "exam.mammogram.name": "Mamografia",
    "exam.mammogram.description": "Imagem de raios-X da mama para detectar sinais precoces de câncer de mama.",
    "exam.other.name": "Outro Exame",
    "exam.other.description": "Procedimento diagnóstico especializado adaptado a necessidades médicas específicas.",
    
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
    "search.noResults": "Nenhum exame encontrado. Tente uma busca diferente.",
    "search.noResultsWithFilters": "Nenhum exame encontrado com seus critérios de busca. Tente ajustar seus filtros.",
    
    // Exam types
    "examType.all_types": "Todos os Tipos",
    "examType.blood_test": "Exame de Sangue",
    "examType.x_ray": "Raio-X",
    "examType.mri": "Ressonância Magnética",
    "examType.ct_scan": "Tomografia Computarizada",
    "examType.ultrasound": "Ultrassom",
    "examType.endoscopy": "Endoscopia",
    "examType.colonoscopy": "Colonoscopia",
    "examType.mammogram": "Mamografia",
    "examType.other": "Outros",
    
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
    
    // Exam names and descriptions
    "exam.blood_test.name": "Análisis de Sangre",
    "exam.blood_test.description": "Análisis completo de sangre para evaluar la salud general y detectar anomalías.",
    "exam.x_ray.name": "Rayos X",
    "exam.x_ray.description": "Imágenes diagnósticas rápidas y eficientes para exámenes de huesos y tórax.",
    "exam.mri.name": "Resonancia Magnética",
    "exam.mri.description": "Imágenes de resonancia magnética de alta resolución para un examen interno detallado del cuerpo.",
    "exam.ct_scan.name": "Tomografía Computarizada",
    "exam.ct_scan.description": "Escaneo avanzado de tomografía computarizada para imágenes transversales del cuerpo.",
    "exam.ultrasound.name": "Ultrasonido",
    "exam.ultrasound.description": "Técnica de imagen no invasiva que utiliza ondas sonoras para visualizar órganos internos.",
    "exam.endoscopy.name": "Endoscopia",
    "exam.endoscopy.description": "Examen de órganos internos utilizando un tubo flexible con una cámara.",
    "exam.colonoscopy.name": "Colonoscopia",
    "exam.colonoscopy.description": "Examen del colon y del intestino grueso utilizando un tubo flexible con una cámara.",
    "exam.mammogram.name": "Mamografía",
    "exam.mammogram.description": "Imágenes de rayos X del seno para detectar signos tempranos de cáncer de mama.",
    "exam.other.name": "Otro Examen",
    "exam.other.description": "Procedimiento diagnóstico especializado adaptado a necesidades médicas específicas.",
    
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
    "search.noResults": "No se encontraron exámenes. Intente una búsqueda diferente.",
    "search.noResultsWithFilters": "No se encontraron exámenes que coincidan con sus criterios de búsqueda. Intente ajustar sus filtros.",
    
    // Exam types
    "examType.all_types": "Todos los Tipos",
    "examType.blood_test": "Análisis de Sangre",
    "examType.x_ray": "Rayos X",
    "examType.mri": "Resonancia Magnética",
    "examType.ct_scan": "Tomografía Computarizada",
    "examType.ultrasound": "Ultrasonido",
    "examType.endoscopy": "Endoscopia",
    "examType.colonoscopy": "Colonoscopia",
    "examType.mammogram": "Mamografía",
    "examType.other": "Otros",
    
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

  // Format price according to current language
  const formatPrice = (price: number): string => {
    const rate = exchangeRates[language];
    const symbol = currencySymbols[language];
    
    const convertedPrice = price * rate;
    return `${symbol}${convertedPrice.toFixed(2)}`;
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
    formatPrice,
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
