import translate from "translate-js";

const LOCALE = "en";
const NAMESPACE = "errors";

// translate.add(
//   {
//     dummy: {
//       section: {
//         field: "Error message",
//       },
//     },
//   },
//   LOCALE,
//   NAMESPACE,
// );

translate.add(
  {
    mongo: {
      input: {
        undefined: "Error related to {{ value }}",
        general: "Error with input ",
        exists: "{{ value }} is already in use.",
        required: "this field is required!",
      },
    },
  },
  LOCALE,
  NAMESPACE,
);
