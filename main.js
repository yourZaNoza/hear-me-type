// main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs").promises;

const soundsDir = path.join(__dirname, "sounds");

fs.mkdir(soundsDir, { recursive: true }).catch(console.error);

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// --- IPC handlers ---

// Сохранить пользовательский звук
ipcMain.handle(
  "save-custom-sound",
  async (event, key, fileBuffer, originalName) => {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${key}_${safeName}`;
    const filePath = path.join(soundsDir, fileName);
    try {
      await fs.writeFile(filePath, Buffer.from(fileBuffer));
      return { success: true, fileName };
    } catch (err) {
      console.error("Save error:", err);
      return { success: false, error: err.message };
    }
  }
);

// Получить список сохранённых звуков
ipcMain.handle("get-custom-sounds", async () => {
  try {
    const files = await fs.readdir(soundsDir);
    const sounds = {};
    for (const file of files) {
      const match = file.match(/^(\d+)_(.+)$/);
      if (match) {
        const keyCode = parseInt(match[1], 10);
        sounds[keyCode] = file;
      }
    }
    return sounds;
  } catch (err) {
    console.error("Read dir error:", err);
    return {};
  }
});
