describe("Test", () => {
    beforeAll(() => {  
      Object.defineProperty(window, "matchMedia", {
        value: jest.fn(() => { return { matches: true } })
      });
    });
  });