// @ts-check
import path from "path";
import fs from "fs/promises";
import webpack from "webpack";

const [, , buildArgv] = process.argv;
const isBuild = buildArgv === "build";

const main = async () => {
  const packagesDir = path.join(process.cwd(), "packages");

  const packagesContent = await fs.readdir(packagesDir);

  const webpackConfigurations = [];
  for (const packageFolder of packagesContent) {
    if (packageFolder.startsWith("plugin-")) {
      const packageFolderPath = path.join(packagesDir, packageFolder);
      const packageFolderContent = await fs.readdir(packageFolderPath);

      if (packageFolderContent.includes("webpack.config.mjs")) {
        const awaitedImport = await import(
          path.join(packageFolderPath, "webpack.config.mjs")
        );
        webpackConfigurations.push(...awaitedImport.default);
      } else {
        console.log(
          `${packageFolder} is a plugin directory, however no webpack.config.mjs file was found there. Skipping.`,
        );
      }
    }
  }

  console.log(`Total configs found: `, webpackConfigurations.length);
  console.log("Starting...");

  const compiler = webpack(webpackConfigurations);

  if (isBuild) {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(
        stats?.toString({
          chunks: false, // Makes the build output quieter
          colors: true, // Adds colors to the output
        }),
      );
    });
  } else {
    compiler.watch({ followSymlinks: true }, (err, stats) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(
        stats?.toString({
          chunks: false, // Makes the build output quieter
          colors: true, // Adds colors to the output
        }),
      );
    });
  }

  process.on("SIGINT", () => {
    // Important: close the compiler to free up resources
    compiler.close((closeErr) => {
      if (closeErr) {
        console.error(closeErr);
      } else {
        console.log("Finished");
      }
    });
  });
};

main();
