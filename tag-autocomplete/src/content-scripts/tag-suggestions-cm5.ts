const MSG_GET_TAGS = "getTags" as const;

export default (context: {
  postMessage: (msg: typeof MSG_GET_TAGS) => Promise<string[]>;
}) => ({
  plugin: async (cm: any) => {
    if ((cm as any).cm6) return;

    cm.defineOption("tagSuggestions", false, () => {
      cm.on("inputRead", async (_cm: any, change: any) => {
        if (change.text[0] !== "#") return;

        const tags: string[] = await context.postMessage(MSG_GET_TAGS);

        (_cm as any).showHint({
          hint: () => ({
            from: _cm.getCursor(),
            to: _cm.getCursor(),
            list: tags.map((t) => ({ text: t })),
          }),
        });
      });
    });

    cm.setOption("tagSuggestions", true);
  },
});
