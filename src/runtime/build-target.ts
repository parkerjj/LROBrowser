export type ClientBuildTarget = 'iwa' | 'web' | 'native';

declare const __LASTRO_BUILD_TARGET__: ClientBuildTarget | undefined;

export const CLIENT_BUILD_TARGET: ClientBuildTarget = typeof __LASTRO_BUILD_TARGET__ === 'undefined'
  ? 'iwa'
  : __LASTRO_BUILD_TARGET__;

export const IS_WEB_BUILD = CLIENT_BUILD_TARGET === 'web';
export const IS_NATIVE_BUILD = CLIENT_BUILD_TARGET === 'native';
