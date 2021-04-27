// @flow
import o from "ospec"
import n from "../nodemocker"
import {DesktopContextMenu} from "../../../src/desktop/DesktopContextMenu"
import {downcast} from "../../../src/api/common/utils/Utils"
import {DesktopDownloadManager} from "../../../src/desktop/DesktopDownloadManager"
import {WindowManager} from "../../../src/desktop/DesktopWindowManager"

o.spec("DesktopContextMenu Test", () => {
	const standardMocks = () => {
		// node modules
		const electron = {
			clipboard: {
				writeText: () => {}
			},
			Menu: n.classify({
				prototype: {
					append: function () {},
					popup: function () {},
				},
				statics: {}
			}),
			MenuItem: n.classify({
				prototype: {
					enabled: true,
					constructor: function (p) {
						Object.assign(this, p)
					}
				},
				statics: {}
			})
		}

		const wm = {
			ipc: n.classify({
				prototype: {
					sendRequest: () => Promise.resolve()
				},
				statics: {}
			})
		}

		const dl = n.classify({
			prototype: {
				saveBlob: () => {},
			},
			statics: {}
		})

		const electronMock: $Exports<"electron"> = n.mock('electron', electron).set()
		const wmMock: WindowManager = n.mock("WindowManager", wm).set()
		const dlMock: DesktopDownloadManager = n.mock("DesktopDownloadManager", dl).set()
		return {
			electronMock,
			wmMock,
			dlMock
		}
	}

	o("can handle undefined browserWindow and webContents in callback", () => {
		const {electronMock, wmMock, dlMock} = standardMocks()
		const contextMenu = new DesktopContextMenu(electronMock, wmMock, dlMock)
		contextMenu.open({
			linkURL: "nourl",
			editFlags: {
				canCut: false,
				canPaste: false,
				canCopy: false,
				canUndo: false,
				canRedo: false
			},
			hasImageContents: false,
			mediaType: "none"
		})
		downcast(electronMock.MenuItem).mockedInstances.forEach(i => i.click && i.click(undefined, undefined))
		downcast(electronMock.MenuItem).mockedInstances.forEach(i => i.click && i.click(undefined, "nowebcontents"))
	})
})