const vscode = require("vscode");
const { getBitmeloPanel, hasBitmeloPanel, resetBitmeloPanel } = require("./bitmeloPanel.js");
let context = null;

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(_context) {
	context = _context;
	context.subscriptions.push(
		vscode.commands.registerCommand("bitmelo-editor-unofficial.init", initProject)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("bitmelo-editor-unofficial.open", openProject)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("bitmelo-editor-unofficial.syncCode", syncCode)
	);
}

function deactivate() { }



function initProject() {
	resetBitmeloPanel();

	vscode.window
		.showWarningMessage("This will overwrite existing files, continue?", "Yes", "No")
		.then(async answer => {
			if (answer !== "Yes") return;

			const panel = await getBitmeloPanel(context.extensionUri, context, vscode.ViewColumn.Beside, updatePanel, openProject);

			allowUpdateAfter = Date.now() + 1000;

			setTimeout(async () => {
				const project = panel.getProject();

				try {
					await saveProject(project);
					await exportProjectCodeFiles(project);
				} catch {
					vscode.window
						.showErrorMessage("Cound not save project.")
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
			.showErrorMessage("Cound not load project.")
		return;
	}
	const panel = await getBitmeloPanel(context.extensionUri, context, vscode.ViewColumn.Active, updatePanel, openProject);
	panel.setProject(project);
	allowUpdateAfter = Date.now() + 2000;
}

/* async function exportCode() {
	if (!hasBitmeloPanel()) {
		vscode.window
			.showWarningMessage("Open the Bitmelo Editor First.");
		return;
	}

	const panel = await getBitmeloPanel(context.extensionUri, context, vscode.ViewColumn.Active, updatePanel, openProject);
	const project = panel.getProject();
	try {
		await exportProjectCodeFiles(project);
	} catch {
		vscode.window
			.showErrorMessage("Cound not save project code.")
	}
} */

async function syncCode() {
	if (!hasBitmeloPanel()) {
		vscode.window
			.showWarningMessage("Open the Bitmelo Editor First.");
		return;
	}

	const panel = await getBitmeloPanel(context.extensionUri, context, vscode.ViewColumn.Active, updatePanel, openProject);
	try {
		await importProjectCodeFiles(panel);
	} catch {
		vscode.window
			.showErrorMessage("Cound not load project code.")
	}
}

let allowUpdateAfter = Date.now();

async function updatePanel(panel) {
	if (Date.now() < allowUpdateAfter) return;

	try {
		const result = await projectOnDiskChanged();
		if (result.changed) {
			panel.setProject(result.foundProject);
		} else {
			saveProject(panel.getProject());
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

function loadProject() {
	const uri = vscode.Uri.joinPath(getWorkspaceUri(), "bitmeloExport.json");
	return vscode.workspace.fs.readFile(uri)
		.then((data) => data.toString());
}

function saveProject(project) {
	if (project === projectOnDisk) return;
	let uri;
	uri = vscode.Uri.joinPath(getWorkspaceUri(), "bitmeloExport.json");
	return vscode.workspace.fs.writeFile(uri,
		Buffer.from(project)).then(() => {
			projectOnDisk = project;
		});
}

async function exportProjectCodeFiles(project) {
	const scripts = JSON.parse(project).code.scripts;
	const codeFolderUri = vscode.Uri.joinPath(getWorkspaceUri(), "code");

	await vscode.workspace.fs.createDirectory(codeFolderUri);

	const oldFiles = await vscode.workspace.fs.readDirectory(codeFolderUri);

	const deletedFiles = [];
	for (const [name, type] of oldFiles) {
		if (type !== vscode.FileType.File) continue;
		const codeFileUri = vscode.Uri.joinPath(codeFolderUri, name);
		deletedFiles.push(vscode.workspace.fs.delete(codeFileUri));
	}
	Promise.all(deletedFiles).then(() => {
		setTimeout(() => {
			for (let i = 0; i < scripts.length; i++) {
				const script = scripts[i];
				const codeFileUri = vscode.Uri.joinPath(codeFolderUri, `${i}_${script.name}.js`);
				vscode.workspace.fs.writeFile(codeFileUri, Buffer.from(script.text));
			}
		}, 500);
	});
}

async function importProjectCodeFiles(panel) {
	const project = JSON.parse(panel.getProject());
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

	Promise.all(readFiles).then(() => {
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
		project.code.scripts = scripts;
		panel.setProject(JSON.stringify(project));
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