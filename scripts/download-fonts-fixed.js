const fs = require("fs");
const https = require("https");
const path = require("path");

// Create directories if they don't exist
const interDir = path.join(__dirname, "..", "public", "fonts", "inter");
const jetbrainsDir = path.join(__dirname, "..", "public", "fonts", "jetbrains-mono");

if (!fs.existsSync(interDir)) {
  fs.mkdirSync(interDir, { recursive: true });
}

if (!fs.existsSync(jetbrainsDir)) {
  fs.mkdirSync(jetbrainsDir, { recursive: true });
}

console.log("Downloading font files...");

// Download a file from URL to destination
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on("finish", () => {
        file.close();
        console.log(`Downloaded ${destination}`);
        resolve();
      });
      
      file.on("error", (err) => {
        fs.unlink(destination, () => {});
        reject(err);
      });
    }).on("error", (err) => {
      fs.unlink(destination, () => {});
      reject(err);
    });
  });
}

// Font files to download - using verified sources
const fontFiles = [
  // Inter font files (from Google Fonts CDN for reliability)
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2",
    dest: path.join(interDir, "Inter-Regular.woff2")
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7.woff2",
    dest: path.join(interDir, "Inter-Medium.woff2") 
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7.woff2",
    dest: path.join(interDir, "Inter-SemiBold.woff2")
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1pL7.woff2",
    dest: path.join(interDir, "Inter-Bold.woff2")
  },
  
  // JetBrains Mono (from Google Fonts CDN for reliability)
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOV.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Regular.woff2")
  },
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxTOlOV.woff2", 
    dest: path.join(jetbrainsDir, "JetBrainsMono-Medium.woff2")
  },
  {
    url: "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8lqtTOlOV.woff2",
    dest: path.join(jetbrainsDir, "JetBrainsMono-Bold.woff2")
  }
];

// Download all fonts in parallel
Promise.all(fontFiles.map(file => downloadFile(file.url, file.dest)))
  .then(() => {
    console.log("All font files downloaded successfully!");
  })
  .catch(err => {
    console.error("Error downloading fonts:", err);
    process.exit(1);
  });
