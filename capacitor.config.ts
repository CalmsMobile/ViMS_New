import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ViMSNew',
  webDir: 'www',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      'android-minSdkVersion': '19',
      BackupWebStorage: 'none',
      AutoHideSplashScreen: 'false',
      ShowSplashScreen: 'true',
      SplashMaintainAspectRatio: 'true',
      ShowSplashScreenSpinner: 'true',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '1200',
      FadeSplashScreenDuration: '1000',
      FadeSplashScreen: 'true'
    }
  }
};

export default config;
