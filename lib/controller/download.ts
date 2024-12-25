import { KintoneClintWithApp } from "../core/type";
import { SaveFormStructuresUsecase } from "../usecase/save-form-structures";
import { AppConfig } from "./app-config";

export class DownloadController {
  constructor(
    private appConfig: AppConfig,
    private client: KintoneClintWithApp
  ) {}
  async download() {
    const downloader = new SaveFormStructuresUsecase(
      this.client,
      this.appConfig.fieldsPath,
      this.appConfig.layoutsPath
    );
    await downloader.save();
  }
}
