import joplin from "api";
import {
  onStart,
  PANEL_ID,
  CMD_UPPERCASE,
  CMD_LOWERCASE,
  CMD_CAPITALIZE,
  UPPERCASE_BTN_ID,
  LOWERCASE_BTN_ID,
  CAPITALIZE_BTN_ID,
} from "../src/index";

describe("Text Case Formatter — index.ts", () => {
  let messageHandler: (msg: any) => Promise<void>;

  beforeEach(() => {
    jest.resetModules();

    (joplin.commands.register as jest.Mock).mockResolvedValue(undefined);
    (joplin.commands.execute as jest.Mock).mockResolvedValue("dummy");

    (joplin.views.panels.create as jest.Mock).mockResolvedValue("PANEL123");
    (joplin.views.panels.setHtml as jest.Mock).mockResolvedValue(undefined);
    (joplin.views.panels.addScript as jest.Mock).mockResolvedValue(undefined);
    (joplin.views.panels.show as jest.Mock).mockResolvedValue(undefined);

    (joplin.views.panels.onMessage as jest.Mock).mockImplementation(
      async (_panelId: string, callback: any) => {
        messageHandler = callback;
      }
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers three commands and initializes panel", async () => {
    await onStart();

    expect(joplin.commands.register).toHaveBeenCalledTimes(3);
    expect(joplin.commands.register).toHaveBeenCalledWith(
      expect.objectContaining({ name: CMD_UPPERCASE })
    );
    expect(joplin.commands.register).toHaveBeenCalledWith(
      expect.objectContaining({ name: CMD_LOWERCASE })
    );
    expect(joplin.commands.register).toHaveBeenCalledWith(
      expect.objectContaining({ name: CMD_CAPITALIZE })
    );

    expect(joplin.views.panels.create).toHaveBeenCalledWith(PANEL_ID);
    expect(joplin.views.panels.setHtml).toHaveBeenCalledWith(
      "PANEL123",
      expect.stringContaining(UPPERCASE_BTN_ID)
    );
    expect(joplin.views.panels.addScript).toHaveBeenCalledTimes(2);
    expect(joplin.views.panels.show).toHaveBeenCalledWith("PANEL123", true);

    expect(typeof messageHandler).toBe("function");
  });

  it("executes correct command on message", async () => {
    await onStart();

    const infoSpy = jest.spyOn(console, "info").mockImplementation();

    await messageHandler({ command: "uppercase" });
    expect(infoSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin] Botón MAYÚSCULAS presionado"
    );
    expect(joplin.commands.execute).toHaveBeenCalledWith(CMD_UPPERCASE);

    await messageHandler({ command: "lowercase" });
    expect(infoSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin] Botón minúsculas presionado"
    );
    expect(joplin.commands.execute).toHaveBeenCalledWith(CMD_LOWERCASE);

    await messageHandler({ command: "capitalize" });
    expect(infoSpy).toHaveBeenCalledWith(
      "[TextCaseFormatterPlugin] Botón Capitalizar Palabras presionado"
    );
    expect(joplin.commands.execute).toHaveBeenCalledWith(CMD_CAPITALIZE);

    infoSpy.mockRestore();
  });
});
