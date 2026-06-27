export interface TeamPosition {
  id: string;
  projectId?: string;
  title: string;
  category: string;
  competencies: string[];
}

export const POSITIONS_STORAGE_KEY = 'popilot:team-positions-local';

export const INITIAL_TEAM_POSITIONS: TeamPosition[] = [
  {
    id: 'pos-po',
    projectId: 'popy',
    title: 'Chef de projet / Product Owner (PO)',
    category: 'Direction & Coordination',
    competencies: [
      'Gestion projet agile',
      'Documentation',
      'Communication / Leadership',
      'Connaissance hardware + IA',
    ],
  },
  {
    id: 'pos-qa',
    projectId: 'popy',
    title: 'Responsable Qualité & Processus (QA / QMS)',
    category: 'Direction & Coordination',
    competencies: [
      'Gestion qualité (ISO-like)',
      'Tests automatisés',
      'Documentation technique',
      'Sécurité / Conformité RGPD',
    ],
  },
  {
    id: 'pos-iot',
    projectId: 'popy',
    title: 'Ingénieur IoT / Électronique',
    category: 'Hardware & IoT',
    competencies: ['C / Python', 'Protocoles (I2C, UART, SPI, GPIO)', 'PCB design (KiCAD)', 'Capteurs & robotique'],
  },
  {
    id: 'pos-meca',
    projectId: 'popy',
    title: 'Ingénieur mécatronique / robotique',
    category: 'Hardware & IoT',
    competencies: ['Fusion360 / SolidWorks', 'Servo tuning', 'Montages mécaniques', 'Autonomie / Gestion batterie'],
  },
  {
    id: 'pos-embedded',
    projectId: 'popy',
    title: 'Ingénieur IoT système embarqué',
    category: 'Hardware & IoT',
    competencies: ['Linux embarqué', 'Optimisations bas niveau', 'Traitement signal', 'Python C++'],
  },
  {
    id: 'pos-cv',
    projectId: 'popy',
    title: 'Ingénieur IA / Vision (Computer Vision)',
    category: 'Intelligence Artificielle',
    competencies: ['OpenCV, PyTorch', 'CNN, pose estimation', 'Optimisation modèle', 'Pipelines IA embarquée'],
  },
  {
    id: 'pos-nlp',
    projectId: 'popy',
    title: 'Ingénieur IA / NLP (Langage & voix)',
    category: 'Intelligence Artificielle',
    competencies: ['Transformers (Mistral)', 'NLP embarqué', 'Fine-tuning voix enfant', 'Modèles légers (GGUF / ONNX)'],
  },
  {
    id: 'pos-ml',
    projectId: 'popy',
    title: 'Ingénieur IA / Séries temporelles & comportement',
    category: 'Intelligence Artificielle',
    competencies: ['Machine learning', 'Data modeling', 'Modèles hybrides IA + règles', 'Python / MLflow'],
  },
  {
    id: 'pos-cyber',
    projectId: 'popy',
    title: 'Ingénieur Cybersécurité',
    category: 'Cybersécurité & protection enfant',
    competencies: ['Pentest IoT', 'Chiffrement (AES, RSA)', 'OTA sécurisé', 'Sécurité vocal / caméra'],
  },
  {
    id: 'pos-rgpd',
    projectId: 'popy',
    title: 'Responsable protection des données (RGPD / Enfant)',
    category: 'Cybersécurité & protection enfant',
    competencies: ['RGPD', 'Politique retention data', 'Gestion accès / comptes enfants', 'Documentation légale'],
  },
  {
    id: 'pos-devops',
    projectId: 'popy',
    title: 'Ingénieur Cloud / DevOps',
    category: 'Cloud, Backend & Big Data',
    competencies: ['Docker / Kubernetes', 'API Node / Python', 'Monitoring', 'Backend sécurisé'],
  },
  {
    id: 'pos-data',
    projectId: 'popy',
    title: 'Data Engineer / Big Data',
    category: 'Cloud, Backend & Big Data',
    competencies: ['ETL (Python)', 'Data pipelines', 'PostgreSQL / MongoDB', 'Visualisation (Dash / Superset)'],
  },
];

export function getPositionById(
  positions: TeamPosition[],
  id: string
): TeamPosition | undefined {
  return positions.find((p) => p.id === id);
}

export function getPositionCategories(positions: TeamPosition[]): string[] {
  return Array.from(new Set(positions.map((p) => p.category)));
}

export function applyPositionToMember(
  position: TeamPosition
): Pick<TeamMemberFieldsFromPosition, 'role' | 'category' | 'skills'> {
  return {
    role: position.title,
    category: position.category,
    skills: [...position.competencies],
  };
}

export interface TeamMemberFieldsFromPosition {
  role: string;
  category: string;
  skills: string[];
}
