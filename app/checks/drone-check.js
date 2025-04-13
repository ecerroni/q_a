import('./check-env-equality.cjs').then(test => {
  test.default().then(res => {
    console.log(res);
    process.exit(0); // Exit successfully
  }).catch(err => {
    console.error(err);
    process.exit(1); // Exit with error
  });
}).catch(err => {
  console.error('Failed to import the CJS module', err);
  process.exit(1); // Exit with error if the module cannot be imported
});