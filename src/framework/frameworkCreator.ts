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
  if (!maptool.isConnected()) {
    throw new Error('Connect to MapTool before creating a new Framework');
  }

  if (!vscode.workspace.workspaceFolders) {
    throw new Error('No Workspace Folders found.');
  }

  // Check to make sure the directory is empty
  const frameworkDirectory = vscode.workspace.workspaceFolders[0].uri;
  const files = await vfs.readDirectory(frameworkDirectory);

  // Check to see if the user is sure this is the correct directory to creaate the framework.
  if (files.length > 0) {
    const opt = await vscode.window.showWarningMessage(
      `${frameworkDirectory.fsPath} is not empty!`,
      { modal: true },
      'Create Anyway',
    );
    if (!opt || opt !== 'Create Anyway') {
      return undefined;
    }
  } else {
    const opt = await vscode.window.showWarningMessage(
      `Create new MapTool Framework in ${frameworkDirectory.fsPath}?`,
      { modal: true },
      'Create',
    );
    if (!opt || opt !== 'Create') {
      return undefined;
    }
  }

  return Framework.createNewFramework(maptool, frameworkDirectory);
};
