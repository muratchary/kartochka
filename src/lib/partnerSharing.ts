/**
 * Partner sharing utilities.
 *
 * How it works:
 *  1. Owner taps "Share" on a child → we generate a 6-char code and store it in
 *     Supabase (child_share_links table). The code expires in 7 days.
 *  2. Partner enters the code in their app → we look up the code, create a
 *     child_partners record, then syncDown so the child appears in their store.
 *  3. From then on, both users' sync calls pull the shared child automatically
 *     because the partner RLS policies allow access.
 */

import { supabase } from './supabase';
import { newId } from '../utils/id';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 ambiguity

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

// ── Generate a share code for a child ────────────────────────────────────────

export async function generateShareCode(
  childId: string,
  userId: string,
): Promise<string> {
  // Delete any existing codes for this child from this owner first
  await supabase
    .from('child_share_links')
    .delete()
    .eq('child_id', childId)
    .eq('owner_user_id', userId);

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from('child_share_links').insert({
    code,
    owner_user_id: userId,
    child_id: childId,
    expires_at: expiresAt,
  });

  if (error) throw new Error(error.message);
  return code;
}

// ── Accept a share code ───────────────────────────────────────────────────────

export interface AcceptResult {
  childId: string;
  ownerUserId: string;
}

export async function acceptShareCode(
  code: string,
  partnerUserId: string,
): Promise<AcceptResult> {
  const clean = code.trim().toUpperCase();

  // Look up the code
  const { data: link, error: lookupError } = await supabase
    .from('child_share_links')
    .select('*')
    .eq('code', clean)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (lookupError || !link) {
    throw new Error('invalid_code');
  }

  if (link.owner_user_id === partnerUserId) {
    throw new Error('own_code'); // can't partner with yourself
  }

  // Create the partnership (upsert — safe to call multiple times)
  const { error: partnerError } = await supabase
    .from('child_partners')
    .upsert(
      {
        id: newId(),
        owner_user_id: link.owner_user_id,
        partner_user_id: partnerUserId,
        child_id: link.child_id,
      },
      { onConflict: 'partner_user_id,child_id' },
    );

  if (partnerError) throw new Error(partnerError.message);

  return { childId: link.child_id, ownerUserId: link.owner_user_id };
}

// ── Get active share code for a child ────────────────────────────────────────

export async function getActiveShareCode(
  childId: string,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('child_share_links')
    .select('code, expires_at')
    .eq('child_id', childId)
    .eq('owner_user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .single();

  return data?.code ?? null;
}

// ── List children this user has been given partner access to ─────────────────

export async function getPartnerChildren(
  userId: string,
): Promise<Array<{ childId: string; ownerUserId: string }>> {
  const { data } = await supabase
    .from('child_partners')
    .select('child_id, owner_user_id')
    .eq('partner_user_id', userId);

  return (data ?? []).map((r) => ({
    childId: r.child_id,
    ownerUserId: r.owner_user_id,
  }));
}

// ── Revoke partner access ─────────────────────────────────────────────────────

export async function revokePartnerAccess(
  childId: string,
  ownerUserId: string,
): Promise<void> {
  await supabase
    .from('child_partners')
    .delete()
    .eq('child_id', childId)
    .eq('owner_user_id', ownerUserId);

  // Also delete any share links for this child
  await supabase
    .from('child_share_links')
    .delete()
    .eq('child_id', childId)
    .eq('owner_user_id', ownerUserId);
}
