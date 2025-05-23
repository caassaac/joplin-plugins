const mockJoplin = {
  plugins: { register: jest.fn() },
  commands: {
    register: jest.fn(),
    execute: jest.fn(),
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
};

export default mockJoplin;
