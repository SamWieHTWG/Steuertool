import { readFileSync } from 'fs';
import { join } from 'path';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  const raw = readFileSync(join(process.cwd(), 'data', 'data.json'), 'utf-8');
  return { data: JSON.parse(raw) };
};
