const https = require("https");
const fs = require("fs");
const path = require("path");

// Create directories if they don't exist
const fontsDir = path.join(__dirname, "..", "public", "fonts");
const interDir = path.join(fontsDir, "inter");
const jetbrainsDir = path.join(fontsDir, "jetbrains-mono");

if (!fs.existsSync(interDir)) {
  fs.mkdirSync(interDir, { recursive: true });
}

if (!fs.existsSync(jetbrainsDir)) {
  fs.mkdirSync(jetbrainsDir, { recursive: true });
}

// Function to download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${dest}`);
    const file = fs.createWriteStream(dest);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`Downloaded: ${path.basename(dest)}`);
          resolve();
        });

        file.on("error", (err) => {
          fs.unlink(dest, () => {}); // Delete the file on error
          reject(err);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {}); // Delete the file on error
        reject(err);
      });
  });
}

// Define the font files to download
const fonts = [
  // Inter font files (from Google Fonts)
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2",
    dest: path.join(interDir, "Inter-Regular.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.woff2",
    dest: path.join(interDir, "Inter-Medium.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7SUc.woff2",
    dest: path.join(interDir, "Inter-SemiBold.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1pL7SUc.woff2",
    dest: path.join(interDir, "Inter-Bold.woff2"),
  },

  // JetBrains Mono font files (from Google Fonts)
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Regular.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxTOlOV.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Medium.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8lqtTOlOV.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Bold.woff2"),
  },
];

// Download all fonts
async function downloadFonts() {
  console.log("Starting font downloads...");

  try {
    for (const font of fonts) {
      await downloadFile(font.url, font.dest);
    }
    console.log("All fonts downloaded successfully!");
  } catch (error) {
    console.error("Error downloading fonts:", error);
  }
}

// Execute the download
downloadFonts();
