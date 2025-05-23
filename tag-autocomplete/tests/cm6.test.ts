import cm6Factory from "../src/content-scripts/tag-suggestions-cm6";
import { MSG_GET_TAGS } from "../src/index";
import { autocompletion } from "@codemirror/autocomplete";

jest.mock("@codemirror/autocomplete", () => ({
  autocompletion: jest.fn(() => "mocked-extension"),
}));

describe("tag-suggestions-cm6 plugin", () => {
  it("adds an autocompletion extension when cmWrapper.cm6 is truthy", () => {
    const context = {
      postMessage: jest.fn().mockResolvedValue(["foo", "bar"]),
    };
    const extObj = cm6Factory(context);

    const cmWrapper: any = {
      cm6: true,
      addExtension: jest.fn(),
    };

    extObj.plugin(cmWrapper);

    expect(autocompletion).toHaveBeenCalledWith({
      override: expect.any(Array),
    });

    expect(cmWrapper.addExtension).toHaveBeenCalledWith("mocked-extension");
  });

  it("does nothing when cmWrapper.cm6 is falsy", () => {
    const context = { postMessage: jest.fn() };
    const extObj = cm6Factory(context);
    const cmWrapper: any = { cm6: false, addExtension: jest.fn() };

    extObj.plugin(cmWrapper);

    expect(cmWrapper.addExtension).not.toHaveBeenCalled();
  });
});
