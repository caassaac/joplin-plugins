const mockJoplin = {
  plugins: { register: jest.fn() },
  settings: {
    registerSettings: jest.fn(),
    values: jest.fn(),
    setValue: jest.fn(),
  },
  data: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
  workspace: {
    onNoteSelectionChange: jest.fn(),
    selectedNote: jest.fn(),
  },
};

export default mockJoplin;
