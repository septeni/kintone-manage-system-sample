import { KintoneRestAPIClient } from "@kintone/rest-api-client";

export type AppId = string;

export type KintoneClintWithApp = {
  client: KintoneRestAPIClient;
  appId: AppId;
};
