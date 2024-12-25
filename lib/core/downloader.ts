import { writeFile } from "fs/promises";
import { KintoneClintWithApp } from "./type";

export class KintoneDownloader {
  constructor(private appClient: KintoneClintWithApp) {}

  async downloadFields(outputPath: string) {
    const response = (
      await this.appClient.client.app.getFormFields({
        app: this.appClient.appId,
      })
    ).properties;
    await writeFile(outputPath, JSON.stringify(response, null, 2));
  }

  async downloadLayouts(outputPath: string) {
    const response = (
      await this.appClient.client.app.getFormLayout({
        app: this.appClient.appId,
      })
    ).layout;
    await writeFile(outputPath, JSON.stringify(response, null, 2));
  }
}
