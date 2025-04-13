const fs = require("fs");

let branch = process.argv[2];
branch = branch ?? "dev";
console.log("Testing branch:", branch);
const lookEnv = require(`./env/lookenv.${branch}.js`);
let secretEnvs;
// try {
//   const envFilePath = "./env/.env";
//   const envContents = fs.readFileSync(envFilePath, { encoding: "utf8" });
//   secretEnvs = envContents
//     .split("\n")
//     .map(line => line.trim()) // Trim each line
//     .filter(line => line && !line.startsWith("#")) // Remove empty lines and comments
//     .map(line => line.split("=")[0]); // Split at '=' and get the key
// } catch (error) {
//   console.error("Error reading .env file:", error);
// }
const sh = require("shellsync");

secretEnvs = sh`./shdotenv -e ./env/.env -f name`.split("\n");
// console.log({ secretEnvs });

// TODO: skip envs in lookenv that have defaults
let luv = Object.keys(lookEnv || {});
const areAllLookenvIncluded = (a, b) =>
  [...a].every(value => b.includes(value));
// console.log('Environment Variables set in the source code:')

// luv.forEach(envVar => console.log(envVar));

const equality = areAllLookenvIncluded(luv, secretEnvs);

console.log("CHECKING MATCHING ENVS...", { equality });
if (!equality) {
  const separator = "-------------------";
  console.log(`

  ${separator}
  
  `);
  luv = Array.from(luv);
  let suv = secretEnvs;
  const missingInSecrets = luv.filter(x => !suv.includes(x));
  console.log("TOTAL NUMBER OF ENVS", [luv.length, "IN LOOKENV"]);
  console.log(
    `These ${missingInSecrets.length} ENVS are missing in supplied secrets:`,
    missingInSecrets,
  );
  console.log(`

  ${separator}
  
  `);
  throw new Error("ENVS MISMATCH");
}
console.log("ALL GOOD");
