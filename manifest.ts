interface IManifestOptions {
	backgroundSrcFile: string
}
export function makeManifest(options: IManifestOptions) {
	const { backgroundSrcFile } = options

	return {
		manifest_version: 2,
		name: 'Tab Manager',
		description: 'Manage tabs',
		version: '0.1.0',
		icons: {
		},
		permissions: [
			'tabs', 'storage', 'activeTab', '<all_urls>', 'storage', 'unlimitedStorage',
		],
		commands: {
			'show-tab-switcher': {
				suggested_key: {
					default: 'Ctrl+Shift+Period',
				},
				description: 'Show the Fast Tab Switcher',
			},
		},
		background: {
			scripts: [backgroundSrcFile],
			persistent: false,
		},
		content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
	}
}
