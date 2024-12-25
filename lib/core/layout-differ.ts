import { Layout } from "@kintone/rest-api-client/lib/src/client/types";
import { diff as dictDiff } from "json-diff-ts";


export type LayoutDiff = {
  isLayoutChanged: boolean;
};

export class LayoutDiffer {
  constructor(private berfore: Layout, private after: Layout) {}

  diff() {
    const diff = dictDiff(this.berfore, this.after);
    return { isLayoutChanged: diff.length > 0 };
  }
}
