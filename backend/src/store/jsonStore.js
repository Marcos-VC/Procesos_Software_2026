import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

// MOCKS_DIR permite apuntar a otra carpeta de mocks (tests E2E, otros entornos).
// Por defecto: <repo>/mocks en local y /mocks dentro del contenedor Docker.
const mocksDirectory = process.env.MOCKS_DIR
  ? path.resolve(process.env.MOCKS_DIR)
  : path.resolve(currentDirectory, "../../../mocks");

export async function readJson(fileName) {
  return JSON.parse(await fs.readFile(path.join(mocksDirectory, fileName), "utf8"));
}

// Cola de escrituras: serializa las actualizaciones para no pisar cambios
// concurrentes sobre el mismo fichero.
let writeQueue = Promise.resolve();

/**
 * Lee un fichero, aplica `mutate(data)` (que modifica `data` en sitio y puede
 * devolver un resultado) y lo guarda. Si `mutate` lanza un error no se escribe nada.
 * La escritura es atómica: se escribe a un temporal y se renombra.
 */
export function updateJson(fileName, mutate) {
  const run = writeQueue.then(async () => {
    const data = await readJson(fileName);
    const result = await mutate(data);
    const target = path.join(mocksDirectory, fileName);
    const temporal = `${target}.tmp`;
    await fs.writeFile(temporal, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await fs.rename(temporal, target);
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}
