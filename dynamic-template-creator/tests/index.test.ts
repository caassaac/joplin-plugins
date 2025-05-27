import joplin from "api";
import * as os from "os";
import { onStart } from "../src/index";

describe("index.ts onStart()", () => {
  beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(new Date("2025-05-23T12:34:56Z"));
    jest.spyOn(os, "type").mockReturnValue("Windows_NT");
    (joplin.workspace.selectedFolder as jest.Mock).mockResolvedValue({
      id: "fld1",
      title: "TestFolder",
    });
    (joplin.data.get as jest.Mock).mockResolvedValue({ items: [{}, {}] });
  });

  afterAll(() => jest.useRealTimers());

  it("registers plugin and handles createNote message", async () => {
    await onStart();

    expect(joplin.views.panels.create).toHaveBeenCalledWith("templatePanel");
    expect(joplin.views.panels.onMessage).toHaveBeenCalled();

    const [[panelId, handler]] = (joplin.views.panels.onMessage as jest.Mock)
      .mock.calls;
    await handler({ command: "createNote", timestamp: Date.now() });

    expect(joplin.data.get).toHaveBeenCalledWith(["folders", "fld1", "notes"], {
      fields: ["id"],
    });

    expect(joplin.data.post).toHaveBeenCalledWith(
      ["notes"],
      null,
      expect.objectContaining({
        title: "Nueva Nota",
        parent_id: "fld1",
        body: expect.stringContaining("**Sistema Operativo:** Windows_NT"),
      })
    );
  });
});
