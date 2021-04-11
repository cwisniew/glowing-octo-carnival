import axios from 'axios';

export class MapTool {
  private connected: boolean = false;
  private maptoolVersion: string = 'Not connected';
  private webAppVersion: string = 'Not Connected';

  private webAppUrlPrefix: string | undefined;

  constructor(private readonly host: string, private readonly port: number) {}

  public async connect(): Promise<void> {
    this.webAppUrlPrefix = `http://${this.host}:${this.port}/maptool`;

    const versionUrl = `${this.webAppUrlPrefix}/version`;

    const response = await axios.get(versionUrl);
    this.maptoolVersion = response.data.maptoolVersion;
    this.webAppVersion = response.data.webAppVersion;

    this.connected = true;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getMaptoolVersion(): string {
    return this.maptoolVersion;
  }

  public getWebAppVersion(): string {
    return this.webAppVersion;
  }

  public getHost(): string {
    return this.host;
  }

  public getPort(): number {
    return this.port;
  }

  public getWebAppUrlPrefix(): string | undefined {
    return this.webAppUrlPrefix;
  }
}
