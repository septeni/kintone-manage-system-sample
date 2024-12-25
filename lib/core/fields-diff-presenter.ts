import { styleText } from "node:util";
import { DiffElements } from "./fields-differ";
import * as Diff from "diff";

export class FieldsDiffPresenter {
  constructor(private diffs: DiffElements) {}

  showDiff() {
    if (!this.diffs.length) {
      console.log(styleText("green", "Field Diff: No changes"));
      return;
    }
    const addFields = this.showAddField();

    const updateFields = this.showUpdateField();

    const deleteFields = this.showDeleteField();
    console.log(
      `\nField Diff: ${addFields.length} to Add, ${updateFields.length} to Change, ${deleteFields.length} to Delete`
    );
  }

  private showAddField() {
    const addFields = this.diffs.filter((diff) => diff.type === "ADD");

    const output = addFields
      .map((diff) => {
        return this.addMarkToTextLines(JSON.stringify(diff.field, null, 2));
      })
      .join("\n");

    console.log(output);
    return addFields;
  }

  private showDeleteField() {
    const deleteFields = this.diffs.filter((diff) => diff.type === "DELETE");

    const output = deleteFields
      .map((diff) => {
        return this.removeMarkToTextLines(JSON.stringify(diff.field, null, 2));
      })
      .join("\n");

    console.log(output);
    return deleteFields;
  }

  private showUpdateField() {
    const updateFields = this.diffs.filter((diff) => diff.type === "UPDATE");
    const updateMark = styleText("yellow", "~");

    const output = updateFields
      .map((diff) => {
        const before = JSON.stringify(diff.before, null, 2);
        const after = JSON.stringify(diff.after, null, 2);

        const linesDiff = Diff.diffLines(before, after);

        const diffText = linesDiff
          .reduce((acc, lineDiff) => {
            if (lineDiff.added) {
              const addText = acc + this.addMarkToTextLines(lineDiff.value);
              return addText.endsWith("\n") ? addText : addText + "\n";
            }

            if (lineDiff.removed) {
              const removeText =
                acc + this.removeMarkToTextLines(lineDiff.value);
              return removeText.endsWith("\n") ? removeText : removeText + "\n";
            }

            return acc + lineDiff.value;
          }, "")
          .trim();

        return `${updateMark} ` + diffText;
      })
      .join("\n");

    console.log(output);
    return updateFields;
  }

  private addMarkToTextLines(texts: string) {
    const addMark = styleText("green", "+");
    return texts
      .split("\n")
      .map((line) => (line ? `${addMark} ` + line : ""))
      .join("\n");
  }

  private removeMarkToTextLines(texts: string) {
    const removeMark = styleText("red", "-");
    return texts
      .split("\n")
      .map((line) => (line ? `${removeMark} ` + line : ""))
      .join("\n");
  }
}
