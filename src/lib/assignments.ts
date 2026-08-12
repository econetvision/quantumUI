/**
 * Assignments store (demo mode, localStorage) — mirrors the Prisma Assignment
 * model so it can be swapped for API calls once MySQL is connected.
 */

export interface DemoStudent {
  id: string;
  name: string;
  email: string;
  xp: number;
  streak: number;
  labsCompleted: number;
  lastActive: string;
  isLocal?: boolean; // the person using this browser
}

export interface DemoAssignment {
  id: string;
  studentId: string;
  title: string;
  trackSlug?: string;
  labTopic?: string;
  difficulty?: 'easy' | 'medium' | 'complex';
  dueDate?: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

const STORAGE_KEY = 'quantumui-assignments';

export const DEMO_STUDENTS: DemoStudent[] = [
  { id: 'local', name: 'You (this browser)', email: 'you@local', xp: 0, streak: 0, labsCompleted: 0, lastActive: 'now', isLocal: true },
  { id: 's1', name: 'Asha Patel', email: 'asha@example.com', xp: 640, streak: 12, labsCompleted: 31, lastActive: 'today' },
  { id: 's2', name: 'Diego Ramos', email: 'diego@example.com', xp: 420, streak: 5, labsCompleted: 22, lastActive: 'yesterday' },
  { id: 's3', name: 'Mei Chen', email: 'mei@example.com', xp: 980, streak: 27, labsCompleted: 48, lastActive: 'today' },
  { id: 's4', name: 'Tunde Okafor', email: 'tunde@example.com', xp: 150, streak: 0, labsCompleted: 8, lastActive: '4 days ago' },
];

export function getAssignments(): DemoAssignment[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]') as DemoAssignment[];
  } catch {
    return [];
  }
}

function save(assignments: DemoAssignment[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
}

export function createAssignment(
  data: Omit<DemoAssignment, 'id' | 'status' | 'createdAt'>
): DemoAssignment {
  const assignment: DemoAssignment = {
    ...data,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `a-${Date.now()}`,
    status: 'ASSIGNED',
    createdAt: new Date().toISOString(),
  };
  save([assignment, ...getAssignments()]);
  return assignment;
}

export function updateAssignmentStatus(id: string, status: DemoAssignment['status']) {
  save(getAssignments().map((a) => (a.id === id ? { ...a, status } : a)));
}

export function deleteAssignment(id: string) {
  save(getAssignments().filter((a) => a.id !== id));
}
