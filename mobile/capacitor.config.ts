import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jose.streammetrics',
  appName: 'Panel Ejecutivo Streaming',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['192.168.1.76', '*.local']
  },
  android: {
    allowMixedContent: true
  }
};

export default config;