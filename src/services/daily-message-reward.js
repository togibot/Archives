import { addTokens, claimFirstMessageReward } from '../database/index.js';

const BASE_REWARD = 100;
const BONUS_CHANCE = 0.30;

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

function getBrazilDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export function grantFirstDailyMessageReward(jid) {
  const date = getBrazilDate();
  if (!claimFirstMessageReward(jid, date)) return null;

  const bonus = rollBonus();
  const total = BASE_REWARD + bonus;
  const user = addTokens(jid, total);

  return {
    base: BASE_REWARD,
    bonus,
    total,
    balance: user.tokens
  };
}
