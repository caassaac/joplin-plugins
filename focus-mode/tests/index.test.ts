import joplin from "api";
import { onStart, state } from "../src/index";

describe("Focus Mode Plugin — index.ts", () => {
  let messageHandler: (msg: any) => Promise<void>;

  beforeEach(async () => {
    jest.clearAllMocks();
    state.focusEnabled = false;

    (joplin.views.panels.create as jest.Mock).mockResolvedValue("PANEL123");
    (joplin.views.panels.onMessage as jest.Mock).mockImplementation(
      (_panelId: string, callback: any) => {
        messageHandler = callback;
      }
    );

    (joplin.commands.execute as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(console, "info").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();

    await onStart();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates panel with correct configuration", () => {
    expect(joplin.views.panels.create).toHaveBeenCalledWith("focusModePanel");
    expect(joplin.views.panels.setHtml).toHaveBeenCalledWith(
      "PANEL123",
      expect.stringContaining('id="focus-container"')
    );
    expect(joplin.views.panels.addScript).toHaveBeenCalledTimes(2);
  });

  it("toggles focus mode state correctly", async () => {
    expect(state.focusEnabled).toBe(false);

    await messageHandler({ name: "toggleFocus" });
    expect(state.focusEnabled).toBe(true);
    expect(joplin.commands.execute).toHaveBeenCalledWith("toggleSideBar");
    expect(joplin.commands.execute).toHaveBeenCalledWith("toggleNoteList");

    await messageHandler({ name: "toggleFocus" });
    expect(state.focusEnabled).toBe(false);
  });

  it("handles command execution errors", async () => {
    const error = new Error("Command failed");
    (joplin.commands.execute as jest.Mock).mockRejectedValue(error);

    await messageHandler({ name: "toggleFocus" });

    expect(console.error).toHaveBeenCalledWith(
      "[FocusModePlugin] Error executing commands:",
      error
    );

    expect(state.focusEnabled).toBe(false);
  });

  it("ignores unknown messages", async () => {
    const initialValue = state.focusEnabled;

    await messageHandler({ name: "invalidCommand" });

    expect(state.focusEnabled).toBe(initialValue);
    expect(joplin.commands.execute).not.toHaveBeenCalled();
  });
});
