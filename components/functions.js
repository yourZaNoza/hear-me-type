// Функция для воспроизведения звука и подсветки клавиши
document.addEventListener("keydown", (e) => {
  const keyIdMap = {
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "A",
    66: "B",
    67: "C",
    68: "D",
    69: "E",
    70: "F",
    71: "G",
    72: "H",
    73: "I",
    74: "J",
    75: "K",
    76: "L",
    77: "M",
    78: "N",
    79: "O",
    80: "P",
    81: "Q",
    82: "R",
    83: "S",
    84: "T",
    85: "U",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z",
  };

  const audioId = keyIdMap[e.keyCode];
  if (audioId) {
    const audio = document.getElementById(audioId);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.warn("Audio play failed:", err));
    }

    const visualKey = document.querySelector(
      `.key-hint[data-key="${e.keyCode}"]`
    );
    if (visualKey) {
      visualKey.classList.add("pressed");
    }
  } else {
    console.log("Key is not found!", e.keyCode);
  }
});

document.addEventListener("keyup", (e) => {
  const visualKey = document.querySelector(
    `.key-hint[data-key="${e.keyCode}"]`
  );
  if (visualKey) {
    visualKey.classList.remove("pressed");
  }
});
