import type { Options } from '@wdio/types';
import { shared } from './wdio.shared.conf';

/** Point APP_PATH at the APK produced by EAS / GitHub Actions. */
export const config: Options.Testrunner = {
  ...shared,
  port: 4723,
  capabilities: [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE || 'Pixel_7_API_34',
      'appium:app': process.env.APP_PATH || './builds/SyslaFynix.apk',
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 240,
    },
  ] as any,
};
