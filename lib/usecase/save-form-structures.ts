import { KintoneDownloader } from "../core/downloader";
import { KintoneClintWithApp } from "../core/type";

export class SaveFormStructuresUsecase {
  constructor(
    private appClient: KintoneClintWithApp,
    private fieldsPath: string,
    private layoutsPath: string
  ) {}

  async save(): Promise<void> {
    const downloader = new KintoneDownloader(this.appClient);
    console.log("Downloading start...");
    await downloader.downloadFields(this.fieldsPath);
    await downloader.downloadLayouts(this.layoutsPath);
    console.log("Downloaded fields and layouts.");
  }
}
