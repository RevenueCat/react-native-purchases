const {exec} = require("child_process");
const os = require("os");

if (os.type() === "Linux") {
  console.log("Skipping iOS Dependencies");
} else if (os.type() === "Darwin") {
  const downloadProcess = exec(
    "./scripts/download-purchases-framework.sh 3.0.1"
  );
  downloadProcess.stdout.pipe(process.stdout);
  const downloadProcessCommon = exec(
    "./scripts/download-purchases-common.sh 1.0.4"
  );
  downloadProcessCommon.stdout.pipe(process.stdout);
} else if (os.type() === "Windows_NT") {
  console.log("Skipping iOS Dependencies");
} else {
  throw new Error(`Unsupported OS found: ${os.type()}`);
}
