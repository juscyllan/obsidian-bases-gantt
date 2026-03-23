import { watch as fsWatch } from 'node:fs';

const prod = Bun.argv.includes('production');
const watchMode = Bun.argv.includes('--watch');

async function build() {
  const [js, css] = await Promise.all([
    Bun.build({
      entrypoints: ['src/main.ts'],
      outdir: '.',
      naming: 'main.js',
      format: 'cjs',
      target: 'browser',

      minify: prod,
      sourcemap: prod ? 'none' : 'inline',
      external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*'],
    }),
    Bun.build({
      entrypoints: ['src/styles/main.css'],
      outdir: '.',
      naming: 'styles.css',
      minify: prod,
    }),
  ]);

  if (!js.success || !css.success) {
    console.log('❌ Build Failed');
    for (const log of [...js.logs, ...css.logs]) console.error(log);
    return false;
  }

  console.log(`✅ Build Sucess: watch=${watchMode} target=${prod ? 'prod' : 'dev'}`);
  return true;
}

function watch() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  console.log('...watching src/ for changes...');

  fsWatch('src', { recursive: true }, (_event, filename) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      timer = null;
      console.log(`🔄 ${filename}`);
      await build();
    }, 100);
  });
}

const ok = await build();
if (!ok && !watchMode) process.exit(1);

if (watchMode) watch();
