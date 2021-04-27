// @flow

import type {ContextMenuParams, Menu, MenuItem} from "electron"
import {lang} from "../misc/LanguageViewModel"

type Electron = $Exports<"electron">

export class DesktopContextMenu {

	_menu: Menu;
	_pasteItem: MenuItem;
	_copyItem: MenuItem;
	_cutItem: MenuItem;
	_copyLinkItem: MenuItem;
	_undoItem: MenuItem;
	_redoItem: MenuItem;
	_link: string;
	_downloadImage: MenuItem;

	_itemSourceUrl: ?string

	constructor(electron: Electron, wm: WindowManager, dl: DesktopDownloadManager) {
		this._menu = new electron.Menu()
		this._link = ""
		this._pasteItem = new electron.MenuItem({
			label: lang.get("paste_action"),
			accelerator: "CmdOrCtrl+V",
			click: (mi, bw) => bw && bw.webContents && bw.webContents.paste()
		})
		this._copyItem = new electron.MenuItem({
			label: lang.get("copy_action"),
			accelerator: "CmdOrCtrl+C",
			click: (mi, bw) => bw && bw.webContents && bw.webContents.copy()
		})
		this._cutItem = new electron.MenuItem({
			label: lang.get("cut_action"),
			accelerator: "CmdOrCtrl+X",
			click: (mi, bw) => bw && bw.webContents && bw.webContents.cut()
		})
		this._copyLinkItem = new electron.MenuItem({
			label: lang.get("copyLink_action"),
			click: () => !!this._link && electron.clipboard.writeText(this._link)
		})
		this._undoItem = new electron.MenuItem({
			label: lang.get("undo_action"),
			accelerator: "CmdOrCtrl+Z",
			click: (mi, bw) => bw && bw.webContents && bw.webContents.undo()
		})
		this._redoItem = new electron.MenuItem({
			label: lang.get("redo_action"),
			accelerator: "CmdOrCtrl+Shift+Z",
			click: (mi, bw) => bw && bw.webContents && bw.webContents.redo()
		})
		this._downloadImage = new electron.MenuItem({
			label: lang.get("save_action"),
			click: (mi, bw) => {
				console.log(this._itemSourceUrl)
				const window = wm.get(bw.id)
				window && wm.ipc.sendRequest(window.id, 'resolveObjectUrl', [this._itemSourceUrl])
				            .then((resolved: ResolvedObjectUrl) => {
					            dl.saveBlob(resolved.name || "file", resolved.data, window)
				            })
			}
		})

		this._menu.append(this._copyItem)
		this._menu.append(this._cutItem)
		this._menu.append(this._copyLinkItem)
		this._menu.append(this._pasteItem)
		this._menu.append(new electron.MenuItem({type: 'separator'}))
		this._menu.append(this._undoItem)
		this._menu.append(this._redoItem)
		this._menu.append(this._downloadImage)
	}

	open(params: ContextMenuParams) {
		this._link = params.linkURL
		this._copyLinkItem.enabled = !!params.linkURL

		this._cutItem.enabled = params.editFlags.canCut
		this._pasteItem.enabled = params.editFlags.canPaste
		this._copyItem.enabled = params.editFlags.canCopy
		this._undoItem.enabled = params.editFlags.canUndo
		this._redoItem.enabled = params.editFlags.canRedo
		this._downloadImage.visible = params.hasImageContents && params.mediaType === "image"
		this._itemSourceUrl = params.srcURL || null
		this._menu.popup()
	}
}