const tableBody = document.getElementById('grid-table');
const zoomLevel = document.getElementById('zoom-level');
const tableContainer = document.querySelector('.table-container');
const saveButton = document.getElementById('save-button');

let holdTimer = null;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;

let currentZoom = 1;
const zoomStep = 0.1;
const minZoom = 0.4;
const maxZoom = 3;

let isPopupVisible = false;

let cmdlastStatements = [];
let cmdListIdx;


document.addEventListener('DOMContentLoaded', function() {
    updateTransform(0,0,1);
    generateUI(tableBody, fieldSize);

    const input = document.getElementById('text-input');
    
    input.addEventListener('keydown', function(e) {
        if (e.code === 'Enter') {
            if (isPopupVisible) {
                getInputText();
            }
        }
        if (e.key === 'Backspace') {
            input.value = '';
        }
        if (e.code === 'ArrowUp') {
            if (!cmdListIdx) {
                cmdListIdx = cmdlastStatements.length-1;
            } else {
                cmdListIdx--;
            }
            input.value = cmdlastStatements[cmdListIdx];
        }
    });
    tableContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.ctrlKey) {
            if (e.deltaY < 0 && currentZoom < maxZoom) {
                currentZoom += zoomStep;
            } else if (e.deltaY > 0 && currentZoom > minZoom) {
                currentZoom -= zoomStep;
            }
            updateTransform(posX, posY, currentZoom);
        }
    });

    saveButton.addEventListener('click', (e) => {
        saveField();
    });

    tableContainer.addEventListener('mousedown', (e) => {
        if (e.button === 2) { // Правая кнопка мыши
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
            e.preventDefault(); // Предотвращаем контекстное меню
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.code === "Enter") {
            togglePopup();
        }
        if (event.code === "KeyQ") {
            isSelectingCells = !isSelectingCells;
            if (!isSelectingCells) {
                unselect();
            }
            console.log(`isSelectingCells: ${isSelectingCells}`);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
            updateTransform(posX, posY, currentZoom);
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (e.button === 2 && isDragging) {
            isDragging = false;
            tableContainer.style.cursor = 'grab';
        }
    });

    tableContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    updateTransform(posX, posY, currentZoom);
});

//--------------АПДЕЙТЫ--------------

function updateTransform(X, Y, zoom) {
    tableContainer.style.transform = `translate(${X}px, ${Y}px) scale(${zoom})`;
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    posX = X;
    posY = Y;
    currentZoom = zoom;
}

//--------------UI--------------

function saveField() {
    gamestate = {
        isContinue: false,
        fieldDM: fieldDM,
        players: players,
        turnID: turnID,
        isUpgrading: isUpgrading,
        isUsingModes: isUsingModes,
        bigCells: bigCells,
        upgradeTowers: upgradeTowers
    }
    localStorage.setItem('gamefieldSave', JSON.stringify(gamestate));
}

function generateUI(tableBody, length) {
    for(let i = 0; i < length; i++) {
        tr = document.createElement('tr');
        for (let j = 0; j < length; j++) {
            td = tr.appendChild(document.createElement('td'));    
            if (fieldDM[i][j] != null) {
                td.style.backgroundColor = fieldDM[i][j].color;
                td.id = fieldDM[i][j].fieldID;
                if (fieldDM[i][j].special === "upgradeTower") {
                   td.classList.add('upgradeTower');
                } else {
                if (fieldDM[i][j].type === 0) {
                    td.classList.add('small-cell');
                } else if (fieldDM[i][j].type === 2){
                    td.classList.add('big-cell');
                } else if (fieldDM[i][j].type === 1){
                    td.classList.add('medium-cell');
                }
                }
                td.row = j;
                td.column = i;
                td.innerHTML = fieldDM[i][j].lvl;
                
                td.addEventListener('click', (e) => {
                    let cells = selectCells(e.target.id, e.button);
                    if (cells) {
                        updateUI(cells);
                    } else {
                        updateUI();
                    }
                });
            }
            
        }
        
        tableBody.appendChild(tr);
    }
}

function togglePopup() {
    const popup = document.getElementById('popup-container');
    const input = document.getElementById('text-input');
    
    if (isPopupVisible) {
        popup.classList.remove('visible');
        input.value = ''; // Очищаем поле при скрытии
    } else {
        popup.classList.add('visible');
        input.value = '';
        input.focus(); // Фокусируемся на поле при показе
    }
    
    isPopupVisible = !isPopupVisible;
}

function getInputText() {
    const input = document.getElementById('text-input').value;
    if (input != "") {
        selectedCells.forEach(cell => {
            updateCell(input, cell);
        });
        updateUI();
    }
    cmdlastStatements.push(input);
    cmdListIdx = null;
}

function updateUI(cells = selectedCells) {
    cells.forEach(cell => {
        if (cell.type != "removed") {
            td = document.getElementById(cell.fieldID);
            td.style.backgroundColor = cell.color;
            td.className = "";
            td.className = "selected-cell";
            if (cell.special === "upgradeTower") {
                td.classList.add('upgradeTower');
            } else if (cell.type === 0) {
                td.classList.add('small-cell');
            } else if (cell.type === 2){
                td.classList.add('big-cell');
            } else if (cell.type === 1){
                td.classList.add('medium-cell');
            } 
            td.innerHTML = cell.lvl;
        } else {
            td = document.getElementById(cell.fieldID);
            td.classList.add("emptyCell");
            td.style.border = "none";
            td.style.backgroundColor = "black";
            td.style.borderRadius = "0px";
        }
    });
    
    
}