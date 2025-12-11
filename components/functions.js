// functions.js
const customAudioMap = {};
let selectedKey = null;

const assignBtn = document.getElementById("assign-btn");
const fileInput = document.getElementById("sound-upload");
const statusText = document.getElementById("status");

// Загрузка сохранённых звуков
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.electronAPI === "undefined") {
    console.warn(
      "Запустите приложение через Electron для работы с пользовательскими звуками."
    );
    return;
  }

  try {
    const savedSounds = await window.electronAPI.getCustomSounds();
    for (const [keyCodeStr, fileName] of Object.entries(savedSounds)) {
      const keyCode = parseInt(keyCodeStr, 10);
      const audio = new Audio(`sounds/${fileName}`);
      audio.preload = "auto";
      customAudioMap[keyCode] = audio;
    }
  } catch (err) {
    console.error("Ошибка загрузки звуков:", err);
  }
});

// Выбор клавиши (клик по визуальной клавише)
document.querySelectorAll(".key-hint").forEach((el) => {
  el.addEventListener("click", () => {
    selectedKey = parseInt(el.dataset.key, 10);
    assignBtn.textContent = `Выберите файл для «${el.textContent}»`;
    assignBtn.disabled = false;
    statusText.textContent = "";
  });
});

// Выбор файла
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file || selectedKey === null) return;

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  try {
    const result = await window.electronAPI.saveCustomSound(
      selectedKey,
      uint8,
      file.name
    );
    if (result.success) {
      const audio = new Audio(`sounds/${result.fileName}`);
      audio.preload = "auto";
      customAudioMap[selectedKey] = audio;

      const label = String.fromCharCode(selectedKey);
      statusText.textContent = `Звук для «${label}» сохранён!`;
    } else {
      statusText.textContent = `Ошибка: ${result.error}`;
    }
  } catch (err) {
    statusText.textContent = `Ошибка: ${err.message}`;
  }

  selectedKey = null;
  assignBtn.textContent = "Выберите клавишу";
  assignBtn.disabled = true;
  fileInput.value = "";
});

assignBtn.addEventListener("click", () => {
  if (selectedKey !== null) fileInput.click();
});

// Обработка нажатий клавиш
document.addEventListener("keydown", (e) => {
  // Пользовательский звук
  if (customAudioMap[e.keyCode]) {
    const audio = customAudioMap[e.keyCode];
    audio.currentTime = 0;
    audio.play().catch(console.warn);

    highlightKey(e.keyCode, true);
    return;
  }

  // Стандартный звук (из <audio id="A"> и т.д.)
  const id = getStandardId(e.keyCode);
  if (id) {
    const audio = document.getElementById(id);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.warn);
    }
  }

  highlightKey(e.keyCode, true);
});

document.addEventListener("keyup", (e) => {
  highlightKey(e.keyCode, false);
});

function getStandardId(keyCode) {
  if (keyCode >= 48 && keyCode <= 57) return String(keyCode - 48);
  if (keyCode >= 65 && keyCode <= 90) return String.fromCharCode(keyCode);
  return null;
}

function highlightKey(keyCode, pressed) {
  const el = document.querySelector(`.key-hint[data-key="${keyCode}"]`);
  if (el) {
    el.classList.toggle("pressed", pressed);
  }
}
