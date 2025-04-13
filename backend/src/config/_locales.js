import locales from "$/settings/locales.json";

export const defaultLocale = locales?.[0]?.locale;

export const languages = locales?.map(locale => locale.locale).filter(l => !!l);

export const languageReferences = locales?.reduce(
  (o, l) => ({ ...o, [l.locale]: l.locale }, {}),
);
