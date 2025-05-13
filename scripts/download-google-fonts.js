const fs = require("fs");
const https = require("https");
const path = require("path");

// Create directories if they don't exist
const interDir = path.join(__dirname, "..", "public", "fonts", "inter");
const jetbrainsDir = path.join(
  __dirname,
  "..",
  "public",
  "fonts",
  "jetbrains-mono"
);

if (!fs.existsSync(interDir)) {
  fs.mkdirSync(interDir, { recursive: true });
}

if (!fs.existsSync(jetbrainsDir)) {
  fs.mkdirSync(jetbrainsDir, { recursive: true });
}

console.log("Downloading font files...");

// Function to download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    console.log(`Downloading ${url} to ${dest}`);

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

// Direct download links for Inter font from Google Fonts
const interFonts = [
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
    dest: path.join(interDir, "Inter-Regular.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2",
    dest: path.join(interDir, "Inter-Medium.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2",
    dest: path.join(interDir, "Inter-SemiBold.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
    dest: path.join(interDir, "Inter-Bold.woff2"),
  },
];

// Direct download links for JetBrains Mono from Google Fonts
const jetbrainsFonts = [
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO-Lf1OQk6OThxPA.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Regular.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO8LfFOQk6OThxPA.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Medium.woff2"),
  },
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4xD-IQ-PuZJJXxfpAO9lflOQk6OThxPA.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Bold.woff2"),
  },
];

// Download all fonts
async function downloadAllFonts() {
  try {
    // Download Inter fonts
    for (const font of interFonts) {
      await downloadFile(font.url, font.dest);
    }

    // Download JetBrains Mono fonts
    for (const font of jetbrainsFonts) {
      await downloadFile(font.url, font.dest);
    }

    console.log("All fonts downloaded successfully!");
  } catch (error) {
    console.error("Error downloading fonts:", error);
  }
}

// Run the download
downloadAllFonts();
