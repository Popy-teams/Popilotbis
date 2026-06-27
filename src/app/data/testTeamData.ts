// Données de test pour l'équipe projet POPY
// Structure complète avec rôles, compétences et photos de profil

export interface TeamMemberData {
  id: string;
  projectId?: string;
  positionId: string;
  /** ID assigné dans l'onglet Tâches (assignedTo), si différent */
  tasksUserId?: string;
  name: string;
  initials: string;
  role: string;
  category: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  workload: number;
  responsibilities: string[];
  skills: string[];
  availability: 'Disponible' | 'Surchargé' | 'En congé';
  trophies: string[];
}

export const TEST_TEAM_MEMBERS: TeamMemberData[] = [
  {
    id: 'user-sonia',
    positionId: 'pos-qa',
    tasksUserId: 'user-7',
    name: 'Sonia',
    initials: 'SO',
    role: 'Responsable Qualité & Processus (QA / QMS)',
    category: 'Direction & Coordination',
    email: 'sonia@popy-robot.com',
    phone: '+33 6 12 34 56 02',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Standardisation du code',
      'Standardisation de l\'assemblage robot',
      'Processus sécurité enfant',
      'Tests, validation, certifications'
    ],
    skills: [
      'Gestion qualité (ISO-like)',
      'Tests automatisés',
      'Documentation technique',
      'Sécurité / Conformité RGPD'
    ],
    availability: 'Disponible',
    trophies: ['Respect des normes', 'Rigueur']
  },

  // Hardware & IoT
  {
    id: 'user-erwan',
    positionId: 'pos-iot',
    name: 'Erwan',
    initials: 'ER',
    role: 'Ingénieur IoT / Électronique',
    category: 'Hardware & IoT',
    email: 'erwan@popy-robot.com',
    phone: '+33 6 12 34 56 03',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Design circuits électroniques',
      'Gestion sensors : ToF, IMU, caméra, servos',
      'Optimisation consommation énergétique',
      'Intégration Raspberry Pi + NPU'
    ],
    skills: [
      'C / Python',
      'Protocoles (I2C, UART, SPI, GPIO)',
      'PCB design (KiCAD)',
      'Capteurs & robotique'
    ],
    availability: 'Disponible',
    trophies: ['Expertise technique', 'Innovation']
  },
  {
    id: 'user-yacine',
    positionId: 'pos-meca',
    name: 'Yacine',
    initials: 'YA',
    role: 'Ingénieur mécatronique / robotique',
    category: 'Hardware & IoT',
    email: 'yacine@popy-robot.com',
    phone: '+33 6 12 34 56 04',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Moteurs, servos, cinématique',
      'Conception structure interne',
      'Impression 3D',
      'Prototypes physiques'
    ],
    skills: [
      'Fusion360 / SolidWorks',
      'Servo tuning',
      'Montages mécaniques',
      'Autonomie / Gestion batterie'
    ],
    availability: 'Disponible',
    trophies: ['Prototypage rapide', 'Qualité']
  },
  {
    id: 'user-fabio',
    positionId: 'pos-embedded',
    tasksUserId: 'user-6',
    name: 'Fabio',
    initials: 'FA',
    role: 'Ingénieur IoT système embarqué',
    category: 'Hardware & IoT',
    email: 'fabio@popy-robot.com',
    phone: '+33 6 12 34 56 05',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'OS embarqué',
      'Communication entre modules',
      'Intégration des capteurs dans le système',
      'Drivers, optimisation'
    ],
    skills: [
      'Linux embarqué',
      'Optimisations bas niveau',
      'Traitement signal',
      'Python C++'
    ],
    availability: 'Disponible',
    trophies: ['Optimisation', 'Expertise système']
  },

  // Intelligence Artificielle
  {
    id: 'user-meriem',
    positionId: 'pos-cv',
    tasksUserId: 'user-1',
    name: 'Mériem',
    initials: 'ME',
    role: 'Ingénieur IA / Vision (Computer Vision)',
    category: 'Intelligence Artificielle',
    email: 'meriem@popy-robot.com',
    phone: '+33 6 12 34 56 06',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Détection émotions',
      'Vision 1080p',
      'Object detection',
      'Tracking enfant'
    ],
    skills: [
      'OpenCV, PyTorch',
      'CNN, pose estimation',
      'Optimisation modèle (Quantization, pruning)',
      'Pipelines IA embarquée'
    ],
    availability: 'Disponible',
    trophies: ['IA de pointe', 'Performance']
  },
  {
    id: 'user-claude',
    positionId: 'pos-nlp',
    name: 'Claude',
    initials: 'CL',
    role: 'Ingénieur IA / NLP (Langage & voix)',
    category: 'Intelligence Artificielle',
    email: 'claude@popy-robot.com',
    phone: '+33 6 12 34 56 07',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Compréhension du langage',
      'Wake word "POPY écoute"',
      'Conversations enfant',
      'TTS + STT offline'
    ],
    skills: [
      'Transformers (Mistral)',
      'NLP embarqué',
      'Fine-tuning voix enfant',
      'Modèles légers (GGUF / ONNX)'
    ],
    availability: 'Disponible',
    trophies: ['IA conversationnelle', 'Innovation']
  },
  {
    id: 'user-data-ia',
    positionId: 'pos-ml',
    name: 'Sarah',
    initials: 'SA',
    role: 'Ingénieur IA / Séries temporelles & comportement',
    category: 'Intelligence Artificielle',
    email: 'sarah@popy-robot.com',
    phone: '+33 6 12 34 56 08',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Analyse émotionnelle continue',
      'Suivi attentionnel / fatigue',
      'Modèles comportementaux'
    ],
    skills: [
      'Machine learning',
      'Data modeling',
      'Modèles hybrides IA + règles',
      'Python / MLflow'
    ],
    availability: 'Disponible',
    trophies: ['Data science', 'Modélisation']
  },

  // Cybersécurité & protection enfant
  {
    id: 'user-cyber',
    positionId: 'pos-cyber',
    name: 'Marc',
    initials: 'MA',
    role: 'Ingénieur Cybersécurité',
    category: 'Cybersécurité & protection enfant',
    email: 'marc@popy-robot.com',
    phone: '+33 6 12 34 56 09',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Sécurité du robot',
      'Chiffrement total',
      'Audits sécurité',
      'Anti-intrusion / firmware sécurisé'
    ],
    skills: [
      'Pentest IoT',
      'Chiffrement (AES, RSA)',
      'OTA sécurisé',
      'Sécurité vocal / caméra'
    ],
    availability: 'Disponible',
    trophies: ['Sécurité', 'Expertise crypto']
  },
  {
    id: 'user-rgpd',
    positionId: 'pos-rgpd',
    name: 'Julie',
    initials: 'JU',
    role: 'Responsable protection des données (RGPD / Enfant)',
    category: 'Cybersécurité & protection enfant',
    email: 'julie@popy-robot.com',
    phone: '+33 6 12 34 56 10',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Conformité totale',
      'Gestion données locales',
      'Privacy by design',
      'Protocole parental'
    ],
    skills: [
      'RGPD',
      'Politique retention data',
      'Gestion accès / comptes enfants',
      'Documentation légale'
    ],
    availability: 'Disponible',
    trophies: ['Conformité', 'Protection enfant']
  },

  // Cloud, Backend & Big Data
  {
    id: 'user-cloud',
    positionId: 'pos-devops',
    name: 'David',
    initials: 'DA',
    role: 'Ingénieur Cloud / DevOps',
    category: 'Cloud, Backend & Big Data',
    email: 'david@popy-robot.com',
    phone: '+33 6 12 34 56 11',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'API parentale',
      'Interface web',
      'Serveur mises à jour',
      'Pipelines CI/CD'
    ],
    skills: [
      'Docker / Kubernetes',
      'API Node / Python',
      'Monitoring',
      'Backend sécurisé'
    ],
    availability: 'Disponible',
    trophies: ['DevOps', 'Automatisation']
  },
  {
    id: 'user-data',
    positionId: 'pos-data',
    tasksUserId: 'user-5',
    name: 'Emma',
    initials: 'EM',
    role: 'Data Engineer / Big Data',
    category: 'Cloud, Backend & Big Data',
    email: 'emma@popy-robot.com',
    phone: '+33 6 12 34 56 12',
    photoUrl: undefined,
    workload: 0,
    responsibilities: [
      'Stockage métriques apprentissage',
      'Stats enseignants',
      'Analytics émotionnels anonymisés',
      'Modèles pédagogiques'
    ],
    skills: [
      'ETL (Python)',
      'Data pipelines',
      'Bases de données (PostgreSQL / MongoDB)',
      'Visualisation (Dash / Superset)'
    ],
    availability: 'Disponible',
    trophies: ['Big data', 'Analytics']
  },
];

export function getMembersByCategory(category: string, members = TEST_TEAM_MEMBERS): TeamMemberData[] {
  return members.filter((m) => m.category === category);
}
