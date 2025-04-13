const fs = require("fs");
const path = require("path");

// Define the directory of your JavaScript source code
const srcDir = path.join(__dirname, "./src");

// Regular expression to match envs
const envVarRegex = /process\.env\.([a-zA-Z_][a-zA-Z0-9_]*)/g;

// Skip these envs
const envsToSkip = ["MONGO_POOL_SIZE"];
const jollyEnvs = ["NODE_ENV"];
const envPrefix = "API_";

// Function to search for env variables in a file
const searchEnvVarsInFile = (filePath, uniqueEnvVars) => {
  const content = fs.readFileSync(filePath, "utf8");
  let match;
  while ((match = envVarRegex.exec(content)) !== null) {
    if (!envsToSkip.includes(match[1])) uniqueEnvVars.add(match[1]);
  }
};

// Function to traverse directory recursively
const traverseDirectory = (dir, uniqueEnvVars) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath, uniqueEnvVars);
    } else if (path.extname(file) === ".js") {
      searchEnvVarsInFile(fullPath, uniqueEnvVars);
    }
  });
};

// Start scanning
const uniqueEnvVars = new Set();
traverseDirectory(srcDir, uniqueEnvVars);

// Print found environment variables
// console.log('Environment Variables found in the source code:')
// uniqueEnvVars.forEach(envVar => console.log(envVar));
jollyEnvs.forEach(je => {
  uniqueEnvVars.delete(je);
});
const auv = Array.from(uniqueEnvVars);
let branch = process.argv[2];
branch = branch ?? "dev";
console.log("Testing branch:", branch);
const lookEnv = require(`./env/lookenv.${branch}.js`);

let luv = new Set(Object.keys(lookEnv || {}));
const areSetsEqual = (a, b) => {
  return a.size === b.size && [...a].every(value => b.has(value));
};
// console.log('Environment Variables set in the source code:')

// luv.forEach(envVar => console.log(envVar));

const equality = areSetsEqual(uniqueEnvVars, luv);

console.log("CHECKING ENVS...", { equality });
if (!equality) {
  const separator = "-------------------";
  console.log(`

  ${separator}
  
  `);
  luv = Array.from(luv);
  const missingFromLookenv = auv.filter(x => !luv.includes(x));
  const missingInTheSourceCode = luv.filter(x => !auv.includes(x));
  console.log(
    "TOTAL NUMBER OF ENVS",
    [auv.length, "IN SOURCE CODE"],
    [luv.length, "IN LOOKENV"],
  );
  console.log(
    `These ${missingFromLookenv.length} ENVS are missing from lookenv:`,
    missingFromLookenv,
  );
  console.log(
    `These ${missingInTheSourceCode.length} are missing inside the source code`,
    missingInTheSourceCode,
  );
  console.log(
    `TOTAL NUMBER OF ENVS THAT DO NOT START WITH THE "${envPrefix}" namespace`,
    [
      // envPrefix is mandatory, but for jollyEnvs
      luv.filter(a => {
        return !(
          a.includes(envPrefix) &&
          a.slice(0, envPrefix.length) === envPrefix &&
          !jollyEnvs.includes(a)
        );
      }).length,
      "IN LOOKENV",
      ...luv.filter(
        a =>
          !(
            a.includes(envPrefix) &&
            a.slice(0, envPrefix.length) === envPrefix &&
            !jollyEnvs.includes(a)
          ),
      ),
    ],
  );
  console.log(`

  ${separator}
  
  `);
  throw new Error("ENVS MISMATCH");
}
console.log("ALL GOOD");
