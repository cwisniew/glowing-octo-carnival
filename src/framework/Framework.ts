import * as vscode from 'vscode';
import * as fs from 'fs';
import { MapTool } from '../maptool/MapTool';
import axios from 'axios';
import { StarterFramework } from './StarterFramework';

const vfs = vscode.workspace.fs;

const NEW_FRAMEWORK_ID_URL_PART = '/frameworks/newFrameworkId';
const CREATE_FRAMEWORK_URL_PART = '/frameworks/';

const FRAMEWORK_SUBDIRS = [
  { description: 'Source Directory', path: 'src' },
  { description: 'MapTool Macro Source', path: 'src/mtmacro' },
  { description: 'Resources Directory', path: 'resources' },
  { description: 'Static Data', path: 'resources/static-data' },
  { description: 'Data', path: 'resources/data' },
  { description: 'Images', path: 'resources/images' },
  { description: 'Audion', path: 'resources/audio' },
];

interface FrameWorkAPIInfo {
  frameworkInfo: any;
  libTokenInfo?: any;
}

/**
 * Class used to represent a framework.
 */
export class Framework {
  /** The framework.json file. */
  private readonly frameworkInfoFile: vscode.Uri;

  /** The libtoken.json file. */
  private readonly libTokenInfoFile: vscode.Uri;

  /**
   * Returns a new id that can be used in a new framework.
   * @param maptool the {@link MapTool} instance to retrieve the id from.
   * @returns the new id.
   */
  private static async getNewId(maptool: MapTool): Promise<string> {
    // Request a new id for this framework
    const webApplUrlPrefix = maptool.getWebAppUrlPrefix();
    const response = await axios.get(
      webApplUrlPrefix + NEW_FRAMEWORK_ID_URL_PART,
    );

    return response.data.id;
  }

  /**
   * Creates a new MapTool Framework.
   * @param maptool the {@link MapTool} instance for this {@link Framework}.
   * @param workspaceFolder the workspace folder for this {@link Framework}.
   * @returns the newly created framework.
   */
  public static async createNewFramework(
    maptool: MapTool,
    workspaceFolder: vscode.Uri,
  ): Promise<Framework> {
    if (!maptool.isConnected()) {
      throw new Error('Connect to MapTool before creating a new Framework');
    }

    const id = await Framework.getNewId(maptool);
    const framework = new Framework(maptool, id, workspaceFolder);

    await framework.initFrameworkDirectory();
    return framework;
  }

  /**
   * Creates a Framework objects.
   * @param maptool the instance of {@link MapTool} that is connected.
   * @param id the id of the Framework.
   * @param workspaceFolder the workspace folder for the Framework.
   */
  private constructor(
    private readonly maptool: MapTool,
    private readonly id: string,
    private workspaceFolder: vscode.Uri,
  ) {
    this.frameworkInfoFile = vscode.Uri.joinPath(
      this.workspaceFolder,
      'framework.json',
    );
    this.libTokenInfoFile = vscode.Uri.joinPath(
      this.workspaceFolder,
      'libtoken.json',
    );
  }

  /**
   * Returns the id of the framework.
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Initialises the contents of the framework directory for a new framework.
   */
  public async initFrameworkDirectory(): Promise<void> {
    const fw = new StarterFramework(this, this.maptool);
    await fw.create();

    // Open the new framework file in the editor.
    const doc = await vscode.workspace.openTextDocument(this.frameworkInfoFile);
    const editor = await vscode.window.showTextDocument(doc, 1, false);
  }

  /**
   * Uploads the framework to MapTool.
   */
  public async uploadFramework(): Promise<void> {
    // Request a new id for this framework
    const webApplUrlPrefix = this.maptool.getWebAppUrlPrefix();
    if (!webApplUrlPrefix) {
      throw new Error('Web App URL Prefix is undefined.');
    }
    const contents = fs.readFileSync(this.frameworkInfoFile.fsPath).toString();
    let libToken = undefined;
    if (fs.existsSync(this.libTokenInfoFile.fsPath)) {
      libToken = fs.readFileSync(this.libTokenInfoFile.fsPath).toString();
    }
    let sendData: FrameWorkAPIInfo = { frameworkInfo: JSON.parse(contents) };
    if (libToken) {
      sendData = { ...sendData, libTokenInfo: JSON.parse(libToken) };
    }
    const { data } = await axios.put(
      webApplUrlPrefix + CREATE_FRAMEWORK_URL_PART,
      sendData,
    );

    console.log(data);

    if (data.status !== 'ok') {
      throw new Error(data.error);
    }
  }

  /**
   * Returns the path to a given subdirectory within the workspace for the framework.
   * @param subpath the path of the subdirectory.
   * @returns the path to the subdirectory within the workspace.
   */
  public getDirectoryPath(subpath: string): vscode.Uri {
    return vscode.Uri.joinPath(this.workspaceFolder, subpath);
  }

  /**
   * Creates a subdirectory for a framework with the workspace.
   * @param subpath the subdirectory within the workspace.
   * @returns {@code true} if the directory was created or exists, {@code false} otherwise.
   */
  public createFrameworkDirectory(subpath: string): boolean {
    const path = this.getDirectoryPath(subpath);
    if (fs.existsSync(path.fsPath)) {
      const stat = fs.lstatSync(path.fsPath);
      if (!stat.isDirectory()) {
        return false;
      }
    } else {
      fs.mkdirSync(path.fsPath);
    }

    return true;
  }

  public getWorkspaceFolder(): vscode.Uri {
    return this.workspaceFolder;
  }

  public getFrameworkInfoFile(): vscode.Uri {
    return this.frameworkInfoFile;
  }

  public getFrameworkSubdirs(): { description: string; path: string }[] {
    return FRAMEWORK_SUBDIRS;
  }
}
