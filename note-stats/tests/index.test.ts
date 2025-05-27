import joplin from "api";
import { onStart, updateStatsFor } from "../src/index";

jest.useFakeTimers();

describe("Note Stats Plugin — updateStatsFor()", () => {
  const NOTE_ID = "note123";
  const PARENT_ID = "parent456";
  const STATS_ID = "stats789";
  const MOCK_NOTE = {
    id: NOTE_ID,
    title: "My Note",
    body: "a b c",
    parent_id: PARENT_ID,
  };

  beforeEach(() => {
    jest.resetAllMocks();

    (joplin.data.get as jest.Mock).mockImplementation(async (pathArr) => {
      if (pathArr[1] === NOTE_ID) return MOCK_NOTE;
      throw new Error("not found");
    });

    (joplin.settings.values as jest.Mock).mockResolvedValue({
      statsMapping: "{}",
    });

    (joplin.data.post as jest.Mock).mockResolvedValue({ id: STATS_ID });
    (joplin.data.put as jest.Mock).mockResolvedValue(undefined);

    jest.spyOn(console, "info").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a new stats note when none exists", async () => {
    await updateStatsFor(NOTE_ID);

    expect(joplin.data.post).toHaveBeenCalledWith(
      ["notes"],
      null,
      expect.objectContaining({
        title: expect.stringContaining("Estadísticas de nota: My Note"),
        parent_id: PARENT_ID,
      })
    );

    expect(joplin.settings.setValue).toHaveBeenCalledWith(
      "statsMapping",
      JSON.stringify({ [NOTE_ID]: STATS_ID })
    );

    expect(console.info).toHaveBeenCalledWith(
      "[NoteStats]",
      "Nota de estadísticas creada:",
      STATS_ID
    );
  });

  it("updates an existing stats note when mapping exists", async () => {
    (joplin.settings.values as jest.Mock).mockResolvedValue({
      statsMapping: JSON.stringify({ [NOTE_ID]: STATS_ID }),
    });

    (joplin.data.get as jest.Mock).mockImplementation(async (pathArr) => {
      if (pathArr[1] === NOTE_ID) return MOCK_NOTE;
      if (pathArr[1] === STATS_ID) return { id: STATS_ID };
      throw new Error("not found");
    });

    await updateStatsFor(NOTE_ID);

    expect(joplin.data.put).toHaveBeenCalledWith(
      ["notes", STATS_ID],
      null,
      expect.objectContaining({
        title: expect.stringContaining("Estadísticas de nota: My Note"),
      })
    );

    expect(console.info).toHaveBeenCalledWith(
      "[NoteStats]",
      "Nota de estadísticas actualizada:",
      STATS_ID
    );
  });

  it("returns early if the note is not found", async () => {
    (joplin.data.get as jest.Mock).mockResolvedValueOnce(null);

    await updateStatsFor("nonexistent");

    expect(console.warn).toHaveBeenCalledWith(
      "[NoteStats]",
      "No se pudo cargar la nota:",
      "nonexistent"
    );
    expect(joplin.data.post).not.toHaveBeenCalled();
    expect(joplin.data.put).not.toHaveBeenCalled();
  });

  it("skips if the note title starts with STATS_TITLE_PREFIX", async () => {
    (joplin.data.get as jest.Mock).mockResolvedValueOnce({
      ...MOCK_NOTE,
      title: "Estadísticas de nota: Something",
    });

    await updateStatsFor(NOTE_ID);

    expect(joplin.data.post).not.toHaveBeenCalled();
    expect(joplin.data.put).not.toHaveBeenCalled();
  });

  it("recreates stats note if mapped note is missing", async () => {
    const badMapping = { [NOTE_ID]: STATS_ID };

    (joplin.settings.values as jest.Mock).mockResolvedValue({
      statsMapping: JSON.stringify(badMapping),
    });

    (joplin.data.get as jest.Mock).mockImplementation(async (pathArr) => {
      if (pathArr[1] === NOTE_ID) return MOCK_NOTE;
      if (pathArr[1] === STATS_ID) throw new Error("not found");
    });

    await updateStatsFor(NOTE_ID);

    expect(joplin.data.post).toHaveBeenCalled();

    const setValueCalls = (joplin.settings.setValue as jest.Mock).mock.calls;
    const mappingCall = setValueCalls.find(
      (call) => call[0] === "statsMapping"
    );
    expect(mappingCall).toBeDefined();
    const updatedMapping = JSON.parse(mappingCall![1]);
    expect(updatedMapping[NOTE_ID]).toEqual(STATS_ID);

    expect(console.warn).toHaveBeenCalledWith(
      "[NoteStats]",
      "Nota de estadísticas mapeada ausente, se recreará para:",
      NOTE_ID
    );
  });

  it("handles empty body gracefully", async () => {
    (joplin.data.get as jest.Mock).mockImplementation(async (pathArr) => {
      if (pathArr[1] === NOTE_ID) return { ...MOCK_NOTE, body: "" };
      throw new Error("not found");
    });

    await updateStatsFor(NOTE_ID);

    expect(joplin.data.post).toHaveBeenCalledWith(
      ["notes"],
      null,
      expect.objectContaining({
        body: expect.stringContaining("Recuento de palabras: 0"),
      })
    );
  });

  it("throws on JSON parse error for settings mapping", async () => {
    (joplin.settings.values as jest.Mock).mockResolvedValue({
      statsMapping: "{ invalid json",
    });

    await expect(updateStatsFor(NOTE_ID)).rejects.toThrow();
  });
});

describe("Note Stats Plugin — onStart()", () => {
  const NOTE_ID = "note123";

  beforeEach(() => {
    jest.resetAllMocks();

    (joplin.settings.registerSettings as jest.Mock).mockResolvedValue(
      undefined
    );

    (joplin.workspace.onNoteSelectionChange as jest.Mock).mockImplementation(
      async (cb: Function) => {}
    );
  });

  it("registers settings and subscribes to note selection changes", async () => {
    await onStart();

    expect(joplin.settings.registerSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        statsMapping: expect.any(Object),
      })
    );

    expect(joplin.workspace.onNoteSelectionChange).toHaveBeenCalled();
  });

  it("clears interval on plugin exit", async () => {
    const clearSpy = jest.spyOn(global, "clearInterval");
    const processOnSpy = jest.spyOn(process, "on");

    const mockSelectedNote = {
      id: NOTE_ID,
      title: "My Note",
      body: "a b c",
      parent_id: "parent",
    };
    (joplin.workspace.selectedNote as jest.Mock).mockResolvedValue(
      mockSelectedNote
    );

    let selectionCallback: Function = () => {};
    (
      joplin.workspace.onNoteSelectionChange as jest.Mock
    ).mockImplementationOnce(async (cb: Function) => {
      selectionCallback = cb;
    });

    await onStart();
    await selectionCallback();

    const exitHandler = processOnSpy.mock.calls.find(
      ([event]) => event === "exit"
    )?.[1];

    if (exitHandler) exitHandler();

    expect(clearSpy).toHaveBeenCalled();
  });
});
