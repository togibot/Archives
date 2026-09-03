import 'dotenv/config';
import { initializeSupabasePersistence } from './services/supabase-persistence.js';

await initializeSupabasePersistence();
await import('./index.js');
