const fs = require("fs");
const https = require("https");
const path = require("path");
const { execSync } = require("child_process");

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

// Download Inter font files directly
const interFontFiles = [
  {
    url: "https://rsms.me/inter/font-files/Inter-Regular.woff2",
    dest: path.join(interDir, "Inter-Regular.woff2"),
  },
  {
    url: "https://rsms.me/inter/font-files/Inter-Medium.woff2",
    dest: path.join(interDir, "Inter-Medium.woff2"),
  },
  {
    url: "https://rsms.me/inter/font-files/Inter-SemiBold.woff2",
    dest: path.join(interDir, "Inter-SemiBold.woff2"),
  },
  {
    url: "https://rsms.me/inter/font-files/Inter-Bold.woff2",
    dest: path.join(interDir, "Inter-Bold.woff2"),
  },
];

// Download JetBrains Mono font files directly
const jetbrainsFontFiles = [
  {
    url: "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-Regular.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Regular.woff2"),
  },
  {
    url: "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-Medium.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Medium.woff2"),
  },
  {
    url: "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/webfonts/JetBrainsMono-Bold.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Bold.woff2"),
  },
];

// Function to download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded: ${path.basename(dest)}`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {}); // Delete the file on error
        reject(err);
      });
  });
}

// Download all font files
async function downloadAllFonts() {
  try {
    // Download Inter fonts
    for (const font of interFontFiles) {
      await downloadFile(font.url, font.dest);
    }

    // Download JetBrains Mono fonts
    for (const font of jetbrainsFontFiles) {
      await downloadFile(font.url, font.dest);
    }

    console.log("All fonts downloaded successfully!");
  } catch (error) {
    console.error("Error downloading fonts:", error);
  }
}

downloadAllFonts();
