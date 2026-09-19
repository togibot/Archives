import { ensureUser, addTokens, addOwnerFund, getGroup, updateGroup } from '../database/index.js';

const MAX_TAX = 10;

function normalizeJid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.includes('@') ? raw : raw + '@s.whatsapp.net';
}

export function getGroupTax(groupJid) {
  return Number(getGroup(groupJid)?.tax_percent || 0);
}

export function setGroupTax(groupJid, percent) {
  const value = Math.max(0, Math.min(MAX_TAX, Math.trunc(Number(percent))));
  updateGroup(groupJid, { tax_percent: value });
  return value;
}

export function isGroupAdmin(metadata, jid) {
  const normalized = normalizeJid(jid);
  return Boolean(metadata?.participants?.some(p => {
    const participantJid = normalizeJid(p.id || p.jid);
    return participantJid === normalized && (p.admin === 'admin' || p.admin === 'superadmin');
  }));
}

export function getGroupAdminJids(metadata) {
  return [...new Set((metadata?.participants || [])
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => normalizeJid(p.id || p.jid))
    .filter(Boolean))];
}

export function distributeGroupPurchase({ amount, groupJid, metadata }) {
  const price = Math.max(0, Math.trunc(Number(amount)));
  const taxPercent = getGroupTax(groupJid);
  if (!price) return { tax: 0, adminTotal: 0, ownerTotal: 0, admins: [] };

  const tax = Math.floor(price * taxPercent / 100);
  const ownerTotal = price - tax;
  const admins = getGroupAdminJids(metadata);

  if (!admins.length) {
    addOwnerFund(price);
    return { tax, adminTotal: 0, ownerTotal: price, admins: [] };
  }

  const base = Math.floor(tax / admins.length);
  let remainder = tax - base * admins.length;

  for (const jid of admins) {
    const share = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    if (share > 0) {
      ensureUser(jid, jid.split('@')[0]);
      addTokens(jid, share);
    }
  }

  if (ownerTotal > 0) addOwnerFund(ownerTotal);
  return { tax, adminTotal: tax, ownerTotal, admins };
}
