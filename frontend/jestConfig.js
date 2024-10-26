require("jest-fetch-mock").enableMocks();
window.URL.createObjectURL = function () {};
window.cv = {
  Mat: jest.fn().mockImplementation(() => ({
    data64F: {
      set: jest.fn(),
    },
  })),
  invert: jest.fn(),
  DECOMP_LU: "DECOMP_LU",
  CV_64F: "CV_64F",
};
module.exports = {
  testEnvironment: "jsdom",
};
