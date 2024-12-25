import { deepmerge } from "deepmerge-ts";
import { Properties } from "@kintone/rest-api-client/lib/src/client/types";
import { PartialField } from "./fields-differ";

export type FieldSettingChange = {
  fieldCode: string;
  field: PartialField;
};

export class FieldsOverwriter {
  private fieldSettingChanges: FieldSettingChange[];
  constructor(
    private properties: Properties,
    fieldSettingChanges: FieldSettingChange[]
  ) {
    if (
      fieldSettingChanges.length !==
      new Set(fieldSettingChanges.map((change) => change.fieldCode)).size
    )
      throw new Error("フィールドコードが重複しています");
    this.fieldSettingChanges = fieldSettingChanges;
  }

  overwrite(): Properties {
    let targetProperties: any = structuredClone(this.properties);

    for (const change of this.fieldSettingChanges) {
      const fieldCode = change.fieldCode;
      const field = change.field;
      if (!targetProperties[fieldCode])
        throw new Error(`Overwrite エラー：フィールドコード ${fieldCode} が見つかりません`);
      targetProperties = deepmerge(targetProperties, { [fieldCode]: field });
    }

    return targetProperties;
  }
}

