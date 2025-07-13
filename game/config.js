window.fieldSize = 40;
window.playersCount = 3;
window.shouldHideCells = false;
window.cutMap = false;
window.cutValue = 1;
window.funLabel = false;
window.startingFromGameSave = false;
window.isUsingModes = false;
//----МОДЫ----
window.bigCells = false;
window.upgradeTowers = false;

const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || {};

// Перебираем все свойства из savedSettings
for (const key in savedSettings) {
    // Проверяем, существует ли глобальная переменная с таким именем
    if (window.hasOwnProperty(key)) {
        // Присваиваем значение глобальной переменной
        window[key] = savedSettings[key];
    } else {
        console.log(`no such global variable found: ${key}`);
    }
}
