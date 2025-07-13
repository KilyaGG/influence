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

function saveSettings() {
    let settings = JSON.parse(localStorage.getItem('gameSettings')) || {};
    let modeSettings = `{
                "bigCells":${document.getElementById('bigCells').checked},
                "upgradeTowers":${document.getElementById('upgradeTowers').checked}
    }`;
    modeSettings = JSON.parse(modeSettings);
    Object.assign(settings, modeSettings);
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    window.close();
}