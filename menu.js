continueButton = document.getElementById("continue-button");
playButton = document.getElementById("play-button");

continueButton.addEventListener('click', (e) => {
    switchConitnueGameSave(true);
});
playButton.addEventListener('click', (e) => {
    switchConitnueGameSave(false);
});
function switchConitnueGameSave(state) {
    let lastGameState = JSON.parse(localStorage.getItem('gamefieldSave')) || null;
    if (lastGameState && state) {
        lastGameState.isContinue = state;
        localStorage.setItem('gamefieldSave', JSON.stringify(lastGameState));
        window.open('game/gamefield.html'); 
    }
    if (!state) {
        if (lastGameState) {
            lastGameState.isContinue = state;
            localStorage.setItem('gamefieldSave', JSON.stringify(lastGameState));
        }
        window.open('game/gamefield.html');
    }
}