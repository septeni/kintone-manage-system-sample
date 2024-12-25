import { styleText } from "node:util";
import { Layout } from "@kintone/rest-api-client/lib/src/client/types";
import { KintoneClintWithApp } from "../core/type";
import { DiffElements } from "../core/fields-differ";
import { FieldDeployChecker } from "../core/field-deploy-checker";
import { FieldsDeployer } from "../core/fields-deployer";
import { LayoutDeployer } from "../core/layout-deployer";
import { AppDeployer } from "../core/app-deployer";

type DeployUsecaseOptions = {
  requireRecordExistsCheck?: boolean;
};

export class DeployUsecase {
  constructor(
    private appClient: KintoneClintWithApp,
    private diffs: DiffElements,
    private afterLayout: Layout,
    private options: DeployUsecaseOptions
  ) {}

  async deploy() {
    const deployChecker = new FieldDeployChecker(this.appClient, this.diffs, {
      requireRecordExistsCheck: this.options.requireRecordExistsCheck,
    });
    await deployChecker.check();

    const fieldDeployer = new FieldsDeployer(this.appClient, this.diffs);
    const layoutsDeployer = new LayoutDeployer(
      this.appClient,
      this.afterLayout
    );
    const appDeployer = new AppDeployer(this.appClient);

    try {
      await fieldDeployer.deploy();
      await layoutsDeployer.deploy();
      await appDeployer.deploy();
      console.log(styleText("green", "Deployed fields and layouts."));
    } catch (e) {
      await appDeployer.revert();
      console.error("Failed to deploy fields and layouts.");
      console.error("Reverted to the previous state.");
      throw e;
    }
  }
}
