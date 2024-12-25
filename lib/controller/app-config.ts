import { FieldSettingChange } from "../core/fields-overwriter";
import { AppId } from "../core/type";

export type AppConfig = {
  appId: AppId;
  fieldsPath: string;
  layoutsPath: string;
  requireRecordExistsCheck?: boolean;
  fieldOverwrites?: FieldSettingChange[];
};
