global.joplin = {
  plugins: {
    register: jest.fn(),
  },
  contentScripts: {
    register: jest.fn(),
    onMessage: jest.fn(),
  },
  data: {
    get: jest.fn(),
  },
};
