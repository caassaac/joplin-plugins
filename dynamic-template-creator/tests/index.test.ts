import joplin from "api";
import * as os from "os";
import { onStart } from "../src/index";

describe("index.ts onStart()", () => {
  const originalEnv = { ...process.env };
  let realDate: DateConstructor;

  beforeAll(() => {
    realDate = Date;
    jest.useFakeTimers({ legacyFakeTimers: false });
    jest.setSystemTime(new Date("2025-05-23T12:34:56Z"));

    global.Date = class extends realDate {
      constructor() {
        super("2025-05-23T12:34:56Z");
      }

      toLocaleDateString() {
        return '23/5/2025';
      }

      toLocaleTimeString() {
        return '12:34:56';
      }

      toLocaleString() {
        return '23/5/2025 12:34:56';
      }
    } as any;

    jest.spyOn(os, 'type').mockReturnValue('Windows_NT');

    (joplin.views.panels.create as jest.Mock).mockResolvedValue("panel123");
    (joplin.workspace.selectedFolder as jest.Mock).mockResolvedValue({
      id: "fld1",
      title: "TestFolder",
    });
    (joplin.data.get as jest.Mock).mockResolvedValue({ items: [{}, {}] });
  });

  afterAll(() => {
    jest.useRealTimers();
    global.Date = realDate;
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  describe("Template variable substitution", () => {
    it("correctly replaces all template variables", async () => {
      jest.replaceProperty(process, 'env', { ...process.env, USER: 'testuser' });

      await onStart();
      const [[, handler]] = (joplin.views.panels.onMessage as jest.Mock).mock.calls;
      await handler({ command: "createNote" });

      expect(joplin.data.post).toHaveBeenCalledWith(
        ["notes"],
        null,
        expect.objectContaining({
          body: expect.stringContaining("**Usuario:** testuser") &&
                expect.stringContaining("**Fecha:** 23/5/2025") &&
                expect.stringContaining("**Hora:** 12:34:56")
        })
      );
    });

    it("falls back to username when USER env not available", async () => {
      jest.replaceProperty(process, 'env', { USERNAME: 'fallbackuser' });

      await onStart();
      const [[, handler]] = (joplin.views.panels.onMessage as jest.Mock).mock.calls;
      await handler({ command: "createNote" });

      expect(joplin.data.post).toHaveBeenCalledWith(
        ["notes"],
        null,
        expect.objectContaining({
          body: expect.stringContaining("**Usuario:** fallbackuser")
        })
      );
    });
  });

  describe("Panel configuration", () => {
    it("configures panel with correct elements and scripts", async () => {
      await onStart();

      expect(joplin.views.panels.setHtml).toHaveBeenCalledWith(
        "panel123",
        expect.stringContaining('<div id="template-container">') &&
        expect.stringContaining('<button id="createButton">')
      );
      expect(joplin.views.panels.addScript).toHaveBeenNthCalledWith(
        1,
        "panel123",
        "./styles/styles.css"
      );
      expect(joplin.views.panels.addScript).toHaveBeenNthCalledWith(
        2,
        "panel123",
        "./webview/webview.js"
      );
    });
  });
});
