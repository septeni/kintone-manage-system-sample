import { styleText } from "node:util";

type LayoutDiff = {
  isLayoutChanged: boolean;
};

export class LayoutDiffPresenter {
  constructor(private diff: LayoutDiff) {}

  showDiff() {
    if (this.diff.isLayoutChanged) {
      console.log("Layout Diff: layout was updated");
    } else {
      console.log(styleText("green", "Layout Diff: No changes"));
    }
  }
}
