/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

const nowAllowedPaths = ['node_modules', 'dist', 'styles', 'public'];
const isPathAllowed = (path = '') => {
  return !nowAllowedPaths.some(p => path.includes(p));
};

// Define the directory of your JavaScript source code
async function check(args) {
  console.log({ args });
  const { silent, mode } = args ?? {};
  try {
    const srcDir = path.join(__dirname, '..');

    // Regular expression
    const envVarRegex =
      /(?:process\.env|import\.meta\.env|META\.env|ENVIRONEMNT)\.([a-zA-Z_][a-zA-Z0-9_]*)/g;

    // Skip these envs
    const envsToSkip = ['PORT', 'PACKAGE_VERSION'];
    const jollyEnvs = ['NODE_ENV'];
    const envPrefix = 'VITE_APP';
    // Function to search for env variables in a file
    const searchEnvVarsInFile = (filePath, uniqueEnvVars) => {
      const content = !isPathAllowed(filePath)
        ? ''
        : fs.readFileSync(filePath, 'utf8');
      let match;
      // if (isPathAllowed(filePath)) console.log(filePath)
      while ((match = envVarRegex.exec(content)) !== null) {
        if (!silent) console.log(match?.[0]);
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
        } else if (
          path.extname(file) === '.ts' ||
          path.extname(file) === '.tsx'
        ) {
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
    const auv = Array.from(uniqueEnvVars);
    let branch = mode ?? process.argv[2];
    branch = branch ?? 'dev';
    if (!silent) console.log('Testing branch:', branch);
    const lookEnv = (await import(`${srcDir}/env/lookenv.${branch}.js`))
      .default;
    let luv = new Set(Object.keys(lookEnv || {}));
    const areSetsEqual = (a, b) =>
      a.size === b.size && [...a].every(value => b.has(value));
    // console.log('Environment Variables set in the source code:')

    // luv.forEach(envVar => console.log(envVar));

    const auvSetJollyLess = new Set(auv.filter(a => !jollyEnvs.includes(a)));

    const equality = areSetsEqual(auvSetJollyLess, luv);

    if (!silent) console.log('CHECKING ENVS...', { equality });
    if (!equality) {
      const separator = '-------------------';
      console.log(`

  ${separator}
  
  `);
      luv = Array.from(luv);
      const missingFromLookenv = auv.filter(
        x => !luv.includes(x) && !jollyEnvs.includes(x)
      );
      const missingInTheSourceCode = luv.filter(
        x => !auv.includes(x) && !jollyEnvs.includes(x)
      );
      const jollys =
        auv.length - auv.filter(x => !jollyEnvs.includes(x)).length;
      console.log(
        'TOTAL NUMBER OF ENVS',
        [auv.length, `JOLLYS (${jollys})`, 'IN SOURCE CODE'],
        [luv.length, 'IN LOOKENV']
      );
      console.log(
        `These ${missingFromLookenv.length} ENVS are missing from lookenv:`,
        missingFromLookenv
      );
      console.log(
        `These ${missingInTheSourceCode.length} are missing inside the source code`,
        missingInTheSourceCode
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
          'IN LOOKENV',
          ...luv.filter(
            a =>
              !(
                a.includes(envPrefix) &&
                a.slice(0, envPrefix.length) === envPrefix &&
                !jollyEnvs.includes(a)
              )
          ),
        ]
      );
      console.log(`

  ${separator}
  
  `);
      throw new Error('ENVS MISMATCH');
    }
    if (!silent) console.log('EQUALITY TEST PASSED!');
    if (silent) process.stdout.write(Array.from(luv).join('\n'));
  } catch (error) {
    console.error(error); // Write errors to stderr
    process.exit(1); // Exit with a non-zero status code on error
  }
}

if (require.main === module) {
  check({ silent: true });
}
module.exports = check;
