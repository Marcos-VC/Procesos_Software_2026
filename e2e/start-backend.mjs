// Arranca el backend para los tests E2E sobre una COPIA temporal de /mocks,
// de modo que las pruebas que escriben (perfil, menú) no modifiquen el repositorio.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const temporalMocks = fs.mkdtempSync(path.join(os.tmpdir(), "e6-mocks-"));
fs.cpSync(path.resolve(here, "../mocks"), temporalMocks, { recursive: true });

process.env.MOCKS_DIR = temporalMocks;
process.env.PORT = process.env.E2E_API_PORT || "3100";

await import("../backend/src/server.js");
