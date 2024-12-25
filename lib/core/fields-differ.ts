import { Properties } from "@kintone/rest-api-client/lib/src/client/types";
import {
  OneOf,
  Subtable,
  InSubtable,
} from "@kintone/rest-api-client/lib/src/KintoneFields/types/property";
import { diff as dictDiff } from "json-diff-ts";

type NestedPartial<T> = T extends object
  ? {
      [K in keyof T]?: NestedPartial<T[K]>;
    }
  : T;
export type PartialField = NestedPartial<OneOf>;

type SubtableField = Subtable<{
  [key: string]: InSubtable;
}>;

type FieldAdd = {
  type: "ADD";
  field: {
    [key: string]: PartialField;
  };
};

type FieldDelete = {
  type: "DELETE";
  field: OneOf;
};

type FieldUpdate = {
  type: "UPDATE";
  before: {
    [key: string]: PartialField;
  };
  after: {
    [key: string]: PartialField;
  };
};

export type DiffElements = Array<FieldAdd | FieldDelete | FieldUpdate>;

export class FieldsDiffer {
  constructor(private before: Properties, private after: Properties) {}

  diff(): DiffElements {
    const diffs: DiffElements = [];

    // after基準で比較する
    for (const key in this.after) {
      const afterField: OneOf = this.after[key];
      const beforeField: undefined | OneOf = this.before[key];

      // afterにあって、beforeにない=>追加対象
      if (!beforeField) {
        diffs.push(this.createAddField(afterField));
        continue;
      }

      // beforeとafterのフィールドのtypeが異なる場合=>削除+追加
      if (beforeField.type !== afterField.type) {
        diffs.push(this.createDeleteField(beforeField));
        diffs.push(this.createAddField(afterField));
        continue;
      }

      // どっちもlookupの場合、
      // related_appの変更場合は、削除+追加で対応する
      if ("lookup" in afterField && "lookup" in beforeField) {
        if (
          afterField.lookup.relatedApp.app !== beforeField.lookup.relatedApp.app ||
          afterField.lookup.relatedKeyField !== beforeField.lookup.relatedKeyField
        ) {
          diffs.push(this.createDeleteField(beforeField));
          diffs.push(this.createAddField(afterField));
          continue;
        }
      }

      // どっちかlookupの場合 => 削除+追加
      if (
        ("lookup" in afterField && !("lookup" in beforeField)) ||
        (!("lookup" in afterField) && "lookup" in beforeField)
      ) {
        diffs.push(this.createDeleteField(beforeField));
        diffs.push(this.createAddField(afterField));
        continue;
      }

      // Before Afterのフィールドがどちらもサブテーブルの場合 => fieldsの中身を再度Diffする
      // また、サブテーブルのラベルが変わる場合、サブテーブル単体でchangeする
      if (afterField.type === "SUBTABLE" && beforeField.type === "SUBTABLE") {
        const afterSubTableMeta: PartialField = {
          type: "SUBTABLE",
          code: afterField.code,
          label: afterField.label,
          noLabel: afterField.noLabel,
        };

        const beforeSubtableMeta: PartialField = {
          type: "SUBTABLE",
          code: beforeField.code,
          label: beforeField.label,
          noLabel: beforeField.noLabel,
        };

        const hasSubTableMetaDiff = dictDiff(
          beforeSubtableMeta,
          afterSubTableMeta
        );
        if (hasSubTableMetaDiff.length > 0) {
          diffs.push(
            this.createUpdateField(
              { [key]: beforeSubtableMeta },
              { [key]: afterSubTableMeta }
            )
          );
        }

        // subtableの場合、field_codeを
        diffs.push(...this.subTableDiff(key, beforeField, afterField));
        continue;
      }


      // lookupの場合、fieldMappingsをソートした上で比較する
      if ("lookup" in afterField && "lookup" in beforeField) {
        beforeField.lookup.fieldMappings =
          beforeField.lookup.fieldMappings.sort((a, b) =>
            a.field.localeCompare(b.field)
          );

        afterField.lookup.fieldMappings = afterField.lookup.fieldMappings.sort(
          (a, b) => a.field.localeCompare(b.field)
        );
      }

      //　その他（typeが同じかつ、field_codeが同じかつ、変更箇所がある。）=>更新対象
      const hasDiff = dictDiff(beforeField, afterField);
      if (hasDiff.length > 0) {
        diffs.push(
          this.createUpdateField({ [key]: beforeField }, { [key]: afterField })
        );
      }
    }

    // before基準で比較する
    for (const key in this.before) {
      const afterField: undefined | OneOf = this.after[key];
      // beforeにあって、afterにない=>削除対象
      if (!afterField) {
        diffs.push(this.createDeleteField(this.before[key]));
      }
    }

    return diffs;
  }

  // サブテーブルの要素のDiffをAPIの仕様に合わせて変換する
  subTableDiff(
    afterSubTableKey: string,
    beforeSubTable: SubtableField,
    afterSubTable: SubtableField
  ): DiffElements {
    const diffs: DiffElements = [];
    const afterFields = afterSubTable.fields;
    const beforeFields = beforeSubTable.fields;

    for (const key in afterFields) {
      const afterField: InSubtable = afterFields[key];
      const beforeField: undefined | InSubtable = beforeFields[key];

      const subTableAfterField: SubtableField = {
        type: "SUBTABLE",
        code: afterSubTable.code,
        label: afterSubTable.label,
        noLabel: afterSubTable.noLabel,
        fields: {
          [key]: afterField,
        },
      };

      // afterにあって、beforeにない=>追加対象
      if (!beforeField) {
        diffs.push(this.createAddField(subTableAfterField));
        continue;
      }

      // beforeとafterのフィールドのtypeが異なる場合=>削除+追加
      if (beforeField.type !== afterField.type) {
        diffs.push(this.createDeleteField(beforeField));
        diffs.push(this.createAddField(subTableAfterField));
        continue;
      }

      //　その他（typeが同じかつ、field_codeが同じかつ、変更箇所がある。）=>更新対象
      const hasDiff = dictDiff(beforeField, afterField);
      if (hasDiff.length > 0) {
        const updateAfter = { [afterSubTableKey]: subTableAfterField };

        const updateBefore = structuredClone(updateAfter);
        updateBefore[afterSubTableKey].fields[key] = beforeField;

        diffs.push(this.createUpdateField(updateBefore, updateAfter));
      }
    }

    for (const key in beforeFields) {
      const afterField: undefined | InSubtable = afterFields[key];
      // beforeにあって、afterにない=>削除対象
      if (!afterField) {
        diffs.push(this.createDeleteField(beforeFields[key]));
      }
    }

    return diffs;
  }

  private createAddField(field: OneOf): FieldAdd {
    return {
      type: "ADD",
      field: {
        [field.code]: field,
      },
    };
  }

  private createUpdateField(
    before: { [key: string]: PartialField },
    after: { [key: string]: PartialField }
  ): FieldUpdate {
    return {
      type: "UPDATE",
      before,
      after,
    };
  }

  private createDeleteField(field: OneOf): FieldDelete {
    return {
      type: "DELETE",
      field,
    };
  }
}
