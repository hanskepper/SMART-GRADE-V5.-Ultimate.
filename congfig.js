// ============================================
// SMART GRADE v5.0 - CONFIGURATION
// ============================================
// ⚠️ Les tokens sont injectés par GitHub Actions
// Ne pas modifier cette section manuellement
// ============================================

var APP_CONFIG = {
  // Ces valeurs sont remplacées par GitHub Actions au moment du build
  githubToken: '',
  groqToken: '',
  mistralToken: '',
  
  // Informations statiques
  version: '5.0',
  codename: 'Ultimate',
  school: 'SIN GBHS FOUMBAN',
  className: 'Form 5B Science',
  academicYear: '2026-2027',
  developer: 'HANS KEPPER',
  email: 'hanskepper52@gmail.com',
  phone: '+237 698 640 885',
  country: 'Cameroon',
  github: 'hanskepper',
  
  terms: [
    { id: 1, name: 'Term 1', sequences: [1, 2], months: 'Sep-Dec' },
    { id: 2, name: 'Term 2', sequences: [3, 4], months: 'Jan-Mar' },
    { id: 3, name: 'Term 3', sequences: [5, 6], months: 'Apr-Jun' }
  ],
  
  grading: {
    max: 20,
    min: 0,
    passingGrade: 10,
    excellentGrade: 16,
    letters: [
      { min: 18, letter: 'A+', color: '#2ecc71' },
      { min: 16, letter: 'A', color: '#2ecc71' },
      { min: 14, letter: 'B+', color: '#3498db' },
      { min: 12, letter: 'B', color: '#3498db' },
      { min: 10, letter: 'C', color: '#f39c12' },
      { min: 8, letter: 'D', color: '#e67e22' },
      { min: 0, letter: 'F', color: '#e74c3c' }
    ]
  },
  
  limits: {
    maxSubjectsPerTerm: 14,
    minSubjectsPerTerm: 10,
    maxFavorites: 6,
    maxHistoryItems: 50,
    maxFlashcardsPerSubject: 100,
    defaultCoefficient: 5,
    pinLength: 4,
    transferCodeLength: 6,
    transferCodeExpiryMinutes: 10,
    maxAvatarSizeMB: 5,
    avatarResizeSize: 300,
    maxConversations: 50,
    maxBackups: 20
  },
  
  streaks: {
    milestones: [3, 7, 15, 30],
    names: ['Beginner', 'Regular', 'Dedicated', 'Legendary']
  },
  
  themes: [
    { name: 'default', color: '#0f3b48', label: 'Deep Teal' },
    { name: 'crimson', color: '#c0392b', label: 'Crimson' },
    { name: 'forest', color: '#1e8449', label: 'Forest' },
    { name: 'ocean', color: '#006994', label: 'Ocean' },
    { name: 'royal', color: '#6c3483', label: 'Royal' },
    { name: 'sunset', color: '#d35400', label: 'Sunset' },
    { name: 'rose', color: '#c44569', label: 'Rose' },
    { name: 'turquoise', color: '#00897b', label: 'Turquoise' },
    { name: 'amber', color: '#b7950b', label: 'Amber' },
    { name: 'graphite', color: '#455a64', label: 'Graphite' },
    { name: 'lavender', color: '#7b1fa2', label: 'Lavender' },
    { name: 'cherry', color: '#b71c1c', label: 'Cherry' },
    { name: 'midnight', color: '#1a237e', label: 'Midnight' },
    { name: 'mint', color: '#00b894', label: 'Mint' },
    { name: 'coral', color: '#e74c3c', label: 'Coral' },
    { name: 'indigo', color: '#283593', label: 'Indigo' },
    { name: 'chocolate', color: '#5d4037', label: 'Chocolate' },
    { name: 'electric', color: '#6a1b9a', label: 'Electric' },
    { name: 'steel', color: '#37474f', label: 'Steel' },
    { name: 'lime', color: '#558b2f', label: 'Lime' }
  ],
  
  fonts: [
    { id: 'inter', name: 'Inter', google: 'Inter' },
    { id: 'roboto', name: 'Roboto', google: 'Roboto' },
    { id: 'cinzel', name: 'Cinzel', google: 'Cinzel' },
    { id: 'quicksand', name: 'Quicksand', google: 'Quicksand' },
    { id: 'courier-prime', name: 'Courier Prime', google: 'Courier+Prime' },
    { id: 'fredoka', name: 'Fredoka', google: 'Fredoka' },
    { id: 'pacifico', name: 'Pacifico', google: 'Pacifico' },
    { id: 'bangers', name: 'Bangers', google: 'Bangers' },
    { id: 'lobster', name: 'Lobster', google: 'Lobster' },
    { id: 'permanent-marker', name: 'Permanent Marker', google: 'Permanent+Marker' },
    { id: 'comfortaa', name: 'Comfortaa', google: 'Comfortaa' },
    { id: 'righteous', name: 'Righteous', google: 'Righteous' }
  ],
  
  nightMode: {
    active: true,
    startHour: 20,
    endHour: 6,
    autoMode: true
  },
  
  features: {
    pwa: true,
    offline: true,
    biometric: true,
    qrCode: true,
    camera: true,
    notifications: true,
    export: true,
    backup: true,
    flashcards: true,
    goals: true,
    timetable: true,
    achievements: true,
    streaks: true,
    chat: true,
    transfer: true,
    homework: true,
    cloudSync: true,
    aiAssistant: true,
    multiSearch: true,
    notebook: true,
    developerTools: true,
    autoSave: true,
    autoUpdate: true
  }
};

console.log('[Config] SMART GRADE v' + APP_CONFIG.version + ' loaded');
