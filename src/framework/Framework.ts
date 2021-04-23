import * as vscode from 'vscode';
import * as fs from 'fs';
import { MapTool } from '../maptool/MapTool';
import axios from 'axios';

const vfs = vscode.workspace.fs;

const NEW_FRAMEWORK_ID_URL_PART = '/frameworks/newFrameworkId';
const CREATE_FRAMEWORK_URL_PART = '/frameworks/';

/**
 * Class used to represent a framework.
 */
export class Framework {
  /** The framework.json file. */
  private readonly frameworkInfoFile: vscode.Uri;

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
    await this.createFrameworkJsonFile();
    await this.createFrameworkDirectories();
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
    const { data } = await axios.put(
      webApplUrlPrefix + CREATE_FRAMEWORK_URL_PART,
      { frameworkInfo: JSON.parse(contents) },
    );

    console.log(data);

    if (data.status !== 'ok') {
      throw new Error(data.error);
    }
  }

  /**
   * Creates the framework.json file in the workspace and opens it in a text editor.
   */
  private async createFrameworkJsonFile(): Promise<void> {
    // default values for the framework file.
    const frameworkInfo = {
      id: this.id,
      name: 'HelloWorld',
      namespace: 'rptools.helloworld',
      version: '1.0.0',
      url: 'www.example.com',
      githb: 'RPTools/helloworld',
      exportedFunctions: [],
      exportedProperties: [],
      libToken: {
        name: 'HelloWorld',
        version: '1.0.0',
        definedFunctions: [],
        libraryProperties: [],
      },
    };

    // Create the starter framework.json file in the selected directory
    fs.writeFileSync(
      this.frameworkInfoFile.fsPath,
      JSON.stringify(frameworkInfo, null, 2),
    );

    // Open the new framework file in the editor.
    const doc = await vscode.workspace.openTextDocument(this.frameworkInfoFile);
    const editor = await vscode.window.showTextDocument(doc, 1, false);
  }

  /**
   * Returns the path to a given subdirectory within the workspace for the framework.
   * @param subpath the path of the subdirectory.
   * @returns the path to the subdirectory within the workspace.
   */
  private getDirectoryPath(subpath: string): vscode.Uri {
    return vscode.Uri.joinPath(this.workspaceFolder, subpath);
  }

  /**
   * Creates a subdirectory for a framework with the workspace.
   * @param subpath the subdirectory within the workspace.
   * @returns {@code true} if the directory was created or exists, {@code false} otherwise.
   */
  private createFrameworkDirectory(subpath: string): boolean {
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

  /**
   * Creates all the subdirectories for the framework.
   */
  private async createFrameworkDirectories(): Promise<void> {
    const subdirs = [
      'src',
      'src/mtmacro',
      'resources',
      'resources/static-data',
      'resources/data',
      'resources/images',
      'resources/audio',
    ];
    const failures: string[] = [];

    subdirs.forEach((sd) => {
      if (!this.createFrameworkDirectory(sd)) {
        failures.push(sd);
      }
    });

    if (failures.length === 1) {
      throw new Error(`Can not create directory: ${failures.toString()}`);
    } else if (failures.length > 1) {
      throw new Error(`Can not create directories: ${failures.toString()}`);
    }
  }
}
