import { style } from 'typestyle'

const tabS = style({
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	padding: '0.2em',
	position: 'relative',
})

const faviconS = style({
	height: '1em',
	width: '1em',
	verticalAlign: 'top',
})

const FavIconBoxS = style({
	display: 'inline-block',
	height: '1em',
	marginRight: '0.25em',
	width: '1em',
	overflow: 'hidden',
})

const tabControlsS = style({
	float: 'right',
	backgroundColor: 'lightgrey',
	// make sure the controls are clickable (ie, above the tab)
		position: 'absolute',
		right: '5px',
		top: '50%',
		transform: 'translateY(-50%)',
	zIndex: 100,
})

const WindowHeaderS = style({
	padding: '0.2em',
	borderBottom: '2.5px solid black',
})

const WindowControlsS = style({
	float: 'right',
	backgroundColor: 'lightgrey',
})

const WindowS = style({
	border: '1.5px solid black',
	display: 'flex',
	flexDirection: 'column',
})

const TabContainerS = style({ padding: '0.2em' })

const newTabS = style({
	border: '2px solid darkslateblue',
	backgroundColor: 'cornflowerblue',
	borderRadius: '5px',
	alignSelf: 'center',
	margin: '0.2em',
	fontSize: '1em',
})

const TabTitleS = style({
	display: 'inline',
})

export {
	TabTitleS,
	tabS,
	faviconS,
	FavIconBoxS,
	tabControlsS,
	WindowS,
	WindowHeaderS,
	WindowControlsS,
	TabContainerS,
	newTabS,
}
