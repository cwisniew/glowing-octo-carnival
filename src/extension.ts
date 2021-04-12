// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { downloadDirToExecutablePath } from 'vscode-test/out/util';
import { Framework } from './framework/Framework';
import { frameworkCreator } from './framework/frameworkCreator';
import { MapTool } from './maptool/MapTool';

let maptool: MapTool | undefined;
let framework: Framework | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'maptool-framework-support.newFramework',
      async () => {
        if (!maptool) {
          vscode.window.showInformationMessage(
            'Connect to MapTool before creating a new Framework',
          );
          return;
        }
        try {
          framework = await frameworkCreator(maptool);
          vscode.window.showInformationMessage('Framework created.');
        } catch (e) {
          vscode.window.showInformationMessage(e.message);
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'maptool-framework-support.connect',
      async () => {
        maptool = new MapTool('localhost', 8080);
        await maptool.connect();
        const host = maptool.getHost();
        const port = maptool.getPort();
        const maptoolVersion = maptool.getMaptoolVersion();
        const webAppVersion = maptool.getWebAppVersion();
        vscode.window.showInformationMessage(
          `Connected to ${host}:${port} MapTool Version ${maptoolVersion}, WebApp Version ${webAppVersion}`,
        );
      },
    ),
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
