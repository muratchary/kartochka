import type { SupportedLanguage } from '../i18n';

export type Sex = 'male' | 'female' | 'unspecified';

export type IsoDate = string;
export type IsoDateTime = string;

export type LocalizedString = Partial<Record<SupportedLanguage, string>> & { en: string };

export interface Child {
  id: string;
  name: string;
  dateOfBirth: IsoDate;
  sex: Sex;
  countryCode: string;
  photoUri?: string;
  bloodType?: string;
  allergyNotes?: string;
  medicationNotes?: string;
  emergencyContact?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  // Cloud-sync ownership marker (local-only; NOT a Supabase column). Holds the
  // user_id that owns this child in the cloud. Children acquired via partner
  // sharing carry the OWNER's id here so we never re-upload them under the
  // partner's account (which would duplicate/hijack the owner's record).
  // Undefined for children created locally before sign-in — treated as owned
  // by whoever signs in.
  ownerId?: string;
}

export interface VaccineReactions {
  fever?: boolean;
  fussiness?: boolean;
  redness?: boolean;
  drowsiness?: boolean;
  notes?: string;
}
export type NewChild = Omit<Child, 'id' | 'createdAt' | 'updatedAt'>;

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccineCode: string;
  doseNumber: number;
  administeredOn: IsoDate;
  locationOfAdministration?: string;
  batchNumber?: string;
  notes?: string;
  photoUri?: string;
  reactions?: VaccineReactions;
  isCustom?: boolean;
  customVaccineName?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
export type NewVaccinationRecord = Omit<VaccinationRecord, 'id' | 'createdAt' | 'updatedAt'>;

export interface DoctorVisit {
  id: string;
  childId: string;
  visitedOn: IsoDate;
  doctorName?: string;
  clinicName?: string;
  reason?: string;
  notes?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
export type NewDoctorVisit = Omit<DoctorVisit, 'id' | 'createdAt' | 'updatedAt'>;

export interface GrowthEntry {
  id: string;
  childId: string;
  measuredOn: IsoDate;
  heightCm?: number;
  weightKg?: number;
  headCircumferenceCm?: number;
  notes?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
export type NewGrowthEntry = Omit<GrowthEntry, 'id' | 'createdAt' | 'updatedAt'>;

export interface MilestoneRecord {
  id: string;
  childId: string;
  milestoneCode: string;
  achievedOn: IsoDate;
  notes?: string;
  photoUri?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
export type NewMilestoneRecord = Omit<MilestoneRecord, 'id' | 'createdAt' | 'updatedAt'>;

// ─── Daily care logging (feeding / sleep / diaper) ───────────────────────────
// A personal record-keeping log a parent fills in by hand. Non-medical (Health
// & Fitness): no thresholds, no assessment — just what happened and when.
export type CareLogType = 'feed' | 'sleep' | 'diaper';
export type FeedType = 'breast' | 'bottle' | 'solids';
export type DiaperType = 'wet' | 'dirty' | 'both';

export interface CareLog {
  id: string;
  childId: string;
  type: CareLogType;
  // Event time for feed/diaper; sleep start for sleep. ISO datetime.
  startAt: IsoDateTime;
  // Sleep end (absent while a sleep is still in progress).
  endAt?: IsoDateTime;
  // feed-only
  feedType?: FeedType;
  amountMl?: number;
  // diaper-only
  diaperType?: DiaperType;
  note?: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}
export type NewCareLog = Omit<CareLog, 'id' | 'createdAt' | 'updatedAt'>;

export interface VaccineDose {
  doseNumber: number;
  recommendedAgeMonths: number;
  earliestAgeMonths?: number;
  latestAgeMonths?: number;
}

export interface VaccineScheduleEntry {
  code: string;
  displayName: LocalizedString;
  description?: LocalizedString;
  doses: VaccineDose[];
}

export interface CountryVaccinationSchedule {
  countryCode: string;
  countryName: LocalizedString;
  sourceUrl: string;
  lastReviewedOn: IsoDate;
  vaccines: VaccineScheduleEntry[];
}

export type MilestoneCategory = 'motor' | 'language' | 'social' | 'cognitive';

export interface MilestoneDefinition {
  code: string;
  displayName: LocalizedString;
  description?: LocalizedString;
  category: MilestoneCategory;
  recommendedAgeMonths: number;
  earliestAgeMonths?: number;
  latestAgeMonths?: number;
}
