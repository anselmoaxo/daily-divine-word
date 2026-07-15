import { defineConfig } from "nitro";

export default defineConfig({
  serverDir: "./server",
  runtimeConfig: {
    n8nCadastroUrl: "",
    n8nCancelamentoUrl: "",
    n8nApiKey: "",
  },
});
