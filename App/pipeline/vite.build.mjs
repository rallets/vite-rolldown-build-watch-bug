import path from 'node:path'
import fs from 'node:fs';
import { build } from 'vite'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/* 
 * VITE
 * command: vite/vite dev/vite serve => 'serve', vite build => 'build'
 * mode: vite dev => 'development', vite build => 'production'
*/

if (!process.env.NODE_ENV) {
    throw new Error('process.env.NODE_ENV not set [production|development]')
}

if (!process.env.MODE) {
    throw new Error('process.env.MODE not set [production|development]')
}

const basePath = process.cwd();
const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.env.MODE === 'development';
const outDir = path.resolve(basePath, 'wwwroot/dist-v3/build');

console.log('Using configurations', {
    'MODE:': process.env.MODE,
    'NODE_ENV': process.env.NODE_ENV,
    basePath,
    isProduction,
    isWatch,
    outDir
});

const apps = [
    { root: path.resolve(basePath, './Views/InspectionV3/'), alias: 'inspectionv3', entry: './Views/InspectionV3/InspectionV3.entry.ts' }
];

// to be able to generate separated js and css assets, we need to build each app separately.
const builds = apps.map(app => {
    console.log('Building app', { app });

    return build({
        root: app.root,
        appType: 'custom',
        build: {
            // https://rollupjs.org/configuration-options/#watch
            watch: isWatch ? {
                buildDelay: 100,
                clearScreen: true,
                exclude: 'node_modules/**'
            } : undefined,

            // https://rollupjs.org/configuration-options/
            rollupOptions: {
                input: {
                    [app.alias]: app.entry
                },
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                    assetFileNames: `${app.alias}.[ext]`,
                },
            },

            // we don't have a "public" dir, we use fs.cpSync(...) instead
            copyPublicDir: false,

            outDir: outDir,
            sourcemap: true,
            modulePreload: {
                polyfill: true
            },
            emptyOutDir: false,
            cssCodeSplit: false,
            minify: isProduction,
            reportCompressedSize: false,

            // default 500
            chunkSizeWarningLimit: 2500
        },
        plugins: [
            svelte({
                emitCss: true,
                preprocess: [vitePreprocess({ script: false, style: true })],
                compilerOptions: {
                    css: 'external',

                    // enable run-time checks when not in production
                    dev: !isProduction,
                },

                
            })
        ],

    })
});

// top level async function is not supported by "concurrently", the vite process exits immediately
async function buildApps() {
    for (let build of builds) {
        await build;
    }
}

try {
    console.log(`Preparing ${outDir}`);

    try {
        // to avoid concurrency issues, the folder could be cleaned from a custom npm script in package.json, "v[x]-clean".
        fs.mkdirSync(outDir, { recursive: true });
    } catch (err) {
        console.error(err)
    }

    console.log('Building svelte apps');

    buildApps();

} catch (e) {
    console.error(e);
    process.exit(1);
}

/*
 * NB. Do not return an exit code, for example via `process.exit(0)`, otherwise
 * "concurrently" will not wait for the script completion while in watch mode.
 */
