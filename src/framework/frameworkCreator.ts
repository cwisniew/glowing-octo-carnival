import { Framework } from './Framework';
import axios from 'axios';

import * as fs from 'fs';
import * as vscode from 'vscode';
import { MapTool } from '../maptool/MapTool';
const vfs = vscode.workspace.fs;

/**
 *
 * @param maptool Function to create a new {@link Framework}.
 *
 * @returns a {@link Framework}.
 */
export const frameworkCreator = async (
  maptool: MapTool,
): Promise<Framework | undefined> => {
  const webApplUrlPrefix = maptool.getWebAppUrlPrefix();
  if (!maptool.isConnected() || !webApplUrlPrefix) {
    vscode.window.showInformationMessage(
      'Connect to MapTool before creating a new Framework',
    );
    return undefined;
  }

  // prompt user for location of the frameworks directory
  const fileUri = await vscode.window.showOpenDialog({
    canSelectMany: false,
    openLabel: 'Framework Directory',
    canSelectFiles: false,
    canSelectFolders: true,
  });

  // Check to see if user selected a directory or canceled.
  if (!fileUri || !fileUri[0]) {
    return undefined;
  }

  // Check to make sure the directory is empty
  const frameworkDirectory = fileUri[0];
  const files = await vfs.readDirectory(frameworkDirectory);
  if (files.length > 0) {
    const opt = await vscode.window.showWarningMessage(
      `${frameworkDirectory.fsPath} is not empty!`,
      { modal: true },
      'Create Anyway',
    );
    if (!opt || opt !== 'Create Anyway') {
      return undefined;
    }
  }

  // Request a new id for this framework
  const response = await axios.get(
    webApplUrlPrefix + '/frameworks/newFrameworkId',
  );

  // default values for the framework file.
  const frameworkInfo = {
    id: response.data.id,
    name: 'myFramework',
    version: '1.0.0',
    url: 'www.example.com',
    githb: 'yourname/yourrepo',
    exportedFunctions: [],
    exportedProperties: [],
    libToken: {
      name: 'myLibToken',
      version: '1.0.0',
      definedFunctions: [],
      libraryProperties: [],
    },
  };

  const frameworkInfoFile = vscode.Uri.joinPath(
    frameworkDirectory,
    'framework.json',
  );

  // Create the starter framework.json file in the selected directory
  fs.writeFileSync(
    frameworkInfoFile.fsPath,
    JSON.stringify(frameworkInfo, null, 2),
  );

  // Open the new framework file in the editor.
  const doc = await vscode.workspace.openTextDocument(frameworkInfoFile);
  const editor = await vscode.window.showTextDocument(doc, 1, false);

  vscode.workspace.updateWorkspaceFolders(0, 0, { uri: frameworkDirectory });
  console.log('DEBUG: ' + vscode.workspace.name);
  return new Framework(maptool, frameworkInfo.id);
};
