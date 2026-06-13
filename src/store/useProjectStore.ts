import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomProject {
  id: string;
  title: string;
  description: string;
  icon: string;
  topics: string[];
  isCustom: true;
}

interface ProjectStore {
  customProjects: CustomProject[];
  addProject: (project: Omit<CustomProject, 'id' | 'isCustom'>) => void;
  updateProject: (id: string, updates: Partial<CustomProject>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => CustomProject | undefined;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      customProjects: [],

      addProject: (project) => set((state) => ({
        customProjects: [
          ...state.customProjects,
          {
            ...project,
            id: `custom-${Date.now()}`,
            isCustom: true,
          },
        ],
      })),

      updateProject: (id, updates) => set((state) => ({
        customProjects: state.customProjects.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),

      deleteProject: (id) => set((state) => ({
        customProjects: state.customProjects.filter((p) => p.id !== id),
      })),

      getProject: (id) => {
        return get().customProjects.find((p) => p.id === id);
      },
    }),
    {
      name: 'project-storage',
    }
  )
);