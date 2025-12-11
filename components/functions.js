// Хранилище и состояние
const customAudioMap = {};
let selectedKey = null;
let selectedKeyLabel = "";

// Элементы интерфейса
const assignBtn = document.getElementById("assign-btn");
const deleteBtn = document.getElementById("delete-btn");
const fileInput = document.getElementById("sound-upload");
const statusText = document.getElementById("status");

// Загрузка сохранённых звуков при старте
document.addEventListener("DOMContentLoaded", async () => {
  if (typeof window.electronAPI === "undefined") {
    console.warn(
      "Запустите приложение через Electron для работы с пользовательскими звуками."
    );
    setupKeyClickHandlers();
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

  setupKeyClickHandlers();
});

// Обработчики кликов по клавишам
function setupKeyClickHandlers() {
  document.querySelectorAll(".key-hint").forEach((el) => {
    el.addEventListener("click", () => {
      selectedKey = parseInt(el.dataset.key, 10);
      selectedKeyLabel = el.textContent;
      assignBtn.disabled = false;
      deleteBtn.disabled = !customAudioMap[selectedKey];

      assignBtn.textContent = `Назначить файл`;
      deleteBtn.textContent = `Удалить звук`;

      statusText.textContent = `Выбрана клавиша: «${selectedKeyLabel}»`;
    });
  });
}

// Назначение звука
assignBtn.addEventListener("click", () => {
  if (selectedKey === null) return;
  fileInput.click();
});

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

      deleteBtn.disabled = false;
      statusText.textContent = `Звук для «${selectedKeyLabel}» сохранён!`;
    } else {
      statusText.textContent = `Ошибка: ${result.error}`;
    }
  } catch (err) {
    statusText.textContent = `Ошибка: ${err.message}`;
  }

  fileInput.value = "";
});

// Удаление звука
deleteBtn.addEventListener("click", async () => {
  if (selectedKey === null || !customAudioMap[selectedKey]) return;

  try {
    const result = await window.electronAPI.deleteCustomSound(selectedKey);
    if (result.success) {
      delete customAudioMap[selectedKey];
      deleteBtn.disabled = true;
      statusText.textContent = `Звук для «${selectedKeyLabel}» удалён.`;
    } else {
      statusText.textContent = `Ошибка удаления: ${result.error}`;
    }
  } catch (err) {
    statusText.textContent = `Ошибка: ${err.message}`;
  }
});

// Воспроизведение и подсветка
document.addEventListener("keydown", (e) => {
  if (customAudioMap[e.keyCode]) {
    customAudioMap[e.keyCode].currentTime = 0;
    customAudioMap[e.keyCode].play().catch(console.warn);
    highlightKey(e.keyCode, true);
    return;
  }

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
  if (el) el.classList.toggle("pressed", pressed);
}
