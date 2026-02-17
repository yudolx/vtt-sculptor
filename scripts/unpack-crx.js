// @ts-check
const fs = require("fs/promises");
const path = require("path");

/**
 * @param {Uint8Array} data
 */
function getCrxHeader(data) {
  const decoder = new TextDecoder();
  const magic = decoder.decode(data.slice(0, 4));

  let dataview = new DataView(data.buffer);
  const version = dataview.getUint32(4, true);
  const length = dataview.getUint32(8, true);
  return { magic, version, length };
}

/**
 * @param {string} name
 * @param {Uint8Array} data
 */
async function processCrx(name, data) {
  const header = getCrxHeader(data);
  console.log(header);
  if (header.version !== 3) {
    console.warn(
      `Only crx version 3 is supported, found a crx version ${header.version}.`,
    );
    process.exit(1);
  }

  console.log(`Saving file to ${path.join(__dirname, `${name}.zip`)}`);
  await fs.writeFile(
    path.join(__dirname, `${name}.zip`),
    data.slice(header.length + 12),
  );
}

async function main() {
  let [, , extentionPathArg] = process.argv;

  if (!extentionPathArg) {
    console.error("No path to crx specified");
    process.exit(1);
  }

  if (!path.isAbsolute(extentionPathArg)) {
    extentionPathArg = path.resolve(__dirname, extentionPathArg);
  }

  try {
    if (await fs.stat(extentionPathArg)) {
      const name = path.basename(
        extentionPathArg,
        path.extname(extentionPathArg),
      );
      const content = await fs.readFile(extentionPathArg);
      await processCrx(name, content);
      process.exit(0);
    }
  } catch {
    console.error(`File ${extentionPathArg} does not exist`);
    process.exit(1);
  }
}

main();
