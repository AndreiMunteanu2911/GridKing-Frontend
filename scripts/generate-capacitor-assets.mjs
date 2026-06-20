import sharp from 'sharp';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'public', 'favicon.png');
const resDir = join(root, 'android', 'app', 'src', 'main', 'res');

function hex({ r, g, b }) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function luminance({ r, g, b }) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

async function extractPalette() {
  const { data } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const colors = new Map();
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] < 230) continue;
    const value = { r: data[index], g: data[index + 1], b: data[index + 2] };
    const key = hex(value);
    const current = colors.get(key);
    colors.set(key, current ? { ...current, count: current.count + 1 } : { ...value, count: 1 });
  }
  const ranked = [...colors.values()].filter((color) => color.count > 100).sort((a, b) => b.count - a.count);
  const background = ranked.find((color) => luminance(color) < 0.35) ?? ranked[0];
  const greens = ranked.filter((color) => color.g > color.r * 1.35 && color.g > color.b * 1.2 && hex(color) !== hex(background));
  const golds = ranked.filter((color) => color.r > 180 && color.g > 80 && color.b < 80);
  const creams = ranked.filter((color) => color.r > 230 && color.g > 210 && color.b > 150);
  const primary = greens[0] ?? background;
  const bright = greens.find((color) => luminance(color) > luminance(primary) + 0.08) ?? greens[1] ?? primary;
  const accent = golds[0] ?? ranked[1];
  const accentDark = golds.find((color) => luminance(color) < luminance(accent) - 0.05) ?? accent;
  const accentLight = creams[0] ?? accent;
  return {
    background: hex(background),
    primary: hex(primary),
    bright: hex(bright),
    accent: hex(accent),
    accentDark: hex(accentDark),
    accentLight: hex(accentLight),
  };
}

function rgb(value) {
  const normalized = value.replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
    alpha: 1,
  };
}

async function composeIcon(destination, width, height, background, scale) {
  const logoSize = Math.round(Math.min(width, height) * scale);
  const logo = await sharp(source).resize(logoSize, logoSize, { fit: 'contain' }).png().toBuffer();
  const metadata = await sharp(logo).metadata();
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: background ? rgb(background) : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: logo, left: Math.round((width - metadata.width) / 2), top: Math.round((height - metadata.height) / 2) }])
    .png()
    .toFile(destination);
}

function writeTheme(palette) {
  writeFileSync(
    join(root, 'src', 'theme.generated.css'),
    `:root {
  --gridking-background: ${palette.background};
  --gridking-primary: ${palette.primary};
  --gridking-bright: ${palette.bright};
  --gridking-accent: ${palette.accent};
  --gridking-accent-dark: ${palette.accentDark};
  --gridking-accent-light: ${palette.accentLight};
}

@theme {
  --color-emerald-950: ${palette.background};
  --color-emerald-900: ${palette.background};
  --color-emerald-800: ${palette.primary};
  --color-emerald-700: ${palette.primary};
  --color-emerald-600: ${palette.primary};
  --color-emerald-500: ${palette.bright};
  --color-emerald-300: ${palette.bright};
  --color-yellow-500: ${palette.accent};
  --color-yellow-400: ${palette.accent};
  --color-yellow-300: ${palette.accent};
  --color-yellow-200: ${palette.accentLight};
  --color-lime-200: ${palette.accentLight};
}
`,
  );
}

function writeAndroidXml(palette) {
  const values = join(resDir, 'values');
  const valuesV31 = join(resDir, 'values-v31');
  mkdirSync(values, { recursive: true });
  mkdirSync(valuesV31, { recursive: true });
  writeFileSync(join(values, 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${palette.background}</color>\n</resources>\n`);
  writeFileSync(join(values, 'colors.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="colorPrimary">${palette.primary}</color>\n    <color name="colorPrimaryDark">${palette.background}</color>\n    <color name="colorAccent">${palette.accent}</color>\n    <color name="gridkingBackground">${palette.background}</color>\n</resources>\n`);
  writeFileSync(join(resDir, 'drawable', 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">\n    <path android:fillColor="${palette.background}" android:pathData="M0,0h108v108h-108z" />\n</vector>\n`);
  writeFileSync(join(resDir, 'drawable-v24', 'ic_launcher_foreground.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">\n    <path android:fillColor="#00000000" android:pathData="M0,0h108v108h-108z" />\n</vector>\n`);
  writeFileSync(join(valuesV31, 'styles.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">\n        <item name="windowSplashScreenBackground">@color/gridkingBackground</item>\n        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>\n        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>\n    </style>\n</resources>\n`);
}

async function main() {
  if (!existsSync(source)) throw new Error(`Icon not found: ${source}`);
  const metadata = await sharp(source).metadata();
  if (!metadata.width || !metadata.height || metadata.width !== metadata.height) throw new Error('public/favicon.png must be a square image.');
  const palette = await extractPalette();
  console.log(`GridKing icon: ${metadata.width}x${metadata.height}`);
  console.log(palette);
  writeTheme(palette);

  const iconSizes = {
    'mipmap-mdpi': { launcher: 48, adaptive: 108 },
    'mipmap-hdpi': { launcher: 72, adaptive: 162 },
    'mipmap-xhdpi': { launcher: 96, adaptive: 216 },
    'mipmap-xxhdpi': { launcher: 144, adaptive: 324 },
    'mipmap-xxxhdpi': { launcher: 192, adaptive: 432 },
  };
  for (const [directory, sizes] of Object.entries(iconSizes)) {
    const output = join(resDir, directory);
    mkdirSync(output, { recursive: true });
    await composeIcon(join(output, 'ic_launcher.png'), sizes.launcher, sizes.launcher, palette.background, 0.9);
    await composeIcon(join(output, 'ic_launcher_round.png'), sizes.launcher, sizes.launcher, palette.background, 0.9);
    await composeIcon(join(output, 'ic_launcher_foreground.png'), sizes.adaptive, sizes.adaptive, null, 0.68);
  }

  const splashSizes = {
    drawable: [480, 320],
    'drawable-land-mdpi': [480, 320],
    'drawable-land-hdpi': [800, 480],
    'drawable-land-xhdpi': [1280, 720],
    'drawable-land-xxhdpi': [1600, 960],
    'drawable-land-xxxhdpi': [1920, 1280],
    'drawable-port-mdpi': [320, 480],
    'drawable-port-hdpi': [480, 800],
    'drawable-port-xhdpi': [720, 1280],
    'drawable-port-xxhdpi': [960, 1600],
    'drawable-port-xxxhdpi': [1280, 1920],
  };
  for (const [directory, [width, height]] of Object.entries(splashSizes)) {
    const output = join(resDir, directory);
    mkdirSync(output, { recursive: true });
    await composeIcon(join(output, 'splash.png'), width, height, palette.background, 0.3);
  }

  const webIcons = join(root, 'public', 'icons');
  mkdirSync(webIcons, { recursive: true });
  await composeIcon(join(webIcons, 'icon-192.png'), 192, 192, palette.background, 0.9);
  await composeIcon(join(webIcons, 'icon-512.png'), 512, 512, palette.background, 0.9);
  await composeIcon(join(webIcons, 'maskable-512.png'), 512, 512, palette.background, 0.68);
  writeFileSync(join(root, 'public', 'manifest.webmanifest'), JSON.stringify({ name: 'GridKing', short_name: 'GridKing', start_url: '/', display: 'standalone', background_color: palette.background, theme_color: palette.primary, icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 2) + '\n');
  writeAndroidXml(palette);
  console.log('GridKing Capacitor, Android, and web assets generated.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
