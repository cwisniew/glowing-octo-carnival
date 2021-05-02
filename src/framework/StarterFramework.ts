import * as vscode from 'vscode';
import * as fs from 'fs';
import { Framework } from './Framework';
import { MapTool } from '../maptool/MapTool';
import { Utils } from '../utils/Utils';

export class StarterFramework {
  public constructor(
    private readonly framework: Framework,
    private readonly maptool: MapTool,
  ) {}

  private createInfoFile() {
    const infoJson = Utils.readResourceFile(
      'starter-framework-info.json',
      this.maptool.getExtensionContext(),
    );
    const infoContents = JSON.parse(infoJson);
    // Create the starter framework.json file in the selected directory
    fs.writeFileSync(
      this.framework.getFrameworkInfoFile().fsPath,
      JSON.stringify({ id: this.framework.getId(), ...infoContents }, null, 2),
    );
  }

  private async createLibTokenFile() {
    await Utils.copyResource(
      'libtoken.json',
      this.framework.getDirectoryPath('libtoken.json').fsPath,
      this.maptool.getExtensionContext(),
    );
  }

  private async createFrameworkDirectories(): Promise<void> {
    const failures: string[] = [];

    this.framework.getFrameworkSubdirs().forEach((sd) => {
      if (!this.framework.createFrameworkDirectory(sd.path)) {
        failures.push(sd.path);
      }
    });

    if (failures.length === 1) {
      throw new Error(`Can not create directory: ${failures.toString()}`);
    } else if (failures.length > 1) {
      throw new Error(`Can not create directories: ${failures.toString()}`);
    }
  }

  private async createMTMacroExamples(): Promise<void> {
    await Utils.copyResource(
      'mtmacro/hello-world.mtm',
      this.framework.getDirectoryPath('src/mtmacro/hello-world.mtm').fsPath,
      this.maptool.getExtensionContext(),
    );
    console.log('src/mtmacro/hello-world.mtm created');
  }

  private async createExamples(): Promise<void> {
    await this.createMTMacroExamples();
  }

  public async create() {
    this.createInfoFile();
    await this.createLibTokenFile();
    await this.createFrameworkDirectories();
    await Promise.all([this.createExamples()]);
  }
}
