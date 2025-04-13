import translate from "translate-js";

const LOCALE = "it";
const NAMESPACE = "errors";

// translate.add(
//   {
//     dummy: {
//       section: {
//         field: "Messaggio di Errore",
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
        undefined: "Error relativo a {{ value }}",
        general: "Errore con l'input ",
        exists: "{{ value }} e' gia' in uso",
        required: "Questo campo e' richiesto",
      },
    },
  },
  LOCALE,
  NAMESPACE,
);
