/**
 * Expo config plugin: sets ENABLE_USER_SCRIPT_SANDBOXING = NO on every
 * CocoaPods target via post_install.
 *
 * Why: Xcode 16 enables user script sandboxing by default. React Native 0.81's
 * Hermes build phase uses backtick command substitution that Xcode 16 flags as
 * "Invalid expression encountered" when sandboxing is active.
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PATCH = `
  # Xcode 16 fix: disable user script sandboxing for all pods
  # (RN 0.81 Hermes build phase uses backtick syntax Xcode 16 rejects)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
    end
  end
`;

module.exports = function withDisableScriptSandboxing(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');

      // Only patch once
      if (contents.includes('ENABLE_USER_SCRIPT_SANDBOXING')) {
        return cfg;
      }

      // Insert our code just before the closing `end` of post_install block
      // The block looks like:  post_install do |installer|\n  ...\n  end
      contents = contents.replace(
        /(post_install do \|installer\|[\s\S]*?)(^\s*end)/m,
        `$1${PATCH}\n$2`
      );

      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
};
