import { execSync, spawn } from "child_process";
import * as logger from "./logger.mjs";

const ENVIRONMENT = process.env.ENV ?? "DEV";
const INTERVAL_MS = 60_000;

function checkEnv() {
  const requiredEnvVars = ["ENV", "OUTLINE_API_TOKEN", "OUTLINE_API_URL"];
  const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    logger.error("Missing required environment variables:", missingEnvVars.join(", "));
    process.exit(1);
  }
}

function startNginx() {
  logger.message("=== Starting Nginx ===");
  const nginx = spawn("nginx", ["-g", "daemon off;"], {
    stdio: "inherit",
    detached: true,
  });
  nginx.unref();
  logger.success("Nginx started.");
}

function run() {
  try {
    logger.message("=== Step 1: Building index ===");
    execSync("node index.mjs", { stdio: "inherit" });

    logger.message("=== Step 2: Fetching documents ===");
    execSync("node fetch_data.mjs", { stdio: "inherit" });

    logger.message("=== Step 3: Downloading attachments ===");
    execSync("node fetch_assets.mjs", { stdio: "inherit" });

    logger.message("=== Step 4: Converting images ===");
    execSync("node transform_assets.mjs", { stdio: "inherit" });

    logger.message("=== Step 5: Converting documents ===");
    execSync("node transform_data.mjs", { stdio: "inherit" });

    logger.message("=== Step 6: Running Hugo ===");
    execSync("node hugo.mjs", { stdio: "inherit" });

    logger.message("=== Done. Waiting for next run... ===");
  } catch (err) {
    logger.error("Run failed:", err.message);
  }
}

checkEnv();
startNginx();

// Run immediately on start, then every 60s if not still running
if (ENVIRONMENT === "DEV") {
  logger.message("=== Running in DEV mode ===");
  //keep the container running
  while (true) {
    //do nothing
    execSync("tail -f /dev/null");
  }
} else {
  run();
  setInterval(run, INTERVAL_MS);
}
