import * as vscode from 'vscode';
import * as fs from 'fs';
import { MapTool } from '../maptool/MapTool';
import axios from 'axios';

const vfs = vscode.workspace.fs;

/**
 * Class used to represent a framework.
 */
export class Framework {
  public static async getNewId(maptool: MapTool): Promise<string | undefined> {
    if (!maptool.isConnected()) {
      vscode.window.showInformationMessage(
        'Connect to MapTool before creating a new Framework',
      );
      return undefined;
    }
  }

  /**
   * Creates a Framework objects.
   * @param maptool the instance of {@link MapTool} that is connected.
   * @param id  the id of the Framework.
   */
  public constructor(
    private readonly maptool: MapTool,
    private readonly id: string,
  ) {}

  public getId(): string {
    return this.id;
  }
}
