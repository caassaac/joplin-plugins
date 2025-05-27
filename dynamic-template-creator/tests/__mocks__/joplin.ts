export default {
  plugins: { register: jest.fn() },
  views: {
    panels: {
      create: jest.fn().mockResolvedValue("panel123"),
      setHtml: jest.fn(),
      addScript: jest.fn(),
      show: jest.fn(),
      onMessage: jest.fn(),
    },
  },
  data: { get: jest.fn(), post: jest.fn() },
  workspace: { selectedFolder: jest.fn() },
};
