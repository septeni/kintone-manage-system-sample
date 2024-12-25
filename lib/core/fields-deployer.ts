import { deepmerge } from "deepmerge-ts";
import { DiffElements } from "./fields-differ";
import { KintoneClintWithApp } from "./type";

export class FieldsDeployer {
  constructor(
    private appClient: KintoneClintWithApp,
    private diffs: DiffElements
  ) {}

  async deploy() {
    console.log("start field deploy....");
    await this.deployDeletes();

    await this.deployAdds();

    await this.deployUpdates();

    console.log("completed field deploy");
  }

  private async deployDeletes() {
    const deleteFields = this.diffs.filter((diff) => diff.type === "DELETE");
    if (!deleteFields.length) return;

    const deleteCodes = deleteFields.map((field) => field.field.code);

    await this.appClient.client.app.deleteFormFields({
      app: this.appClient.appId,
      fields: deleteCodes,
    });
    console.log(" field deleted");
  }

  private async deployUpdates() {
    const updateFields = this.diffs.filter((diff) => diff.type === "UPDATE");

    if (!updateFields.length) return;
    const updateFieldProperty = updateFields.reduce(
      (acc, field) => deepmerge(acc, field.after),
      {}
    );

    await this.appClient.client.app.updateFormFields({
      app: this.appClient.appId,
      properties: updateFieldProperty,
    });

    console.log(" field updated");
  }

  private async deployAdds() {
    const addFields = this.diffs.filter((diff) => diff.type === "ADD");
    if (!addFields.length) return;
    const addFieldProperty = addFields.reduce(
      (acc, field) => deepmerge(acc, field.field),
      {}
    );

    await this.appClient.client.app.addFormFields({
      app: this.appClient.appId,
      properties: addFieldProperty,
    });

    console.log(" field added");
  }
}
