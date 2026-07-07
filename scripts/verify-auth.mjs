// Verificación rápida: inicia sesión como el usuario demo y consulta datos.
// Comprueba que credenciales + Auth + RLS + seed funcionan juntos.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const { error: authErr } = await supabase.auth.signInWithPassword({
  email: 'demo@klarvo.local',
  password: 'demo1234',
});
if (authErr) {
  console.error('LOGIN FALLIDO:', authErr.message);
  process.exit(1);
}
console.log('✓ Login OK como demo@klarvo.local');

const { data: negocios, error: e1 } = await supabase
  .from('negocios')
  .select('nombre, vertical');
const { data: servicios, error: e2 } = await supabase
  .from('servicios')
  .select('nombre');
const { data: citas, error: e3 } = await supabase
  .from('citas')
  .select('estado, servicios(nombre)')
  .order('inicio');

if (e1 || e2 || e3)
  console.error('Errores:', e1?.message, e2?.message, e3?.message);
console.log('Negocio (RLS):', negocios);
console.log('Servicios:', servicios?.length);
console.log(
  'Citas de hoy:',
  citas?.map((c) => `${c.estado} · ${c.servicios?.nombre}`),
);
