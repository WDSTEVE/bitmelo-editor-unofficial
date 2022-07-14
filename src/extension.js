const vscode = require("vscode");
const { getBitmeloPanel, resetBitmeloPanel, ifBitmeloPanel } = require("./bitmeloPanel.js");
let context = null;

/**
 * @param {vscode.ExtensionContext} context
 */

let lockChanges = false;

function activate(_context) {
	context = _context;

	context.subscriptions.push(
		vscode.commands.registerCommand("bitmelo-editor-unofficial.init", initProject)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("bitmelo-editor-unofficial.open", openProject)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("bitmelo-editor-unofficial.lock", () => lockChanges = true)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("bitmelo-editor-unofficial.unlock", () => lockChanges = false)
	);

	startWatcher();
}

function deactivate() { }



let lockOnReloadSet = false;

function setLockOnReload(panel) {
	if (lockOnReloadSet) return;

	panel.onUnload.push(() => {
		if (!lockChanges) {
			lockChanges = true;
			panel.onReload.push(() => {
				vscode.window
					.showInformationMessage("Bitmelo editor locked, unlock?", "Yes", "No")
					.then(async answer => {
						if (answer !== "Yes") return;
						lockChanges = false;
					});
			});
		}

		setTimeout(() => {
			lockOnReloadSet = false;
			setLockOnReload(panel);
		}, 0);
	});
	lockOnReloadSet = true;
}

let watcherStarted = false;

function startWatcher() {
	if (watcherStarted) return;

	let codeUri;
	try {
		codeUri = vscode.Uri.joinPath(getWorkspaceUri(), "code");
	} catch {
		vscode.window
			.showErrorMessage("Could not start auto-sync.")
	}

	vscode.workspace.fs.createDirectory(codeUri);
	const watcher = vscode.workspace.createFileSystemWatcher(
		new vscode.RelativePattern(
			codeUri,
			"**/*.js"
		)
	);
	watcher.onDidChange(onWatcherEvent);
	watcher.onDidCreate(onWatcherEvent);
	watcher.onDidDelete(onWatcherEvent);
	watcherStarted = true;
}


async function onWatcherEvent(retry = true) {
	let project;
	try {
		project = await importProjectCodeFiles();
	} catch {
		if (retry) {
			setTimeout(() => onWatcherEvent(false), 100);
		} else {
			vscode.window
				.showErrorMessage("Could not sync code.")
		}
		return;
	}
	ifBitmeloPanel((panel) => {
		panel.setProject(project);
	});
}

function initProject() {
	vscode.window
		.showWarningMessage("This will overwrite existing files, continue?", "Yes", "No")
		.then(async answer => {
			if (answer !== "Yes") return;

			resetBitmeloPanel();
			try {
				const workspaceUri = getWorkspaceUri();
				vscode.workspace.fs.delete(vscode.Uri.joinPath(workspaceUri, "bitmeloExport.json"));
				deleteCodeFiles();
			} catch {

			}
			const panel = await getBitmeloPanel(context.extensionUri, context, vscode.ViewColumn.Beside, updatePanel);
			setLockOnReload(panel);
			startWatcher();

			allowUpdateAfter = Date.now() + 1000;

			setTimeout(async () => {
				const project = panel.getProject();

				try {
					await saveProject(project);
					await exportProjectCodeFiles(project);
				} catch {
					vscode.window
						.showErrorMessage("Could not save project.");
				}
			}, 2000);
		});
}

async function openProject() {
	let project;
	try {
		project = await loadProject(project);
	} catch {
		vscode.window
			.showErrorMessage("Could not load project.");
		return;
	}
	const panel = await getBitmeloPanel(context.extensionUri, context, vscode.ViewColumn.Active, updatePanel);
	setLockOnReload(panel);
	startWatcher();

	panel.setProject(project);
	allowUpdateAfter = Date.now() + 2000;
}

let allowUpdateAfter = Date.now();

async function updatePanel(panel) {
	if (Date.now() < allowUpdateAfter) return;

	try {
		const result = await projectOnDiskChanged();
		if (result.changed) {
			panel.setProject(result.foundProject);
		} else {
			const project = panel.getProject();
			if (lockChanges) {
				if (project !== projectOnDisk) {
					panel.setProject(projectOnDisk);
				}
			} else {
				if (project !== projectOnDisk) {
					saveProject(project);
				}
			}
		}
	} catch {
		return;
	}
}

let projectOnDisk = "";

async function projectOnDiskChanged() {
	const foundProject = await loadProject();
	const changed = foundProject !== projectOnDisk;
	projectOnDisk = foundProject;
	return { changed, foundProject };
}

async function exportProjectCodeFiles(project) {
	const scripts = JSON.parse(project).code.scripts;
	deleteCodeFiles().then(() => {
		setTimeout(() => {
			const codeFolderUri = vscode.Uri.joinPath(getWorkspaceUri(), "code");
			for (let i = 0; i < scripts.length; i++) {
				const script = scripts[i];
				const codeFileUri = vscode.Uri.joinPath(codeFolderUri, `${i}_${script.name}.js`);
				vscode.workspace.fs.writeFile(codeFileUri, Buffer.from(script.text));
			}
		}, 500);
	});

	startWatcher();
}

async function deleteCodeFiles() {
	const codeFolderUri = vscode.Uri.joinPath(getWorkspaceUri(), "code");

	await vscode.workspace.fs.createDirectory(codeFolderUri);

	const oldFiles = await vscode.workspace.fs.readDirectory(codeFolderUri);

	const deletedFiles = [];
	for (const [name, type] of oldFiles) {
		if (type !== vscode.FileType.File) continue;
		const codeFileUri = vscode.Uri.joinPath(codeFolderUri, name);
		deletedFiles.push(vscode.workspace.fs.delete(codeFileUri));
	}

	return Promise.all(deletedFiles);
}

async function importProjectCodeFiles() {
	const scripts = [];

	const codeFolderUri = vscode.Uri.joinPath(getWorkspaceUri(), "code");
	const files = await vscode.workspace.fs.readDirectory(codeFolderUri);

	const readFiles = [];
	for (const [name, type] of files) {
		if (type !== vscode.FileType.File) continue;
		if (!name.endsWith(".js")) continue;
		const codeFileUri = vscode.Uri.joinPath(codeFolderUri, name);
		readFiles.push(vscode.workspace.fs.readFile(codeFileUri).then((data) => {
			const parts = name.substring(0, name.length - 3).split("_");
			const index = Number(parts.shift());
			const scriptName = parts.join("_");
			const script = {
				name: scriptName,
				cursorRow: 0,
				cursorColumn: 0,
				scrollTop: 0,
				text: data.toString()
			};
			scripts[index] = script;
		}));
	}

	return await Promise.all(readFiles).then(async () => {
		for (let i = 0; i < scripts.length; i++) {
			if (scripts[i]) continue;
			scripts[i] = {
				name: "MISSING SCRIPT",
				cursorRow: 0,
				cursorColumn: 0,
				scrollTop: 0,
				text: `\n// Script #${i} not found during import`
			}
		}

		const projectJSON = JSON.parse(await loadProject());
		projectJSON.code.scripts = scripts;
		const project = JSON.stringify(projectJSON);
		await saveProject(project);
		return project;
	});
}

function loadProject() {
	const uri = vscode.Uri.joinPath(getWorkspaceUri(), "bitmeloExport.json");
	return vscode.workspace.fs.readFile(uri)
		.then((data) => data.toString());
}

function saveProject(project) {
	let uri;
	uri = vscode.Uri.joinPath(getWorkspaceUri(), "bitmeloExport.json");
	return vscode.workspace.fs.writeFile(uri,
		Buffer.from(project)).then(() => {
			projectOnDisk = project;
		});
}

function getWorkspaceUri() {
	const folders = vscode.workspace.workspaceFolders;
	if (folders === undefined || folders.length === 0) throw Error("Can't find workspace");
	return folders[0].uri;
}


module.exports = {
	activate,
	deactivate
}
