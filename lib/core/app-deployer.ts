import { KintoneClintWithApp } from "./type";

export class AppDeployer {
  constructor(private appClient: KintoneClintWithApp) {}

  async deploy() {
    console.log("start app deploy....");
    await this.appClient.client.app.deployApp({
      apps: [{ app: this.appClient.appId }],
    });
    console.log("completed app deploy");
  }

  async revert() {
    await this.appClient.client.app.deployApp({
      apps: [{ app: this.appClient.appId }],
      revert: true,
    });
  }
}
