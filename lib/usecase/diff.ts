import {
  Layout,
  Properties,
} from "@kintone/rest-api-client/lib/src/client/types";
import {
  FieldSettingChange,
  FieldsOverwriter,
} from "../core/fields-overwriter";
import { DiffElements, FieldsDiffer } from "../core/fields-differ";
import { FieldsDiffPresenter } from "../core/fields-diff-presenter";
import { LayoutDiff, LayoutDiffer } from "../core/layout-differ";
import { LayoutDiffPresenter } from "../core/layout-diff-presenter";

export type DiffResult = {
  fields: DiffElements;
  layouts: LayoutDiff;
};

export type DiffUsecaseProps = {
  beforeFields: Properties;
  afterFields: Properties;
  beforeLayouts: Layout;
  afterLayouts: Layout;
  fieldOverwrites?: FieldSettingChange[];
};

export class DiffUsecase {
  private beforeFields: Properties;
  private afterFields: Properties;
  private beforeLayouts: Layout;
  private afterLayouts: Layout;
  private fieldOverwrites?: FieldSettingChange[];
  constructor(props: DiffUsecaseProps) {
    this.beforeFields = props.beforeFields;
    this.afterFields = props.afterFields;
    this.beforeLayouts = props.beforeLayouts;
    this.afterLayouts = props.afterLayouts;
    this.fieldOverwrites = props.fieldOverwrites;
  }

  diff(): DiffResult {
    
    let afterOverwritten = this.afterFields;
    if (this.fieldOverwrites) {
      const overwriter = new FieldsOverwriter(
        this.afterFields,
        this.fieldOverwrites
      );
      afterOverwritten = overwriter.overwrite();
    }

    const fieldDiffs = new FieldsDiffer(
      this.beforeFields,
      afterOverwritten
    ).diff();
    const fieldDiffPresenter = new FieldsDiffPresenter(fieldDiffs);
    fieldDiffPresenter.showDiff();

    const layoutDiff = new LayoutDiffer(
      this.beforeLayouts,
      this.afterLayouts
    ).diff();
    const layoutDiffPresenter = new LayoutDiffPresenter(layoutDiff);
    layoutDiffPresenter.showDiff();

    return {
      fields: fieldDiffs,
      layouts: layoutDiff,
    };
  }
}
