// Records the real Nexum desktop UI (Vite preview) with a mocked Tauri backend,
// the same technique as apps/desktop/e2e/library.spec.ts. Frames → GIF with ImageMagick.
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';

const require = createRequire('/Users/super/Desktop/Projet epitech/Nexum/apps/desktop/package.json');
const { chromium } = require('playwright');

const OUT = process.argv[2];
const SHOT = process.argv[3] === 'shot';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });

await page.addInitScript(() => {
  const step = (order, type, params) => ({ order, type, params, enabled: true, on_error: 'continue' });
  const modes = [
    {
      id: 'gaming', name: 'Gaming', category: 'gaming', description: 'Partie classée, zéro distraction',
      steps: [
        step(1, 'system.close_app', { name: 'Google Chrome' }),
        step(2, 'audio.set_volume', { percent: 70 }),
        step(3, 'display.set_brightness', { percent: 60 }),
        step(4, 'iot.hue.activate_scene', { scene: 'Arène' }),
        step(5, 'gaming.launch_steam', { app_id: '730' }),
      ],
    },
    {
      id: 'work', name: 'Travail', category: 'work', description: 'Outils ouverts, lumière de bureau',
      steps: [step(1, 'system.launch_app', { name: 'Visual Studio Code' }), step(2, 'audio.set_volume', { percent: 40 })],
    },
    {
      id: 'chill', name: 'Chill', category: 'chill', description: 'Lumière tamisée, musique',
      steps: [step(1, 'iot.hue.activate_scene', { scene: 'Détente' }), step(2, 'display.set_brightness', { percent: 40 })],
    },
    {
      id: 'stream', name: 'Stream', category: 'streaming', description: 'Direct prêt en un clic',
      steps: [step(1, 'system.launch_app', { name: 'OBS' }), step(2, 'system.open_url', { url: 'https://twitch.tv' })],
    },
  ];
  const callbacks = new Map();
  let nextId = 1;
  const listeners = [];
  const emit = (payload) => listeners.forEach((id) => callbacks.get(id)?.({ event: 'engine-event', id: 0, payload }));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const messages = {
    'system.close_app': 'Google Chrome fermé',
    'audio.set_volume': 'Volume réglé à 70 %',
    'display.set_brightness': 'Luminosité réglée à 60 %',
    'iot.hue.activate_scene': 'Scène « Arène » activée',
    'gaming.launch_steam': 'Counter-Strike 2 lancé',
  };
  Object.assign(window, {
    __TAURI_INTERNALS__: {
      metadata: { currentWindow: { label: 'main' }, currentWebview: { label: 'main' } },
      transformCallback: (cb) => { const id = nextId++; callbacks.set(id, cb); return id; },
      unregisterCallback: (id) => callbacks.delete(id),
      invoke: async (command, args) => {
        if (command === 'get_modes') return modes;
        if (command === 'action_catalog') return [...new Set(modes.flatMap((m) => m.steps.map((s) => s.type)))];
        if (command === 'get_action_availability') return null;
        if (command === 'get_automations') return [];
        if (command === 'check_connections') return [
          { id: 'audio', available: true, detail: 'Sortie audio accessible' },
          { id: 'display', available: true, detail: 'Écran contrôlable' },
          { id: 'hue', available: true, detail: 'Pont Philips Hue appairé' },
        ];
        if (command === 'plugin:event|listen') { if (args?.event === 'engine-event') listeners.push(args.handler); return args?.handler ?? 1; }
        if (command === 'plugin:window|is_maximized') return false;
        if (command === 'activate_mode') {
          const mode = modes.find((m) => m.id === args.id);
          emit({ kind: 'mode_started', mode_id: mode.id, name: mode.name });
          const steps = [];
          for (const s of mode.steps) {
            emit({ kind: 'step_started', action_type: s.type, order: s.order });
            await wait(650);
            const message = messages[s.type] ?? 'OK';
            emit({ kind: 'step_finished', action_type: s.type, order: s.order, success: true, status: 'ok', message });
            steps.push({ order: s.order, action_type: s.type, success: true, status: 'ok', message });
          }
          emit({ kind: 'mode_finished', mode_id: mode.id, success: true });
          return { mode_id: mode.id, success: true, steps };
        }
        return null;
      },
    },
  });
});

await page.route('**/health', (r) => r.fulfill({ json: { status: 'ok', service: 'nexum-cloud' } }));
await page.goto('http://127.0.0.1:1420/');
await page.waitForTimeout(1500);

if (SHOT) {
  await page.screenshot({ path: `${OUT}/full.png`, fullPage: true });
  await browser.close();
  process.exit(0);
}

let n = 0;
const frame = async () => page.screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png` });
const hold = async (ms) => { const end = Date.now() + ms; while (Date.now() < end) await frame(); };

await hold(1200);
const button = page.getByRole('button', { name: 'Activer directement Gaming', exact: true });
await button.hover();
await hold(500);
const click = button.click();
await hold(4600);
await click;
await hold(1800);
await browser.close();
console.log('frames', n);
