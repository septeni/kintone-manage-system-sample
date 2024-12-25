import { Command } from "commander";
import { AppConfig } from "../lib/controller/app-config";
import { Setup } from "./setup";
import { DiffController } from "../lib/controller/diff";
import { DeployController } from "../lib/controller/deploy";
import { DownloadController } from "../lib/controller/download";

const extractAppConfig = async (appDirName: string) => {
  try {
    const config = await import(`${__dirname}/apps/${appDirName}/config.ts`);
    return config.default as AppConfig;
  } catch (e) {
    throw new Error("対象のアプリのconfig.tsが見つかりませんでした");
  }
};

const program = new Command();

program
  .command("diff")
  .option("-t, --target <target>", "Target app directory name")
  .option("--app-id <appId>", "App ID")
  .action(async (options) => {
    const appConfig = await extractAppConfig(options.target);
    if (options.appId) appConfig.appId = options.appId;

    const setup = new Setup();

    const client = setup.setupKintoneClient();
    const diffController = new DiffController(appConfig, client);

    await diffController.diff();
  });

program
  .command("deploy")
  .requiredOption("-t, --target <target>", "Target app directory name")
  .option("--auto-deploy", "Enable auto deploy")
  .option("--app-id <appId>", "App ID")
  .option("--ignore-record-check", "Ignore record check")
  .action(async (options) => {
    const appConfig = await extractAppConfig(options.target);

    if (options.ignoreRecordCheck) appConfig.requireRecordExistsCheck = false;
    if (options.appId) appConfig.appId = options.appId;

    const setup = new Setup();
    const client = setup.setupKintoneClient();

    const isAutoDeploy = options.autoDeploy ? true : false;
    const deployController = new DeployController(appConfig, client, {
      isAutoDeploy,
    });

    await deployController.deploy();
  });

program
  .command("download")
  .option("--app-id <appId>", "App ID")
  .requiredOption("-t, --target <target>", "Target app directory name")
  .action(async (option) => {
    const appConfig = await extractAppConfig(option.target);
    if (option.appId) appConfig.appId = option.appId;

    const setup = new Setup();

    const client = setup.setupKintoneClient();

    const downloader = new DownloadController(appConfig, {
      client,
      appId: appConfig.appId,
    });

    await downloader.download();
  });

program.parse();

export const defineAppConfig = (config: AppConfig): AppConfig => {
  return config;
};
