import { renderLuis } from 'luis/dist/client/components'

declare var FuseBox: any
FuseBox.import('**/*.story')
renderLuis()
