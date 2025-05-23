import joplin from "api";
import { SettingItemType } from "api/types";

const PLUGIN_ID = "NoteStats";
const LOG_PREFIX = `[${PLUGIN_ID}]`;

const SETTING_MAPPING_KEY = "statsMapping";
const SETTING_MAPPING_DEFAULT = "{}";
const SETTING_MAPPING_LABEL = "Mapeo de estadísticas (interno)";

const STATS_TITLE_PREFIX = "Estadísticas de nota: ";
const UPDATE_INTERVAL_MS = 10_000 as const;

const LABEL_WORD_COUNT = "Recuento de palabras";
const LABEL_CHARS = "Recuento de caracteres (con espacios)";
const LABEL_CHARS_NO_SPACES = "Recuento de caracteres (sin espacios)";
const LABEL_LINE_COUNT = "Recuento de líneas";
const LABEL_PARAGRAPH_COUNT = "Recuento de párrafos";
const LABEL_LAST_UPDATED = "Última actualización";

interface Stats {
  words: number;
  chars: number;
  charsNoSpaces: number;
  lines: number;
  paragraphs: number;
}

<<<<<<< Updated upstream
joplin.plugins.register({
  onStart: async () => {
    await joplin.settings.registerSettings({
      [SETTING_MAPPING_KEY]: {
        value: SETTING_MAPPING_DEFAULT,
        type: SettingItemType.String,
        public: false,
        label: SETTING_MAPPING_LABEL,
      },
    });

    let currentNoteId: string | null = null;
    let intervalHandle: NodeJS.Timeout | null = null;

    await joplin.workspace.onNoteSelectionChange(async () => {
      const sel = await joplin.workspace.selectedNote();
      if (!sel || sel.id === currentNoteId) return;

      console.info(LOG_PREFIX, "Nota seleccionada:", sel.id);
      currentNoteId = sel.id;

      if (intervalHandle) clearInterval(intervalHandle);

      await updateStatsFor(currentNoteId);
      intervalHandle = setInterval(
        () => updateStatsFor(currentNoteId!),
        UPDATE_INTERVAL_MS
      );
    });

    process.on("exit", () => {
      if (intervalHandle) clearInterval(intervalHandle);
    });
  },
});

function computeStats(text: string): Stats {
=======
export function computeStats(text: string): Stats {
>>>>>>> Stashed changes
  const trimmed = text.trim();
  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    lines: text.split("\n").length,
    paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length,
  };
}

<<<<<<< Updated upstream
async function updateStatsFor(noteId: string) {
=======
export async function updateStatsFor(noteId: string) {
>>>>>>> Stashed changes
  const note = await joplin.data.get(["notes", noteId], {
    fields: ["title", "body", "parent_id"],
  });
  if (!note) {
    console.warn(LOG_PREFIX, "No se pudo cargar la nota:", noteId);
    return;
  }

  if (note.title.startsWith(STATS_TITLE_PREFIX)) return;

  const stats = computeStats(note.body || "");
  const timestamp = new Date().toLocaleString();
  const statsBody = `
${LABEL_WORD_COUNT}: ${stats.words}
${LABEL_CHARS}: ${stats.chars}
${LABEL_CHARS_NO_SPACES}: ${stats.charsNoSpaces}
${LABEL_LINE_COUNT}: ${stats.lines}
${LABEL_PARAGRAPH_COUNT}: ${stats.paragraphs}

${LABEL_LAST_UPDATED}: ${timestamp}
`.trim();

  const mappingJsonStr = (await joplin.settings.value(
    SETTING_MAPPING_KEY
  )) as string;
  const mapping = JSON.parse(mappingJsonStr) as Record<string, string>;

  let statsNoteId = mapping[noteId];

  if (statsNoteId) {
    try {
      await joplin.data.get(["notes", statsNoteId], { fields: ["id"] });
    } catch {
      console.warn(
        LOG_PREFIX,
        "Nota de estadísticas mapeada ausente, se recreará para:",
        noteId
      );
      delete mapping[noteId];
      statsNoteId = undefined;
    }
  }

  if (!statsNoteId) {
    const created = await joplin.data.post(["notes"], null, {
      title: `${STATS_TITLE_PREFIX}${note.title}`,
      body: statsBody,
      parent_id: note.parent_id,
    });
    mapping[noteId] = created.id;
    await joplin.settings.setValue(
      SETTING_MAPPING_KEY,
      JSON.stringify(mapping)
    );
    console.info(LOG_PREFIX, "Nota de estadísticas creada:", created.id);
  } else {
    await joplin.data.put(["notes", statsNoteId], null, {
      title: `${STATS_TITLE_PREFIX}${note.title}`,
      body: statsBody,
    });
    console.info(LOG_PREFIX, "Nota de estadísticas actualizada:", statsNoteId);
  }
}
<<<<<<< Updated upstream
=======

export async function onStart() {
  await joplin.settings.registerSettings({
    [SETTING_MAPPING_KEY]: {
      value: SETTING_MAPPING_DEFAULT,
      type: SettingItemType.String,
      public: false,
      label: SETTING_MAPPING_LABEL,
    },
  });

  let currentNoteId: string | null = null;
  let intervalHandle: NodeJS.Timeout | null = null;

  await joplin.workspace.onNoteSelectionChange(async () => {
    const sel = await joplin.workspace.selectedNote();
    if (!sel || sel.id === currentNoteId) return;

    console.info(LOG_PREFIX, "Nota seleccionada:", sel.id);
    currentNoteId = sel.id;

    if (intervalHandle) clearInterval(intervalHandle);

    await updateStatsFor(currentNoteId);
    intervalHandle = setInterval(
      () => updateStatsFor(currentNoteId!),
      UPDATE_INTERVAL_MS
    );
  });

  process.on("exit", () => {
    if (intervalHandle) clearInterval(intervalHandle);
  });
}

joplin.plugins.register({ onStart });
>>>>>>> Stashed changes
