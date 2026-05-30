/**
 * Expo config plugin: removes the broad photo/video media permissions from the
 * Android manifest.
 *
 * Why: Kartochka only needs to PICK photos (milestone photos, child avatar),
 * which uses the Android system photo picker — that requires NO permission.
 * It no longer saves to the gallery (sharing is used instead), so it has no
 * use for READ_MEDIA_IMAGES / READ_MEDIA_VIDEO. A dependency (e.g.
 * expo-image-picker) can still inject these into the merged manifest, so we
 * emit explicit `tools:node="remove"` directives — the Gradle manifest merger
 * then strips them no matter which library contributes them. This avoids the
 * Google Play "Photo and video permissions" declaration and means we don't
 * request access we never use.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const REMOVE = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
];

module.exports = function withStripMediaPermissions(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.$ = manifest.$ || {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }
    if (!Array.isArray(manifest['uses-permission'])) {
      manifest['uses-permission'] = [];
    }
    // Drop any plain declarations of these, then add explicit remove directives
    // so the merger strips them even when a library contributes them.
    manifest['uses-permission'] = manifest['uses-permission'].filter(
      (p) => !REMOVE.includes(p?.$?.['android:name'])
    );
    for (const name of REMOVE) {
      manifest['uses-permission'].push({
        $: { 'android:name': name, 'tools:node': 'remove' },
      });
    }
    return cfg;
  });
};
