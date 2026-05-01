import { appendFileSync } from "fs";

const LOG_FILE = "/log/application.log";

const isTTY = process.stderr.isTTY ?? false;
const RED = isTTY ? "\x1b[0;31m" : "";
const GREEN = isTTY ? "\x1b[0;32m" : "";
const RESET = isTTY ? "\x1b[0m" : "";

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `_${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}

function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

function writeLog(line) {
  try {
    appendFileSync(LOG_FILE, stripAnsi(line) + "\n");
  } catch {
    // don't crash if log is unavailable
  }
}

export function message(text) {
  const line = `${timestamp()} - ${text}`;
  process.stderr.write(line + "\n");
  writeLog(line);
}

export function success(text) {
  const line = `${timestamp()} - ${GREEN}✓${RESET} ${text}`;
  process.stderr.write(line + "\n");
  writeLog(line);
}

export function error(text) {
  const line = `${timestamp()} - ${RED}✗${RESET} ${text}`;
  process.stderr.write(line + "\n");
  writeLog(line);
}
