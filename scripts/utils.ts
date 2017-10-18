let __IS_PROD__ = process.env.NODE_ENV === 'production'
let __IS_DEV__ = !__IS_PROD__
let __PORT__ = parseInt(process.env.PORT || '80')

function applyCommandLineOptions() {
	const argv = require('yargs')
		.option('development', {
			alias: 'd',
			default: false,
		})
		.option('port', {
			alias: 'p',
			default: 0,
		})
		.option('update-snapshots', {
			alias: 's',
			default: false,
		})
		.argv
	process.env.NODE_ENV = !!argv.development ? 'development' : 'production'
	__IS_PROD__ = process.env.NODE_ENV === 'production'
	process.env.PORT = argv.port || (__IS_PROD__ ? 80 : 8080)
	process.env.UPDATE_SNAPSHOTS = argv['update-snapshots']
	// prevent Sparky from also interpreting these cli options
	process.argv = process.argv.filter(arg => arg[0] !== ('-'))
	__IS_PROD__ = process.env.NODE_ENV === 'production'
	__IS_DEV__ = !__IS_PROD__
	__PORT__ = parseInt(process.env.PORT || '80')
	return { __IS_PROD__, __IS_DEV__, __PORT__ }
}

function getReplacements() {
	const flags = {
		__IS_PROD__,
		__IS_DEV__,
		'process.env.NODE_ENV': __IS_PROD__ ? "'production'" : "'development'",
	}

	return {...flags}
}

const webExports = { }

const directory = {
	homeDir: 'src',
	outFolder: 'build',
	js: 'js',
}

export {
	__IS_DEV__,
	__IS_PROD__,
	getReplacements,
	webExports,
	applyCommandLineOptions,
	directory,
}
