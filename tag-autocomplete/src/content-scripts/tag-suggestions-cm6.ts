import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

const MSG_GET_TAGS = "getTags" as const;

export type CM6Wrapper = {
  cm6?: boolean;
  addExtension: (ext: unknown) => void;
};

export type CompletionOption = { label: string; type: "tag" };

export default (context: {
  postMessage: (msg: typeof MSG_GET_TAGS) => Promise<string[]>;
}) => ({
  plugin: (cmWrapper: CM6Wrapper) => {
    if (!cmWrapper.cm6) return;

    cmWrapper.addExtension(
      autocompletion({
        override: [
          async (ctx: CompletionContext) => {
            const m = ctx.matchBefore(/#[^#\s]*/);
            if (!m) return null;

            const tags = await context.postMessage(MSG_GET_TAGS);
            const from = m.from + 1;
            const query = m.text.slice(1).toLowerCase();

            const options: CompletionOption[] = tags
              .filter((t) => t.toLowerCase().startsWith(query))
              .map((t) => ({ label: t, type: "tag" }));

            return { from, options };
          },
        ],
      })
    );
  },
});
