var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }

var os = require('os');

if (os.type() === 'Linux') 
   exec("Skipping iOS Dependencies", puts); 
else if (os.type() === 'Darwin') 
   exec("./scripts/download-purchases-framework.sh 2.3.0", puts); 
else if (os.type() === 'Windows_NT') 
   exec("Skipping iOS Dependencies", puts);
else
   throw new Error("Unsupported OS found: " + os.type());