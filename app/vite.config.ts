import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ENDPOINT } from './settings/app.json';
import checkEnvs from './checks/check-env-equality.cjs';

const { HOST, PORT, PROTOCOL, GRAPHQL } = ENDPOINT || {};

// https://vitejs.dev/config/
export default async ({ mode, skipEqualityTest = false }) => {
  const modes = {
    development: 'dev',
    staging: 'staging',
    production: 'main',
    // alpha: "alpha",
  };
  if (!skipEqualityTest) {
    await checkEnvs({ mode: modes[mode] ?? mode }); // if mode is not there in "modes" then pass it as it is
  }
  /** LOOKENV MOCK */
  const extension = modes[mode] || 'dev';
  console.log({ mode, extension });
  process.env = { ...process.env, ...loadEnv(mode, `${process.cwd()}/env/`) };
  const envFile = await import(`./env/lookenv.${extension}.js`);
  if (!envFile) {
    console.error(`lookenv.${extension}.js is missing`);
    process.exit(1);
  }

  const viteEnvPrefix = 'VITE_APP_';

  Object.entries({ ...envFile.default }).forEach(function ([key, value]) {
    if (key.slice(0, viteEnvPrefix.length) !== viteEnvPrefix) {
      console.error(
        `Error: ${key} needs to prefixed like "${viteEnvPrefix}${key}"`
      );
      process.exit(1);
    }

    if (value.required && !process.env[key]) {
      console.error(`Error: ${key} is required`);
      process.exit(1);
    }
  });

  /** END LOOKENV */
  const __dirname = './';
  return defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '#': path.resolve(__dirname, './'),
      },
    },
    envDir: './env',
    build: {
      outDir: 'build',
    },
    server: {
      port: 8007,
      strictPort: true,
      proxy: {
        // string shorthand
        // '/graphql': `http://localhost:${PORT}/graphql`,
        // with options
        [GRAPHQL]: {
          target: `${PROTOCOL}://${HOST}:${PORT}`,
          //  changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/graphql/, 'graphql')
        },
        // // with RegEx
        // '^/fallback/.*': {
        //   target: 'http://jsonplaceholder.typicode.com',
        //   changeOrigin: true,
        //   rewrite: (path) => path.replace(/^\/fallback/, '')
        // }
      },
    },
    plugins: [react(), tsconfigPaths()],
  });
};
