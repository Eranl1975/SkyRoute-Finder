/**
 * Booking Approval Workflow
 *
 * All booking requests go through a human-approval gate before any
 * real booking action is taken. This prevents accidental purchases.
 *
 * Flow:
 *   1. User clicks "Book" → creates ApprovalRequest (status: pending)
 *   2. Admin (or same user with confirmation) reviews request
 *   3. Admin approves → booking service proceeds
 *   4. Admin rejects → request cancelled, user notified
 *
 * Storage: in-memory for now.
 * TODO: Persist to Supabase `booking_approvals` table for audit trail.
 */
import type { NormalizedFlight } from '@/types/flight';
import type { NormalizedHotel } from '@/types/hotel';
import { nowISO, generateId } from '@/lib/utils';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface ApprovalRequest {
  id: string;
  type: 'flight' | 'hotel';
  item: NormalizedFlight | NormalizedHotel;
  requestedBy: string;       // userId or session id
  requestedAt: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  expiresAt: string;         // auto-expire after 15 min
}

// In-memory store (replace with Supabase in production)
const queue = new Map<string, ApprovalRequest>();

const EXPIRY_MS = 15 * 60 * 1000;

export const approvalWorkflow = {
  request(type: 'flight' | 'hotel', item: NormalizedFlight | NormalizedHotel, requestedBy: string): ApprovalRequest {
    const req: ApprovalRequest = {
      id: generateId(),
      type,
      item,
      requestedBy,
      requestedAt: nowISO(),
      status: 'pending',
      expiresAt: new Date(Date.now() + EXPIRY_MS).toISOString(),
    };
    queue.set(req.id, req);
    return req;
  },

  approve(id: string, reviewedBy: string): ApprovalRequest {
    const req = this._get(id);
    const updated = { ...req, status: 'approved' as const, reviewedBy, reviewedAt: nowISO() };
    queue.set(id, updated);
    return updated;
  },

  reject(id: string, reviewedBy: string, reason?: string): ApprovalRequest {
    const req = this._get(id);
    const updated = { ...req, status: 'rejected' as const, reviewedBy, reviewedAt: nowISO(), rejectionReason: reason };
    queue.set(id, updated);
    return updated;
  },

  getPending(): ApprovalRequest[] {
    const now = Date.now();
    return [...queue.values()].filter((r) => {
      if (r.status !== 'pending') return false;
      if (new Date(r.expiresAt).getTime() < now) {
        queue.set(r.id, { ...r, status: 'expired' });
        return false;
      }
      return true;
    });
  },

  getAll(): ApprovalRequest[] {
    return [...queue.values()];
  },

  _get(id: string): ApprovalRequest {
    const req = queue.get(id);
    if (!req) throw new Error(`Approval request ${id} not found`);
    if (req.status !== 'pending') throw new Error(`Request ${id} is already ${req.status}`);
    if (new Date(req.expiresAt).getTime() < Date.now()) throw new Error(`Request ${id} has expired`);
    return req;
  },
};
