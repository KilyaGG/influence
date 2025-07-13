document.addEventListener('DOMContentLoaded', function() {
    const textInputs = document.querySelectorAll('.text-input');
    textInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.add('has-value');
            } else {
                this.classList.remove('has-value');
            }
        });
    });

    loadSettings();
});

function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || {};
    const textInputs = document.querySelectorAll('.text-input');
    const checkers = document.querySelectorAll('.toggle-input');
    for (key in savedSettings) {
        textInputs.forEach(input => {
            if (input.id === key) {
                input.value = savedSettings[key];
            }
        });
        checkers.forEach(checker => {
            if (checker.id === key) {
                checker.checked = Boolean(savedSettings[key]);
            }
        });
    }
}

let modeSetings = document.getElementById("isUsingModes");
modeSetings.addEventListener('click', (e) => {
    if (modeSetings.checked) {
        window.open('modes-main.html');
    }
});
const parseModeSettings = (str) => {
  const result = {};
  str.split(',').forEach(pair => {
    const [key, value] = pair.split(':').map(item => item.trim());
    result[key] = isNaN(value) ? value : Number(value); // Если значение число, конвертируем
  });
  return result;
};
function saveSettings() {
    let settings = JSON.parse(localStorage.getItem('gameSettings')) || {};
    let newSettings = {
        shouldHideCells: document.getElementById('shouldHideCells').checked,
        fieldSize: parseInt(document.getElementById('fieldSize').value.trim()),
        playersCount: parseInt(document.getElementById('playersCount').value.trim()),
        cutMap: document.getElementById('cutMap').checked,
        cutValue: parseInt(document.getElementById('cutValue').value.trim()),
        funLabel: document.getElementById('funLabel').checked,
        isUsingModes: document.getElementById('isUsingModes').checked
    };
    Object.assign(settings, newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    window.open('../index.html', '_self');
}
