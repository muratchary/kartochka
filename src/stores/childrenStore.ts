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
  selectedChildId: string | null;

  setSelectedChild: (id: string) => void;

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

  seedDemoData: () => void;
  clearAll: () => void;
}

export function selectActiveChild(state: ChildrenState): Child | undefined {
  if (state.selectedChildId) {
    return state.children.find((c) => c.id === state.selectedChildId) ?? state.children[0];
  }
  return state.children[0];
}

const now = (): string => new Date().toISOString();

export const useChildrenStore = create<ChildrenState>()(
  persist(
    (set) => ({
      children: [],
      vaccinations: [],
      growthEntries: [],
      milestones: [],
      selectedChildId: null,

      setSelectedChild: (id) => set({ selectedChildId: id }),

      addChild: (input) => {
        const child: Child = { ...input, id: newId(), createdAt: now(), updatedAt: now() };
        set((state) => ({
          children: [...state.children, child],
          selectedChildId: state.selectedChildId ?? child.id,
        }));
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
        set((state) => {
          const remaining = state.children.filter((c) => c.id !== id);
          return {
            children: remaining,
            vaccinations: state.vaccinations.filter((v) => v.childId !== id),
            growthEntries: state.growthEntries.filter((g) => g.childId !== id),
            milestones: state.milestones.filter((m) => m.childId !== id),
            selectedChildId:
              state.selectedChildId === id ? (remaining[0]?.id ?? null) : state.selectedChildId,
          };
        });
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

      seedDemoData: () => {
        const t = now();
        const ymd = (date: Date) => date.toISOString().slice(0, 10);
        const today = new Date();
        const monthsAgo = (n: number) => {
          const d = new Date(today);
          d.setMonth(d.getMonth() - n);
          return ymd(d);
        };

        const annaDob = monthsAgo(14);
        const arashDob = monthsAgo(3);

        const anna: Child = {
          id: newId(),
          name: 'Anna',
          dateOfBirth: annaDob,
          sex: 'female',
          countryCode: 'RU',
          createdAt: t,
          updatedAt: t,
        };
        const arash: Child = {
          id: newId(),
          name: 'Arash',
          dateOfBirth: arashDob,
          sex: 'male',
          countryCode: 'AE',
          createdAt: t,
          updatedAt: t,
        };

        const ann = (vaccineCode: string, doseNumber: number, ageDaysAfterDob: number): VaccinationRecord => ({
          id: newId(),
          childId: anna.id,
          vaccineCode,
          doseNumber,
          administeredOn: ymd(new Date(new Date(annaDob).getTime() + ageDaysAfterDob * 86400000)),
          createdAt: t,
          updatedAt: t,
        });

        const vaccinations: VaccinationRecord[] = [
          ann('HepB', 1, 0),
          ann('BCG', 1, 5),
          ann('HepB', 2, 30),
          ann('PCV', 1, 60),
          ann('DTP', 1, 90),
          ann('Polio', 1, 90),
          ann('Hib', 1, 90),
          ann('DTP', 2, 135),
          ann('Polio', 2, 135),
          ann('Hib', 2, 135),
          ann('PCV', 2, 135),
          ann('DTP', 3, 180),
          ann('Polio', 3, 180),
          ann('Hib', 3, 180),
          ann('HepB', 3, 180),
          ann('MMR', 1, 365),
        ];

        const growthEntries: GrowthEntry[] = [
          {
            id: newId(),
            childId: anna.id,
            measuredOn: ymd(new Date(new Date(annaDob).getTime() + 30 * 86400000)),
            weightKg: 4.5,
            heightCm: 55,
            headCircumferenceCm: 38,
            createdAt: t,
            updatedAt: t,
          },
          {
            id: newId(),
            childId: anna.id,
            measuredOn: ymd(new Date(new Date(annaDob).getTime() + 90 * 86400000)),
            weightKg: 6.2,
            heightCm: 61,
            headCircumferenceCm: 41,
            createdAt: t,
            updatedAt: t,
          },
          {
            id: newId(),
            childId: anna.id,
            measuredOn: ymd(new Date(new Date(annaDob).getTime() + 180 * 86400000)),
            weightKg: 7.8,
            heightCm: 67,
            headCircumferenceCm: 43,
            createdAt: t,
            updatedAt: t,
          },
          {
            id: newId(),
            childId: anna.id,
            measuredOn: ymd(new Date(new Date(annaDob).getTime() + 365 * 86400000)),
            weightKg: 9.5,
            heightCm: 74,
            headCircumferenceCm: 45,
            createdAt: t,
            updatedAt: t,
          },
          {
            id: newId(),
            childId: anna.id,
            measuredOn: monthsAgo(0),
            weightKg: 10.2,
            heightCm: 78,
            headCircumferenceCm: 46,
            notes: 'Annual checkup',
            createdAt: t,
            updatedAt: t,
          },
        ];

        const mileCodes = [
          'smiles-at-people',
          'holds-head-up',
          'coos',
          'follows-with-eyes',
          'head-steady',
          'smiles-spontaneously',
          'babbles',
          'reaches-for-toys',
          'rolls-over',
          'responds-to-name',
          'sits-without-support',
          'pulls-to-stand',
          'first-word',
        ];
        const milestones: MilestoneRecord[] = mileCodes.map((code, i) => ({
          id: newId(),
          childId: anna.id,
          milestoneCode: code,
          achievedOn: ymd(new Date(new Date(annaDob).getTime() + (60 + i * 30) * 86400000)),
          createdAt: t,
          updatedAt: t,
        }));

        set({
          children: [anna, arash],
          vaccinations,
          growthEntries,
          milestones,
          selectedChildId: anna.id,
        });
      },

      clearAll: () => {
        set({
          children: [],
          vaccinations: [],
          growthEntries: [],
          milestones: [],
          selectedChildId: null,
        });
      },
    }),
    {
      name: 'kartochka.children',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
