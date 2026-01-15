import esbuild from 'esbuild';
import { mkdir } from 'node:fs/promises';

await mkdir('www', { recursive: true });

await esbuild.build({
  entryPoints: ['src/native-bridge.js'],
  bundle: true,
  format: 'iife',
  target: ['es2018'],
  outfile: 'www/native-bridge.bundle.js',
  platform: 'browser',
  sourcemap: false,
  minify: true
});

console.log('✅ native-bridge.bundle.js generado');
