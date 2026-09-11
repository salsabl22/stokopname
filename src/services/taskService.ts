import type { PrioritasTugas, StatusTugas, TipeTugas, UserTask } from '../types/task';
import { storage, delay } from './storage';

function genId(): string {
  return `tsk${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

function nextNomorTugas(): string {
  const list = storage.getTasks();
  const count = list.length + 1;
  return `TSK-${String(count).padStart(3, '0')}`;
}

export async function fetchAllTasks(): Promise<UserTask[]> {
  const list = storage.getTasks();
  return delay([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function createTask(params: {
  tipe: TipeTugas;
  judul: string;
  deskripsi: string;
  referensiId: string;
  referensiNomor: string;
  prioritas?: PrioritasTugas;
  assignee?: string;
  targetUrl: string;
}): Promise<UserTask> {
  const now = new Date().toISOString();
  const newTask: UserTask = {
    id: genId(),
    nomorTugas: nextNomorTugas(),
    tipe: params.tipe,
    judul: params.judul,
    deskripsi: params.deskripsi,
    referensiId: params.referensiId,
    referensiNomor: params.referensiNomor,
    status: 'tertunda',
    prioritas: params.prioritas || 'sedang',
    assignee: params.assignee || 'Andi Saputra',
    targetUrl: params.targetUrl,
    createdAt: now,
  };
  const list = storage.getTasks();
  storage.setTasks([newTask, ...list]);
  return delay(newTask);
}

export async function updateTaskStatus(id: string, status: StatusTugas): Promise<UserTask> {
  const list = storage.getTasks();
  const target = list.find((t) => t.id === id);
  if (!target) throw new Error('Tugas tidak ditemukan');
  const now = new Date().toISOString();
  const updated: UserTask = {
    ...target,
    status,
    waktuSelesai: status === 'selesai' ? now : undefined,
  };
  storage.setTasks(list.map((t) => (t.id === id ? updated : t)));
  return delay(updated);
}

export async function completeTaskByRef(referensiId: string): Promise<void> {
  const list = storage.getTasks();
  const now = new Date().toISOString();
  const updated = list.map((t) => {
    if (t.referensiId === referensiId && t.status !== 'selesai') {
      return { ...t, status: 'selesai' as StatusTugas, waktuSelesai: now };
    }
    return t;
  });
  storage.setTasks(updated);
  return delay(undefined as void);
}
