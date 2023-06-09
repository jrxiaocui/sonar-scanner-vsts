import * as tl from "azure-pipelines-task-lib/task";
import JavaVersionResolver from "./helpers/java-version-resolver";
import { sanitizeVariable } from "./helpers/utils";
import Scanner, { ScannerMode } from "./sonarqube/Scanner";

const JAVA_11_PATH_ENV_NAME = "JAVA_HOME_11_X64";

export default async function analyzeTask(rootPath: string, isSonarCloud: boolean = false) {
  const scannerMode: ScannerMode = ScannerMode[tl.getVariable("SONARQUBE_SCANNER_MODE")];
  if (!scannerMode) {
    throw new Error(
      "[SQ] The 'Prepare Analysis Configuration' task was not executed prior to this task"
    );
  }
  Scanner.setIsSonarCloud(isSonarCloud);
  JavaVersionResolver.setJavaHomeToIfAvailable(JAVA_11_PATH_ENV_NAME);
  const scanner = Scanner.getAnalyzeScanner(rootPath, scannerMode);
  const sqScannerParams = tl.getVariable("SONARQUBE_SCANNER_PARAMS");
  await scanner.runAnalysis();
  tl.setVariable("SONARQUBE_SCANNER_PARAMS", sanitizeVariable(JSON.stringify(sqScannerParams)));
  JavaVersionResolver.revertJavaHomeToOriginal();
}
