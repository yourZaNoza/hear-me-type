// Хранилище пользовательских аудио (в памяти)
const customAudioMap = {}; // keyCode → Audio object

// Элементы интерфейса
const assignBtn = document.getElementById("assign-btn");
const fileInput = document.getElementById("sound-upload");
const statusText = document.getElementById("status");

let selectedKey = null;

// Нажатие на визуальную клавишу для выбора
document.querySelectorAll(".key-hint").forEach((keyEl) => {
  keyEl.addEventListener("click", () => {
    selectedKey = parseInt(keyEl.dataset.key, 10);
    const keyLabel = keyEl.textContent;
    assignBtn.textContent = `Выберите файл для «${keyLabel}»`;
    assignBtn.disabled = false;
    statusText.textContent = "";
  });
});

// Обработка нажатия кнопки "Выбрать файл"
assignBtn.addEventListener("click", () => {
  if (selectedKey === null) return;
  fileInput.click();
});

// Обработка выбора файла
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  const audio = new Audio(url);
  audio.preload = "auto";

  customAudioMap[selectedKey] = audio;
  const keyLabel = String.fromCharCode(selectedKey);
  statusText.textContent = `✅ Звук для «${keyLabel}» загружен!`;

  selectedKey = null;
  assignBtn.textContent = "Выберите клавишу";
  assignBtn.disabled = true;
  fileInput.value = "";
});

document.addEventListener("keydown", (e) => {
  // Сначала пробуем пользовательский звук
  if (customAudioMap[e.keyCode]) {
    const audio = customAudioMap[e.keyCode];
    audio.currentTime = 0;
    audio.play().catch(console.warn);

    // Визуальная подсветка
    const visualKey = document.querySelector(
      `.key-hint[data-key="${e.keyCode}"]`
    );
    if (visualKey) {
      visualKey.classList.add("pressed");
      setTimeout(() => visualKey.classList.remove("pressed"), 150);
    }
    return;
  }

  // Если нет — используем стандартные (если есть)
  const standardId = getStandardAudioId(e.keyCode);
  if (standardId) {
    const audio = document.getElementById(standardId);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.warn);
    }
  }
});

// Вспомогательная функция для стандартных ID
function getStandardAudioId(keyCode) {
  if (keyCode >= 48 && keyCode <= 57) return String(keyCode - 48); // 0–9
  if (keyCode >= 65 && keyCode <= 90) return String.fromCharCode(keyCode); // A–Z
  return null;
}

// Поддержка отпускания клавиш (опционально)
document.addEventListener("keyup", (e) => {
  const visualKey = document.querySelector(
    `.key-hint[data-key="${e.keyCode}"]`
  );
  if (visualKey) visualKey.classList.remove("pressed");
});
