const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force CommonJS resolution for packages that ship dynamic import() in
// their ES module build (e.g. @supabase/supabase-js uses
// import(OTEL_PKG) for OpenTelemetry tracing, which Hermes cannot parse
// and fails the production build with "Invalid expression encountered").
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
