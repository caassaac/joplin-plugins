jest.mock("api");

import joplin from "api";
import {
  CONTENT_SCRIPTS,
  LOG_PREFIX,
  MSG_GET_TAGS,
  fetchActiveTagTitles,
  onStart,
} from "../src/index";

describe("Tag Autocomplete Plugin — fetchActiveTagTitles()", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns titles of tags that have notes", async () => {
    (joplin.data.get as jest.Mock)
      .mockResolvedValueOnce({
        items: [
          { id: "t1", title: "TagOne" },
          { id: "t2", title: "TagTwo" },
        ],
      })
      .mockResolvedValueOnce({ items: [{}] })
      .mockResolvedValueOnce({ items: [] });

    const active = await fetchActiveTagTitles();
    expect(active).toEqual(["TagOne"]);
  });

  it("logs debug messages", async () => {
    const dbg = jest.spyOn(console, "debug").mockImplementation();
    (joplin.data.get as jest.Mock).mockResolvedValueOnce({ items: [] });

    await fetchActiveTagTitles();
    expect(dbg).toHaveBeenCalledWith(LOG_PREFIX, "Obteniendo tags activos…");
    expect(dbg).toHaveBeenCalledWith(LOG_PREFIX, "Tags activos:", []);
    dbg.mockRestore();
  });
});

describe("Tag Autocomplete Plugin — onStart()", () => {
  let callbacks: Record<string, Function[]>;

  beforeEach(() => {
    jest.resetAllMocks();
    callbacks = {};

    (joplin.contentScripts.register as jest.Mock).mockResolvedValue(undefined);
    (joplin.contentScripts.onMessage as jest.Mock).mockImplementation(
      (_id: string, cb: Function) => {
        callbacks[_id] = callbacks[_id] || [];
        callbacks[_id].push(cb);
      }
    );
  });

  it("registers all content scripts and handlers", async () => {
    await onStart();

    expect(joplin.contentScripts.register).toHaveBeenCalledTimes(
      CONTENT_SCRIPTS.length
    );
    for (const cs of CONTENT_SCRIPTS) {
      expect(joplin.contentScripts.register).toHaveBeenCalledWith(
        cs.type,
        cs.id,
        cs.path
      );
      expect(callbacks[cs.id]?.length).toBe(1);
    }
  });

  it("handler returns tags when message is MSG_GET_TAGS", async () => {
    const mockAllTagsResponse = {
      items: [
        { id: "tag1_id", title: "ActiveTag" },
        { id: "tag2_id", title: "InactiveTag" },
      ],
      has_more: false,
    };
    const mockNotesForActiveTagResponse = { items: [{ id: "note_xyz" }] };
    const mockNotesForInactiveTagResponse = { items: [] };

    (joplin.data.get as jest.Mock)
      .mockResolvedValueOnce(mockAllTagsResponse)
      .mockResolvedValueOnce(mockNotesForActiveTagResponse)
      .mockResolvedValueOnce(mockNotesForInactiveTagResponse);

    await onStart();

    const id = CONTENT_SCRIPTS[0].id;
    const resultFromHandler = await callbacks[id][0](MSG_GET_TAGS);

    const expectedActiveTagTitles = ["ActiveTag"];
    expect(resultFromHandler).toEqual(expectedActiveTagTitles);

    expect(joplin.data.get).toHaveBeenCalledWith(
      ["tags"],
      expect.objectContaining({ fields: ["id", "title"] })
    );
    expect(joplin.data.get).toHaveBeenCalledWith(
      ["tags", "tag1_id", "notes"],
      expect.objectContaining({ limit: 1 })
    );
    expect(joplin.data.get).toHaveBeenCalledWith(
      ["tags", "tag2_id", "notes"],
      expect.objectContaining({ limit: 1 })
    );
  });
});
