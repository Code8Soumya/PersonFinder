import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname_of_current_module = dirname(fileURLToPath(import.meta.url));
const projectRoot = dirname(__dirname_of_current_module);

export default projectRoot;
