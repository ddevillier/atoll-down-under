import fs from 'node:fs';
import path from 'node:path';
export function loadNarrationCredential() {
 if (process.env.OPENAI_API_KEY) return;
 const envFile = process.env.ATOLL_NARRATION_ENV || path.resolve('.env.local');
 if (fs.existsSync(envFile)) process.loadEnvFile(envFile);
 if (!process.env.OPENAI_API_KEY) throw new Error('Set OPENAI_API_KEY or ATOLL_NARRATION_ENV for optional speech generation. Running and building the game require neither.');
}

