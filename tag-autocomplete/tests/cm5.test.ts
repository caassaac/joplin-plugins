import cm5Factory from "../src/content-scripts/tag-suggestions-cm5";
import { MSG_GET_TAGS } from "../src/index";

describe("tag-suggestions-cm5 plugin", () => {
  it("defines and enables tagSuggestions option when cm.cm6 is falsy", () => {
    const calls: any[] = [];
    const cm: any = {
      cm6: undefined,
      defineOption: (opt: string, _val: any, cb: Function) => {
        calls.push({ opt, cb });
      },
      on: jest.fn(),
      setOption: jest.fn(),
    };
    const context = {
      postMessage: jest.fn().mockResolvedValue(["alpha", "beta"]),
    };

    const extObj = cm5Factory(context);
    extObj.plugin(cm);

    expect(calls[0].opt).toBe("tagSuggestions");
    expect(cm.setOption).toHaveBeenCalledWith("tagSuggestions", true);
  });

  it("does nothing when cm.cm6 is truthy", () => {
    const cm: any = {
      cm6: true,
      defineOption: jest.fn(),
      setOption: jest.fn(),
    };
    const context = { postMessage: jest.fn() };

    const extObj = cm5Factory(context);
    extObj.plugin(cm);

    expect(cm.defineOption).not.toHaveBeenCalled();
    expect(cm.setOption).not.toHaveBeenCalled();
  });
});
