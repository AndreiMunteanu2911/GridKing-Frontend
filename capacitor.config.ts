import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gridking.app',
  appName: 'GridKing',
  webDir: 'dist/grid-king/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
