/**
 * Supabase cloud-backup sync (v1).
 *
 * Strategy:
 *   syncUp   — upsert all local records to Supabase
 *   syncDown — pull Supabase records and merge into local store (newest updatedAt wins)
 *   fullSync — syncUp then syncDown
 *
 * Called:
 *   - on sign-in  → fullSync  (push local data, then pull anything from the cloud)
 *   - on app start when already signed in → syncDown (pick up changes from other devices)
 *
 * All functions are fire-and-forget safe — errors are swallowed so they
 * never crash the app. Local store is always the source of truth.
 */

import { supabase } from './supabase';
import { useChildrenStore } from '../stores/childrenStore';
import type { Child, DoctorVisit, GrowthEntry, MilestoneRecord, VaccinationRecord } from '../types';

// ─── Field mappers ────────────────────────────────────────────────────────────
// Supabase columns are snake_case and some names differ from local camelCase.

function childToRow(c: Child, userId: string) {
  return {
    id: c.id,
    user_id: userId,
    name: c.name,
    date_of_birth: c.dateOfBirth,
    sex: c.sex,
    country_code: c.countryCode,
    photo_uri: c.photoUri ?? null,
    blood_type: c.bloodType ?? null,
    allergy_notes: c.allergyNotes ?? null,
    medication_notes: c.medicationNotes ?? null,
    emergency_contact: c.emergencyContact ?? null,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToChild(row: any): Child {
  return {
    id: row.id,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    sex: row.sex,
    countryCode: row.country_code,
    ...(row.photo_uri ? { photoUri: row.photo_uri } : {}),
    ...(row.blood_type ? { bloodType: row.blood_type } : {}),
    ...(row.allergy_notes ? { allergyNotes: row.allergy_notes } : {}),
    ...(row.medication_notes ? { medicationNotes: row.medication_notes } : {}),
    ...(row.emergency_contact ? { emergencyContact: row.emergency_contact } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function vaccinationToRow(v: VaccinationRecord, userId: string) {
  return {
    id: v.id,
    user_id: userId,
    child_id: v.childId,
    vaccine_code: v.vaccineCode,
    dose_index: v.doseNumber,           // schema uses dose_index
    given_on: v.administeredOn,         // schema uses given_on
    location: v.locationOfAdministration ?? null,
    batch: v.batchNumber ?? null,
    notes: v.notes ?? null,
    photo_uri: v.photoUri ?? null,
    reactions: v.reactions ?? null,
    created_at: v.createdAt,
    updated_at: v.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToVaccination(row: any): VaccinationRecord {
  return {
    id: row.id,
    childId: row.child_id,
    vaccineCode: row.vaccine_code,
    doseNumber: row.dose_index,
    administeredOn: row.given_on,
    ...(row.location ? { locationOfAdministration: row.location } : {}),
    ...(row.batch ? { batchNumber: row.batch } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    ...(row.photo_uri ? { photoUri: row.photo_uri } : {}),
    ...(row.reactions ? { reactions: row.reactions } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function growthToRow(g: GrowthEntry, userId: string) {
  return {
    id: g.id,
    user_id: userId,
    child_id: g.childId,
    measured_on: g.measuredOn,
    weight_kg: g.weightKg ?? null,
    height_cm: g.heightCm ?? null,
    head_cm: g.headCircumferenceCm ?? null,  // schema uses head_cm
    notes: g.notes ?? null,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToGrowth(row: any): GrowthEntry {
  return {
    id: row.id,
    childId: row.child_id,
    measuredOn: row.measured_on,
    ...(row.weight_kg != null ? { weightKg: Number(row.weight_kg) } : {}),
    ...(row.height_cm != null ? { heightCm: Number(row.height_cm) } : {}),
    ...(row.head_cm != null ? { headCircumferenceCm: Number(row.head_cm) } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function milestoneToRow(m: MilestoneRecord, userId: string) {
  return {
    id: m.id,
    user_id: userId,
    child_id: m.childId,
    milestone_code: m.milestoneCode,
    achieved_on: m.achievedOn,
    photo_uri: m.photoUri ?? null,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMilestone(row: any): MilestoneRecord {
  return {
    id: row.id,
    childId: row.child_id,
    milestoneCode: row.milestone_code,
    achievedOn: row.achieved_on,
    ...(row.photo_uri ? { photoUri: row.photo_uri } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function doctorVisitToRow(d: DoctorVisit, userId: string) {
  return {
    id: d.id,
    user_id: userId,
    child_id: d.childId,
    visited_on: d.visitedOn,
    doctor: d.doctorName ?? null,     // schema uses doctor (not doctor_name)
    clinic: d.clinicName ?? null,     // schema uses clinic (not clinic_name)
    reason: d.reason ?? null,
    notes: d.notes ?? null,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDoctorVisit(row: any): DoctorVisit {
  return {
    id: row.id,
    childId: row.child_id,
    visitedOn: row.visited_on,
    ...(row.doctor ? { doctorName: row.doctor } : {}),
    ...(row.clinic ? { clinicName: row.clinic } : {}),
    ...(row.reason ? { reason: row.reason } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Merge helper ─────────────────────────────────────────────────────────────
// For each record, keep whichever version (local vs remote) has the newer updatedAt.
// ISO strings are lexicographically comparable, so string comparison works correctly.

function merge<T extends { id: string; updatedAt: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>(local.map((r) => [r.id, r]));
  for (const r of remote) {
    const existing = map.get(r.id);
    if (!existing || r.updatedAt > existing.updatedAt) {
      map.set(r.id, r);
    }
  }
  return Array.from(map.values());
}

// ─── Sync up ─────────────────────────────────────────────────────────────────
// Push all local records to Supabase. Uses upsert so it's safe to run multiple times.

export async function syncUp(userId: string): Promise<void> {
  const { children, vaccinations, growthEntries, milestones, doctorVisits } =
    useChildrenStore.getState();

  // Children must go first to satisfy FK constraints on the other tables.
  if (children.length > 0) {
    await supabase
      .from('children')
      .upsert(children.map((c) => childToRow(c, userId)), { onConflict: 'id' });
  }
  if (vaccinations.length > 0) {
    await supabase
      .from('vaccination_records')
      .upsert(vaccinations.map((v) => vaccinationToRow(v, userId)), { onConflict: 'id' });
  }
  if (growthEntries.length > 0) {
    await supabase
      .from('growth_records')
      .upsert(growthEntries.map((g) => growthToRow(g, userId)), { onConflict: 'id' });
  }
  if (milestones.length > 0) {
    await supabase
      .from('milestone_records')
      .upsert(milestones.map((m) => milestoneToRow(m, userId)), { onConflict: 'id' });
  }
  if (doctorVisits.length > 0) {
    await supabase
      .from('doctor_visits')
      .upsert(doctorVisits.map((d) => doctorVisitToRow(d, userId)), { onConflict: 'id' });
  }
}

// ─── Sync down ────────────────────────────────────────────────────────────────
// Pull all Supabase records for this user and merge into the local store.

export async function syncDown(userId: string): Promise<void> {
  const store = useChildrenStore.getState();

  const [childrenRes, vaccRes, growthRes, mileRes, visitRes] = await Promise.all([
    supabase.from('children').select('*').eq('user_id', userId),
    supabase.from('vaccination_records').select('*').eq('user_id', userId),
    supabase.from('growth_records').select('*').eq('user_id', userId),
    supabase.from('milestone_records').select('*').eq('user_id', userId),
    supabase.from('doctor_visits').select('*').eq('user_id', userId),
  ]);

  const remoteChildren = (childrenRes.data ?? []).map(rowToChild);
  const remoteVaccinations = (vaccRes.data ?? []).map(rowToVaccination);
  const remoteGrowth = (growthRes.data ?? []).map(rowToGrowth);
  const remoteMilestones = (mileRes.data ?? []).map(rowToMilestone);
  const remoteVisits = (visitRes.data ?? []).map(rowToDoctorVisit);

  const mergedChildren = merge(store.children, remoteChildren);
  const mergedVaccinations = merge(store.vaccinations, remoteVaccinations);
  const mergedGrowth = merge(store.growthEntries, remoteGrowth);
  const mergedMilestones = merge(store.milestones, remoteMilestones);
  const mergedVisits = merge(store.doctorVisits, remoteVisits);

  // Preserve the selected child if it still exists, otherwise fall back to first.
  const { selectedChildId } = store;
  const newSelectedChildId =
    selectedChildId && mergedChildren.some((c) => c.id === selectedChildId)
      ? selectedChildId
      : (mergedChildren[0]?.id ?? null);

  useChildrenStore.setState({
    children: mergedChildren,
    vaccinations: mergedVaccinations,
    growthEntries: mergedGrowth,
    milestones: mergedMilestones,
    doctorVisits: mergedVisits,
    selectedChildId: newSelectedChildId,
  });
}

// ─── Full sync ────────────────────────────────────────────────────────────────
// Push local data up first, then pull the merged result back down.
// Used on sign-in so the cloud immediately has all the user's existing records.

export async function fullSync(userId: string): Promise<void> {
  await syncUp(userId);
  await syncDown(userId);
}
