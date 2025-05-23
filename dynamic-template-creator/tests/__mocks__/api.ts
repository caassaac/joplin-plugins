const mockJoplin = {
  plugins: {
    register: jest.fn(),
  },
  views: {
    panels: {
      create: jest.fn(),
      setHtml: jest.fn(),
      addScript: jest.fn(),
      show: jest.fn(),
      onMessage: jest.fn(),
    },
  },
  workspace: {
    selectedFolder: jest.fn(),
  },
  data: {
    get: jest.fn(),
    post: jest.fn(),
  },
};

export default mockJoplin;
