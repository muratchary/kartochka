import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  Child,
  GrowthEntry,
  MilestoneRecord,
  NewChild,
  NewGrowthEntry,
  NewMilestoneRecord,
  NewVaccinationRecord,
  VaccinationRecord,
} from '../types';
import { newId } from '../utils/id';

interface ChildrenState {
  children: Child[];
  vaccinations: VaccinationRecord[];
  growthEntries: GrowthEntry[];
  milestones: MilestoneRecord[];

  addChild: (input: NewChild) => Child;
  updateChild: (id: string, patch: Partial<NewChild>) => void;
  removeChild: (id: string) => void;

  addVaccination: (input: NewVaccinationRecord) => VaccinationRecord;
  removeVaccination: (id: string) => void;

  addGrowthEntry: (input: NewGrowthEntry) => GrowthEntry;
  updateGrowthEntry: (id: string, patch: Partial<NewGrowthEntry>) => void;
  removeGrowthEntry: (id: string) => void;

  addMilestone: (input: NewMilestoneRecord) => MilestoneRecord;
  removeMilestone: (id: string) => void;
}

const now = (): string => new Date().toISOString();

export const useChildrenStore = create<ChildrenState>()(
  persist(
    (set) => ({
      children: [],
      vaccinations: [],
      growthEntries: [],
      milestones: [],

      addChild: (input) => {
        const child: Child = { ...input, id: newId(), createdAt: now(), updatedAt: now() };
        set((state) => ({ children: [...state.children, child] }));
        return child;
      },
      updateChild: (id, patch) => {
        set((state) => ({
          children: state.children.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: now() } : c,
          ),
        }));
      },
      removeChild: (id) => {
        set((state) => ({
          children: state.children.filter((c) => c.id !== id),
          vaccinations: state.vaccinations.filter((v) => v.childId !== id),
          growthEntries: state.growthEntries.filter((g) => g.childId !== id),
          milestones: state.milestones.filter((m) => m.childId !== id),
        }));
      },

      addVaccination: (input) => {
        const record: VaccinationRecord = {
          ...input,
          id: newId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ vaccinations: [...state.vaccinations, record] }));
        return record;
      },
      removeVaccination: (id) => {
        set((state) => ({ vaccinations: state.vaccinations.filter((v) => v.id !== id) }));
      },

      addGrowthEntry: (input) => {
        const entry: GrowthEntry = { ...input, id: newId(), createdAt: now(), updatedAt: now() };
        set((state) => ({ growthEntries: [...state.growthEntries, entry] }));
        return entry;
      },
      updateGrowthEntry: (id, patch) => {
        set((state) => ({
          growthEntries: state.growthEntries.map((g) =>
            g.id === id ? { ...g, ...patch, updatedAt: now() } : g,
          ),
        }));
      },
      removeGrowthEntry: (id) => {
        set((state) => ({ growthEntries: state.growthEntries.filter((g) => g.id !== id) }));
      },

      addMilestone: (input) => {
        const record: MilestoneRecord = {
          ...input,
          id: newId(),
          createdAt: now(),
          updatedAt: now(),
        };
        set((state) => ({ milestones: [...state.milestones, record] }));
        return record;
      },
      removeMilestone: (id) => {
        set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) }));
      },
    }),
    {
      name: 'kartochka.children',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
