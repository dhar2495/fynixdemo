import type { Options } from '@wdio/types';

/** Base config shared by Android and iOS runners. */
export const shared: Partial<Options.Testrunner> = {
  runner: 'local',
  specs: ['../test/**/*.e2e.ts'],
  maxInstances: 1,
  logLevel: 'info',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: { ui: 'bdd', timeout: 120_000 },
  services: ['appium'],
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: { transpileOnly: true, project: '../tsconfig.json' },
  },
};
