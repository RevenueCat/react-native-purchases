var exec = require('child_process').exec;
var os = require('os');

if (os.type() === 'Linux') {
   console.log("Skipping iOS Dependencies")
} else if (os.type() === 'Darwin') {
   var downloadProcess = exec('./scripts/download-purchases-framework.sh 2.4.0')
   downloadProcess.stdout.pipe(process.stdout);
} else if (os.type() === 'Windows_NT') {
   console.log("Skipping iOS Dependencies")
} else{
   throw new Error("Unsupported OS found: " + os.type());
}
