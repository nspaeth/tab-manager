import { applyCommandLineOptions, directory, getReplacements } from './scripts/utils'
const { __IS_PROD__, __IS_DEV__, __PORT__ } = applyCommandLineOptions()

import * as fs from 'fs'
import * as path from 'path'
import {
	CopyPlugin,
	EnvPlugin,
	FuseBox,
	JSONPlugin,
	Sparky,
	CSSPlugin,
	TypeScriptHelpers,
	ReplacePlugin,
	QuantumPlugin,
	WebIndexPlugin,
} from 'fuse-box'

import { TypeHelper } from 'fuse-box-typechecker/dist/commonjs'
import { Bundle } from 'fuse-box/dist/typings/core/Bundle'
import { FuseBoxOptions } from 'fuse-box/dist/typings/core/FuseBox'

interface IPackageVars { version: string; }
const pkg: IPackageVars = require('./package.json')

interface IEnvVars {
	VERSION: string
	NODE_ENV: 'development' | 'production'
	YEAR: number
}

Sparky.task('default', ['clean', 'build', 'start', 'run'], () => { })
Sparky.task('clean', () => Sparky.src(`${directory.outFolder}/*`).clean(`${directory.outFolder}`))

function makeConfig(options: any = {}) {
	const replacements = getReplacements()
	const { __IS_DEV__ } = replacements
	const config = {
		homeDir: directory.homeDir,
		output: `${directory.outFolder}/$name-$hash.js`,
		sourceMaps: __IS_DEV__,
		hash: false,
		runAllMatchedPlugins: true,
		warnings: true,
		plugins: [
			JSONPlugin(),
			(ReplacePlugin as any)(replacements),
			EnvPlugin({
				VERSION: pkg.version,
				NODE_ENV: __IS_DEV__ ? 'development' : 'production',
				YEAR: new Date().getFullYear(),
			}),
			WebIndexPlugin({
				//target: 'luis.html',
				template: 'src/ui/index.html',
				bundles: ['vendor-ui', 'ui'],
			}),
			CSSPlugin(),
			__IS_PROD__ && QuantumPlugin({
//				removeExportsInterop: false, // needed by React?
				bakeApiIntoBundle: 'vendor-ui',
				manifest: true,
				treeshake: true,
				uglify: !__IS_DEV__,
				target: 'browser',
			}),
		],
	}

	return {...config, ...options}
}

const typeHelper = TypeHelper({
	name: 'None',
	basePath: './',
	tsLint: './tslint.json',
	tsConfig: './tsconfig.json',
	shortenFilenames: true,
})

let client: FuseBox
let clientBundle: Bundle
let testsBundle: Bundle
Sparky.task('build', () => {
	// Client Bundles
	client = FuseBox.init(makeConfig())
	client
		.bundle('vendor-ui')
		.instructions('~ ui/index.ts')
		.target('browser')

	clientBundle = client.bundle('ui')
		.instructions('> [ui/index.ts]')
		.target('browser')

	clientBundle = client.bundle('background')
		.instructions('> background/index.ts')
		.target('browser')

	client
		.bundle('test')
		// .sourceMaps(false)
		// .target('browser')
    .test("[**/**.test.ts]", {})
})

Sparky.task('start', () => {
	if (__IS_DEV__) {
		clientBundle.watch()
	}
	typeHelper.runWatch('./src')
});

import { makeManifest } from './manifest'
Sparky.task('run', async () => {
	const clientProducer = await client.run();

  const manifest = makeManifest({ backgroundSrcFile: 'background.js'})
  const outputDir = path.join(__dirname, directory.outFolder);
	fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest));
})

Sparky.task('test', () => {
	client = FuseBox.init(makeConfig({sourceMaps: true}))
	client
	  // .target('browser')
		.bundle('app')
		.sourceMaps(false)
		.test('[**/**.test.ts]', {})
	client.run()
})

import  {
  CSSResourcePlugin,
  UglifyJSPlugin,
} from 'fuse-box'

function runLuis() {
  const serverFuse = FuseBox.init({
    homeDir: 'src',
    output: 'public/$name.js'
  });
  serverFuse
    .bundle('luis-server')
    .watch('server/**') // watch only server related code.. bugs up atm
    .instructions(' > [luis/server.ts]')
    // Execute process right after bundling is completed
    // launch and restart express
    .completed(proc => proc.start());
    serverFuse.run();
}

Sparky.task('luis', () => {
  const luisFuse = FuseBox.init({
    emitHMRDependencies : true,
    homeDir: 'src',
    output: 'public/$name.js',
    plugins: [
      JSONPlugin(),
      CSSPlugin({
        group: 'luis.css',
        outFile: `public/styles/luis.css`,
        inject: false
      }),
      WebIndexPlugin({ template: 'node_modules/luis/dist/client/index.html', target: 'luis.html' }),
    ],
    shim: {
      crypto: {
        exports: '{ randomBytes: () => crypto.getRandomValues(new global.Uint16Array(1))[0] }'
      },
      stream: {
        exports: '{ Writable: function() {}, Readable: function() {}, Transform: function() {} }'
      }
    }
  });

  luisFuse.dev({
    port: 4445,
    httpServer: false
  });

  luisFuse
    .bundle('luis-vendor')
    // Watching (to add dependencies) it's damn fast anyway
    //.watch()
    // first bundle will get HMR related code injected
    // it will notify as well
    .hmr()
    .target('browser')
    .instructions(' ~ luis/client.ts'); // nothing has changed here

  luisFuse
    .bundle('luis-client')
    .watch() // watch only client related code
    .hmr()
    .target('browser')
    .sourceMaps(true)
    .instructions(' !> [luis/client.ts] + **/**.json + **/**.test.tsx')
    .completed(() => runLuis());

  luisFuse.run();
});
