import cm6Factory from "../src/content-scripts/tag-suggestions-cm6";
import {
  autocompletion,
  type CompletionContext,
} from "@codemirror/autocomplete";

// Mock autocompletion to return the passed config
jest.mock("@codemirror/autocomplete", () => ({
  autocompletion: jest.fn((config) => config),
}));

describe("tag-suggestions-cm6 plugin", () => {
  let context: { postMessage: jest.Mock };
  let cmWrapper: any;
  let extObj: ReturnType<typeof cm6Factory>;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { postMessage: jest.fn() };
    extObj = cm6Factory(context);
    cmWrapper = { cm6: true, addExtension: jest.fn() };
    extObj.plugin(cmWrapper);
  });

  it("registers an autocompletion extension", () => {
    expect(autocompletion).toHaveBeenCalled();
    expect(cmWrapper.addExtension).toHaveBeenCalled();
  });

  it("override callback returns null when no matchBefore", async () => {
    const config = (autocompletion as jest.Mock).mock.calls[0][0];
    const overrideFn = config.override[0] as (
      ctx: CompletionContext
    ) => Promise<null>;
    const fakeCtx = { matchBefore: jest.fn().mockReturnValue(null) } as any;

    const result = await overrideFn(fakeCtx);
    expect(result).toBeNull();
    expect(context.postMessage).not.toHaveBeenCalled();
  });

  it("override callback returns suggestions when tag matches", async () => {
    const tags = ["One", "Two", "oneMore"];
    context.postMessage.mockResolvedValue(tags);

    const config = (autocompletion as jest.Mock).mock.calls[0][0];
    const overrideFn = config.override[0] as (
      ctx: CompletionContext
    ) => Promise<any>;
    const fakeMatch = { from: 3, text: "#On" };
    const fakeCtx = {
      matchBefore: jest.fn().mockReturnValue(fakeMatch),
    } as any;

    const result = await overrideFn(fakeCtx);
    expect(context.postMessage).toHaveBeenCalledWith("getTags");
    expect(result).toEqual({
      from: fakeMatch.from + 1,
      options: [
        { label: "One", type: "tag" },
        { label: "oneMore", type: "tag" },
      ],
    });
  });

  it("does nothing when cmWrapper.cm6 is falsy", () => {
    const falsyWrapper: any = { cm6: false, addExtension: jest.fn() };
    const ext = cm6Factory({ postMessage: jest.fn() });
    ext.plugin(falsyWrapper);
    expect(falsyWrapper.addExtension).not.toHaveBeenCalled();
  });
});
