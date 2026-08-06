import { addTokens, claimDailyReward } from '../database/index.js';

const BASE_REWARD = 100;
const BONUS_CHANCE = 0.30;
const DAY = 24 * 60 * 60 * 1000;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollBonus() {
  if (Math.random() >= BONUS_CHANCE) return 0;

  const roll = Math.random();
  if (roll < 0.55) return randomInt(120, 199);
  if (roll < 0.80) return randomInt(200, 349);
  if (roll < 0.92) return randomInt(350, 599);
  if (roll < 0.98) return randomInt(600, 799);
  return randomInt(800, 1000);
}

export function grantDailyReward(jid) {
  const now = Date.now();
  if (!claimDailyReward(jid, now)) return null;

  const bonus = rollBonus();
  const total = BASE_REWARD + bonus;
  const user = addTokens(jid, total);

  return {
    base: BASE_REWARD,
    bonus,
    total,
    balance: user.tokens,
    nextClaimAt: now + DAY
  };
}
