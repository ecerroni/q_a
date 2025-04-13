import memoizeIt from "../_memoize";

async function waitPlus(number) {
  return new Promise(resolve => {
    setTimeout(resolve(number + 1), 100);
  });
}
export default memoizeIt(async (args, id) => {
  // do something
  Array.from({ length: 1000000 }, (_, index) => index + 1).map(
    () => null, // console.log(args),
  );
  await waitPlus(1);
  return `${args} | ${id}`;
});
