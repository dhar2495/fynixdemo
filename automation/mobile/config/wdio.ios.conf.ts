import type { Options } from '@wdio/types';
import { shared } from './wdio.shared.conf';

/** Point APP_PATH at the .app (simulator) or .ipa (device) build. */
export const config: Options.Testrunner = {
  ...shared,
  port: 4723,
  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 15',
      'appium:platformVersion': process.env.IOS_VERSION || '17.5',
      'appium:app': process.env.APP_PATH || './builds/SyslaFynix.app',
      'appium:newCommandTimeout': 240,
    },
  ] as any,
};
