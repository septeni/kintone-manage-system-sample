import { KintoneRestAPIClient } from "@kintone/rest-api-client";

interface ISetup {
  setupKintoneClient(): KintoneRestAPIClient;
}

export class Setup implements ISetup {
  setupKintoneClient(): KintoneRestAPIClient {
    return new KintoneRestAPIClient({
      baseUrl: process.env.KINTONE_BASE_URL,
      auth: {
        username: process.env.KINTONE_USERNAME,
        password: process.env.KINTONE_PASSWORD,
      },
    });
  }
}
