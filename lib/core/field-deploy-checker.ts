import { styleText } from "node:util";
import { DiffElements } from "./fields-differ";
import { Record } from "@kintone/rest-api-client/lib/src/client/types";
import { KintoneClintWithApp } from "./type";

type CheckSettings = {
  requireRecordExistsCheck?: boolean;
};

export class FieldDeployChecker {
  constructor(
    private appClient: KintoneClintWithApp,
    private diffs: DiffElements,
    private checkSettings: CheckSettings
  ) {}

  async check() {
    if (this.checkSettings.requireRecordExistsCheck) {
      console.log("Checking records exist...");
      await this.checkRecordExists();
    }
    console.log(styleText("green", "All checks are passed!"));
  }

  private async checkRecordExists() {
    const deleteFields = this.diffs.filter((diff) => diff.type === "DELETE");
    const deleteFieldsCodes = deleteFields.map((field) => field.field.code);

    const recodes = await this.appClient.client.record.getAllRecords({
      app: this.appClient.appId,
      fields: deleteFieldsCodes,
    });

    deleteFieldsCodes.forEach((code) => {
      const registeredRecords = recodes.filter((record) => {
        return this.isRegistered(record, code);
      });

      if (registeredRecords.length) {
        const registeredRecordNumbers = registeredRecords.map(
          (record) => record.$id.value
        );
        throw new Error(
          `削除対象のフィールド[${code}]にレコードが登録されています。\n` +
            `レコードID: ${registeredRecordNumbers.join(", ")}`
        );
      }
    });

    return recodes;
  }

  private isRegistered(record: Record, targetCode: string) {
    const type = record[targetCode]?.type;
    const value = record[targetCode]?.value;

    // レコードに値が入っているかどうかチェック
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (type === "SUBTABLE") {
      const hasRegisteredCol = record[targetCode].value.some((row) => {
        for (const key in row.value) {
          return this.isRegistered(row.value, key);
        }
      });
      return hasRegisteredCol;
    }

    return true;
  }
}
