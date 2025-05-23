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
  commands: {
    execute: jest.fn(),
  },
};

export default mockJoplin;
