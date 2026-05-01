import { execSync } from "child_process";
import * as logger from "./logger.mjs";

const ENVIRONMENT = process.env.ENV ?? "DEV";

function runHugo() {
  logger.message("=== Running Hugo ===");
  if (ENVIRONMENT != "DEV") {
    execSync(
      "hugo --gc --minify --contentDir /content --cacheDir /tmp/hugo --cleanDestinationDir --destination /public",
      {
        stdio: "inherit",
        cwd: "/hugo",
      },
    );
  } else {
    execSync("rm -rf /hugo/public", {
      stdio: "inherit",
      cwd: "/hugo",
    });
    execSync(
      "hugo --contentDir /content --cacheDir /tmp/hugo --cleanDestinationDir --destination /public",
      {
        stdio: "inherit",
        cwd: "/hugo",
      },
    );
  }
  logger.success("Hugo has been built successfully.");
}

runHugo();
