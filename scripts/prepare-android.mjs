import { cp, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generated = path.join(root, 'android');
const template = path.join(root, 'android-template');

try { await stat(generated); } catch {
  console.error('Android project not found. Run "npm run android:add" once, then run this command again.');
  process.exit(1);
}

const copies = [
  ['app/src/main/AndroidManifest.xml', 'app/src/main/AndroidManifest.xml'],
  ['app/build.gradle', 'app/build.gradle'],
  ['app/src/main/res', 'app/src/main/res']
];
for (const [from, to] of copies) {
  const source = path.join(template, from);
  const destination = path.join(generated, to);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}
console.log('Applied VerWin Android/DeX overlays to the generated Capacitor project.');
