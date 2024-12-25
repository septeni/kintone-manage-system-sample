import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import { AppConfig } from "./app-config";
import { Properties } from "@kintone/rest-api-client/lib/src/client/types";
import { DiffUsecase } from "../usecase/diff";

export class DiffController {
  constructor(
    private appConfig: AppConfig,
    private client: KintoneRestAPIClient
  ) {}
  async diff() {
    const afterFields: Properties = (await import(this.appConfig.fieldsPath))
      .default;
    const beforeFields: Properties = (
      await this.client.app.getFormFields({
        app: this.appConfig.appId,
      })
    ).properties;

    const afterLayouts = (await import(this.appConfig.layoutsPath)).default;
    const beforeLayouts = (
      await this.client.app.getFormLayout({
        app: this.appConfig.appId,
      })
    ).layout;

    const diffUsecase = new DiffUsecase({
      beforeFields,
      afterFields,
      afterLayouts,
      beforeLayouts,
      fieldOverwrites: this.appConfig.fieldOverwrites,
    });

    const diffs = await diffUsecase.diff();

    return {
      diffs,
    };
  }
}
