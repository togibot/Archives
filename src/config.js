export const config = {
  bot: {
    name: 'Togi Bot',
    shortName: 'Togi',
    prefix: '.',
    version: '1.0.0'
  },
  owner: {
    numbers: (process.env.OWNER_NUMBERS || '').split(',').map(v => v.trim()).filter(Boolean)
  },
  economy: {
    currency: '🪙',
    name: 'Token',
    dailyAmount: 250,
    startingBalance: 100
  },
  connection: {
    authDir: process.env.AUTH_DIR || './data/auth',
    pairingPhone: process.env.PAIRING_PHONE || ''
  }
};

export default config;
