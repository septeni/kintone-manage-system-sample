import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import { DeployUsecase } from "../usecase/deploy";
import { AppConfig } from "./app-config";
import { Layout } from "@kintone/rest-api-client/lib/src/client/types";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline";
import { DiffController } from "./diff";
type DeployControllerOptions = {
  isAutoDeploy?: boolean;
};

export class DeployController {
  constructor(
    private appConfig: AppConfig,
    private client: KintoneRestAPIClient,
    private options: DeployControllerOptions
  ) {}
  async deploy() {
    const diffController = new DiffController(this.appConfig, this.client);
    const { diffs } = await diffController.diff();
    const fieldDiffs = diffs.fields;
    const layoutDiff = diffs.layouts;

    // DiffとLayoutの変更がない場合は何もしない
    if (fieldDiffs.length === 0 && !layoutDiff.isLayoutChanged) return;

    // 自動デプロイが無効の場合はユーザーにYes/Noで確認
    if (!this.options.isAutoDeploy) {
      const answer = await this.askUserIsDeploy();
      if (!answer) return;
    }

    const afterLayout: Layout = (await import(this.appConfig.layoutsPath))
      .default;

    const deployUsecase = new DeployUsecase(
      {
        client: this.client,
        appId: this.appConfig.appId,
      },
      fieldDiffs,
      afterLayout,
      {
        requireRecordExistsCheck: this.appConfig.requireRecordExistsCheck,
      }
    );

    try {
      await deployUsecase.deploy();
    } catch (e) {
      throw e;
    }
  }

  private async askUserIsDeploy() {
    const cliInterface = readline.createInterface({ input, output });
    const answer = new Promise<boolean>((resolve) => {
      cliInterface.question(
        "Do you want to deploy? (yes/no): ",
        async (answer) => {
          resolve(answer === "yes" || answer === "y");
          cliInterface.close();
        }
      );
    });

    return await answer;
  }
}
