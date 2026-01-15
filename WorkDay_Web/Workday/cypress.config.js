import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Add this line
    baseUrl: "https://localhost:5173",

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});