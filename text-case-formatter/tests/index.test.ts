import joplin from "api";
import {
  onStart,
  PANEL_ID,
  CMD_UPPERCASE,
  CMD_LOWERCASE,
  CMD_CAPITALIZE,
  UPPERCASE_BTN_ID,
} from "../src/index";

describe("Text Case Formatter — index.ts", () => {
  let messageHandler: (msg: any) => Promise<void>;

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();

    (joplin.commands.register as jest.Mock).mockResolvedValue(undefined);
    (joplin.commands.execute as jest.Mock).mockResolvedValue(undefined);

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

  it("registers three commands, initializes panel, and logs startup", async () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation();
    await onStart();

    // Commands
    expect(joplin.commands.register).toHaveBeenCalledTimes(3);
    [CMD_UPPERCASE, CMD_LOWERCASE, CMD_CAPITALIZE].forEach((cmd) =>
      expect(joplin.commands.register).toHaveBeenCalledWith(
        expect.objectContaining({ name: cmd })
      )
    );

    // Panel
    expect(joplin.views.panels.create).toHaveBeenCalledWith(PANEL_ID);
    expect(joplin.views.panels.setHtml).toHaveBeenCalledWith(
      "PANEL123",
      expect.stringContaining(UPPERCASE_BTN_ID)
    );
    expect(joplin.views.panels.addScript).toHaveBeenCalledTimes(2);
    expect(joplin.views.panels.show).toHaveBeenCalledWith("PANEL123", true);

    // Handler
    expect(typeof messageHandler).toBe("function");
    expect(infoSpy).toHaveBeenCalledWith("[TextCaseFormatterPlugin] Iniciado");
    infoSpy.mockRestore();
  });

  it("executes the right command and logs on button message", async () => {
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

  it("uppercase handler does not replace when no text is selected", async () => {
    // Grab the registered uppercase handler
    await onStart();
    const regCall = (joplin.commands.register as jest.Mock).mock.calls.find(
      (c) => c[0].name === CMD_UPPERCASE
    )!;
    const { execute } = regCall[0];

    // Simulate empty selection
    (joplin.commands.execute as jest.Mock).mockResolvedValueOnce("");

    await execute();
    expect(joplin.commands.execute).toHaveBeenCalledWith("selectedText");
    expect(joplin.commands.execute).not.toHaveBeenCalledWith(
      "replaceSelection",
      expect.anything()
    );
  });

  it("uppercase handler replaces selection when text is selected", async () => {
    await onStart();
    const regCall = (joplin.commands.register as jest.Mock).mock.calls.find(
      (c) => c[0].name === CMD_UPPERCASE
    )!;
    const { execute } = regCall[0];

    (joplin.commands.execute as jest.Mock).mockResolvedValueOnce("hello World"); // selectedText
    await execute();
    expect(joplin.commands.execute).toHaveBeenCalledWith(
      "replaceSelection",
      "HELLO WORLD"
    );
  });

  it("lowercase handler replaces selection correctly", async () => {
    await onStart();
    const regCall = (joplin.commands.register as jest.Mock).mock.calls.find(
      (c) => c[0].name === CMD_LOWERCASE
    )!;
    const { execute } = regCall[0];

    (joplin.commands.execute as jest.Mock).mockResolvedValueOnce("HeLLo");
    await execute();
    expect(joplin.commands.execute).toHaveBeenCalledWith(
      "replaceSelection",
      "hello"
    );
  });

  it("capitalize handler replaces selection correctly", async () => {
    await onStart();
    const regCall = (joplin.commands.register as jest.Mock).mock.calls.find(
      (c) => c[0].name === CMD_CAPITALIZE
    )!;
    const { execute } = regCall[0];

    (joplin.commands.execute as jest.Mock).mockResolvedValueOnce(
      "hello WORLD example"
    );
    await execute();
    expect(joplin.commands.execute).toHaveBeenCalledWith(
      "replaceSelection",
      "Hello World Example"
    );
  });
});
