#!/usr/bin/env node

const {exec} = require("child_process");
const fs = require('fs');

let Command;

Command = 'Copy main disease files';
console.log(Command);
exec("cp GARD_Node_SFDownload/diseases*json src/assets", (error, stdout, stderr) => {
  if (error) {
    console.log(`${Command} error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`${Command} stderr: ${stderr}`);
    return;
  }
  if(stdout) {
    console.log(`${Command}: ${stdout}`);
  }
});


Command = 'Create disease detail directory';
console.log(Command);
const DiseaseDetailDirectory = 'src/assets/singles';
if (!fs.existsSync(DiseaseDetailDirectory)) {
  fs.mkdirSync(DiseaseDetailDirectory);
}


Command = 'Copy disease detail files';
console.log(Command);
exec("cp -r GARD_Node_SFDownload/singles/* src/assets/singles", (error, stdout, stderr) => {
  if (error) {
    console.log(`${Command} error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`${Command} stderr: ${stderr}`);
    return;
  }
  if(stdout) {
    console.log(`${Command}: ${stdout}`);
  }
});
