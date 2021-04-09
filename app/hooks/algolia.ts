/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect } from "react";

const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;

export const useAlgoliaDocSearch = (): void => {
  const { push } = useRouter();

  useEffect(() => {
    if (!algoliaApiKey) return;

    // instantiate docsearch when it is available
    const interval = setInterval((): void => {
      if (!(window as any).docsearch) return;

      (window as any).docsearch({
        apiKey: algoliaApiKey,
        // https://docsearch.algolia.com/docs/behavior#handleselected
        handleSelected: (
          input: { setVal: (value: string) => void },
          __: Record<string, unknown>,
          suggestion: { url: string }
        ): void => {
          input.setVal("");

          const url = new URL(suggestion.url);

          push(`${url.pathname}${url.hash}`).then(() => {
            if (!url.hash) window.scrollTo(0, 0);
          });
        },
        indexName: "qawolf",
        inputSelector: "#algolia-search",
      });

      clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [push]);
};
