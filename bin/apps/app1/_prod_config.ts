import path from "path";
import { defineAppConfig } from "../../bin";

export default defineAppConfig({
  appId: "12345",
  requireRecordExistsCheck: true,
  fieldsPath: `${path.resolve(__dirname)}/fields.json`,
  layoutsPath: `${path.resolve(__dirname)}/layouts.json`,
  fieldOverwrites: [],
});
