import { ExtensionContext } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class Utils {
  public static getResourcePath(
    file: string,
    extensionContext: ExtensionContext,
  ): string {
    return extensionContext.asAbsolutePath(path.join('resources', file));
  }

  public static readResourceFile(
    file: string,
    extensionContext: ExtensionContext,
  ): string {
    const path = Utils.getResourcePath(file, extensionContext);
    return fs.readFileSync(path, 'utf8');
  }

  public static async copyResource(
    resourceFile: string,
    destination: string,
    extensionContext: ExtensionContext,
  ): Promise<void> {
    const resourcePath = Utils.getResourcePath(resourceFile, extensionContext);
    await fs.promises.copyFile(resourcePath, destination);
  }
}
