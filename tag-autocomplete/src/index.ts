import joplin from "api";
import { ContentScriptType } from "api/types";

const PLUGIN_ID = "TagSuggestions";
const LOG_PREFIX = `[${PLUGIN_ID}]`;
const MSG_GET_TAGS = "getTags" as const;

const CONTENT_SCRIPTS: {
  id: string;
  type: ContentScriptType;
  path: string;
}[] = [
  {
    id: "tagSuggestionsCM6",
    type: ContentScriptType.CodeMirrorPlugin,
    path: "./content-scripts/tag-suggestions-cm6.js",
  },
  {
    id: "tagSuggestionsCM5",
    type: ContentScriptType.CodeMirrorPlugin,
    path: "./content-scripts/tag-suggestions-cm5.js",
  },
];

async function fetchActiveTagTitles(): Promise<string[]> {
  console.debug(LOG_PREFIX, "Obteniendo tags activos…");
  const result = await joplin.data.get(["tags"], { fields: ["id", "title"] });
  const active: string[] = [];

  for (const tag of result.items as { id: string; title: string }[]) {
    const notes = await joplin.data.get(["tags", tag.id, "notes"], {
      limit: 1,
    });
    if ((notes.items as any[]).length > 0) active.push(tag.title);
  }

  console.debug(LOG_PREFIX, "Tags activos:", active);
  return active;
}

joplin.plugins.register({
  onStart: async () => {
    for (const cs of CONTENT_SCRIPTS) {
      await joplin.contentScripts.register(cs.type, cs.id, cs.path);
      console.info(LOG_PREFIX, `Content script registrado: ${cs.id}`);
    }

    for (const { id } of CONTENT_SCRIPTS) {
      joplin.contentScripts.onMessage(id, async (message: unknown) => {
        if (message === MSG_GET_TAGS) {
          return await fetchActiveTagTitles();
        }
      });
    }
  },
});
