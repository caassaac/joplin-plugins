import joplin from "api";
import { ContentScriptType } from "api/types";

export const PLUGIN_ID = "TagSuggestions";
export const LOG_PREFIX = `[${PLUGIN_ID}]`;
export const MSG_GET_TAGS = "getTags" as const;

export const CONTENT_SCRIPTS: {
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

interface Tag {
  id: string;
  title: string;
}

interface NoteResult {
  items: unknown[];
}

export async function fetchActiveTagTitles(): Promise<string[]> {
  console.debug(LOG_PREFIX, "Obteniendo tags activos…");

  const result = await joplin.data.get(["tags"], { fields: ["id", "title"] });
  const tags = result.items as Tag[];

  const active: string[] = [];
  for (const tag of tags) {
    const notes = await joplin.data.get(["tags", tag.id, "notes"], {
      limit: 1,
    });
    const noteResult = notes as NoteResult;
    if (noteResult.items.length > 0) active.push(tag.title);
  }

  console.debug(LOG_PREFIX, "Tags activos:", active);
  return active;
}

export async function onStart() {
  for (const cs of CONTENT_SCRIPTS) {
    await joplin.contentScripts.register(cs.type, cs.id, cs.path);
    console.info(LOG_PREFIX, `Content script registrado: ${cs.id}`);
  }

  for (const { id } of CONTENT_SCRIPTS) {
    joplin.contentScripts.onMessage(
      id,
      async (message: typeof MSG_GET_TAGS) => {
        if (message === MSG_GET_TAGS) {
          return await fetchActiveTagTitles();
        }
      }
    );
  }
}

joplin.plugins.register({ onStart });
