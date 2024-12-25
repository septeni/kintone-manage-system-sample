import { KintoneClintWithApp } from "./type";
import { Layout } from "@kintone/rest-api-client/lib/src/client/types";

export class LayoutDeployer {
  constructor(private appClient: KintoneClintWithApp, private layout: Layout) {}

  async deploy() {
    console.log("start layout deploy....");
    await this.appClient.client.app.updateFormLayout({
      app: this.appClient.appId,
      layout: this.layout,
    });
    console.log("completed layout deploy");
  }
}
