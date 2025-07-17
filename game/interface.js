const tableBody = document.getElementById('grid-table');
const zoomLevel = document.getElementById('zoom-level');
const tableContainer = document.querySelector('.table-container');
const scaleElement = document.getElementById('colorScale');
const circle = document.getElementById('colorCircle');
const saveButton = document.getElementById('save-button');
const circleNumber = document.querySelector('.circle-number');

let holdTimer = null;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;

let currentZoom = 1;
const zoomStep = 0.1;
const minZoom = 0.4;
const maxZoom = 3;


document.addEventListener('DOMContentLoaded', function() {
    generateUI(tableBody, fieldSize);
    updateScale(players);
    updateCircle(turnID);
    updatePowerLabel(turnID);
    hideCells(true);
    moveToCellByPlayerID(turnID);
    checkForPlayerBugs();

    document.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (e.ctrlKey) { // Zoom только при зажатом Ctrl
            if (e.deltaY < 0 && currentZoom < maxZoom) {
                currentZoom += zoomStep;
            } else if (e.deltaY > 0 && currentZoom > minZoom) {
                currentZoom -= zoomStep;
            }
            updateTransform(posX, posY, currentZoom);
        }
    }, {passive: false });

    saveButton.addEventListener('click', (e) => {
        saveField();
    });

    document.addEventListener('mousedown', (e) => {
        if (e.button === 2) { // Правая кнопка мыши
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
            e.preventDefault(); // Предотвращаем контекстное меню
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

    circle.addEventListener('click', (e) => {
        checkPlayersToRemove();
        let shouldSwitch = switchUpgradeState();
        if (shouldSwitch) {
            moveToCellByPlayerID(turnID);
            hideCells(true);
        }
        updateCircle(turnID);
    });

    updateTransform(posX, posY, currentZoom);

    if (funLabel) {
        randomizePageName();
    }
});

//--------------АПДЕЙТЫ--------------

function updateTransform(X, Y, zoom) {
    tableContainer.style.transform = `translate(${X}px, ${Y}px) scale(${zoom})`;
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    posX = X;
    posY = Y;
    currentZoom = zoom;
}

function updateCircle(id) {
    updatePowerLabel(id);
    player = getPlayerByID(id);
    circle.style.backgroundColor = player.color;
}

function updatePowerLabel(id) {
    player = getPlayerByID(id);
    circleNumber.innerHTML = player.upgradePoints;
}
//--------------FUN--------------

function randomizePageName() {
    part1 = [
        "Тетерев",
        "Зотик",
        "Амогус",
        "Зот спермович",
        "Лысая макака",
        "Заморыш98",
        "Линч",
        "Адольф варлаков",
        "Мистер федя",
        "Бенито грегорини",
        "Санс табурет",
        "Ти не макака",
        "Шкбд тулает",
        "Слендермен",
        "Попугай долбаёб",
        "Ян Топлес",
        "Зотик ботик",
        "Этот гандон"
    ];
    part2 = [
        "ползет",
        "летит",
        "сосёт",
        "карабкается",
        "катится",
        "ковыляет",
        "бежит",
        "срет",
        "телепортируется",
        "отправляется",
        "шевствует",
        "плывёт",
        "уплывает",
        "идёт",
        "переваливает",
        "левитирует",
        "ахуевает"
    ];
    part3 = [
        "на хуй",
        "в лес",
        "по дрова",
        "на завод",
        "в магазин",
        "в нижнюю пятерочку",
        "в верхнюю пятерочку",
        "в инфлюенс",
        "в Польшу",
        "трахать дуб",
        "ебать хлеб",
        "спать",
        "на гору",
        "по дороге",
        "грызть какашки",
        "колоть дрова",
        "ругать америку"
    ]
    ranum1 = Math.floor(Math.random()*part1.length);
    ranum2 = Math.floor(Math.random()*part2.length);
    ranum3 = Math.floor(Math.random()*part3.length);
    document.title = `${part1[ranum1]} ${part2[ranum2]} ${part3[ranum3]}`;
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

function moveToCellByPlayerID(playerID, zoom = 2) {
    if (getPlayerByID(playerID)) {
        player = getPlayerByID(playerID);
        cell = player.cells[0];
        mid = Math.floor((fieldSize - 1)/2);
        spaceX = mid - cell.x;
        spaceY = mid - cell.y;
        spaceBetween = 40*zoom;
        finalX = (spaceX)*spaceBetween;
        finalY = (spaceY)*spaceBetween;
        updateTransform(finalY, finalX, zoom);
        console.log(`X: ${cell.x} Y: ${cell.y}`)
    }
}

function moveToCell(cellX, cellY, zoom = 2) {
    mid = Math.floor((fieldSize - 1)/2);
    spaceX = mid - cellX;
    spaceY = mid - cellY;
    spaceBetween = 40*zoom;
    finalX = (spaceX)*spaceBetween;
    finalY = (spaceY)*spaceBetween;
    updateTransform(finalY, finalX, zoom);

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
                    let players = checkCell(e.target.id);
                    if (players) {
                        updateUI(players);
                    }
                });
                td.addEventListener('mousedown', (e) => {
                    if (e.button === 0) {
                        holdTimer = setTimeout(() => {
                            checkCell(e.target.id, true);
                        }, 500);
                    }
                });
                
                td.addEventListener('mouseup', () => {
                    // Если кнопку мыши отпустили до истечения 1 секунды - отменяем таймер
                    if (holdTimer) {
                        clearTimeout(holdTimer);
                        holdTimer = null;
                    }
                });

                td.addEventListener('mouseleave', () => {
                    // Если курсор ушёл с элемента до отпускания - тоже отменяем
                    if (holdTimer) {
                        clearTimeout(holdTimer);
                        holdTimer = null;
                    }
                });

            } else {
                td.id = "emptyCell";
                td.style.border = "none";
                td.style.backgroundColor = "black";
                td.style.borderRadius = "0px";
                td.row = j;
                td.column = i;
            }
            
        }
        
        tableBody.appendChild(tr);
    }
}


function updateUI(playersToUpdate) {
    if (playersToUpdate.length > 0) {
        updatePowerLabel(turnID);
        playersToUpdate.forEach(player => {
            if (player.constructor.name === "Player") {
                currentPlayer = getPlayerByID(player.id);
                playerCells = currentPlayer.cellsToUpdate;
                console.log(playerCells);
                playerCells.forEach(cell => {
                    td = document.getElementById(cell.fieldID);
                    td.style.backgroundColor = cell.color;
                    td.innerHTML = cell.lvl;
                });
                if (!isUpgrading) {
                    hideCells(false);
                }
                player.cellsToUpdate = [];
            } else if (player.constructor.name === "Cell") {
                cell = player;
                td = document.getElementById(cell.fieldID);
                td.style.backgroundColor = cell.color;
                td.id = cell.fieldID;
                td.innerHTML = cell.lvl;
            }
        });
        if (!isUpgrading) {
            updateScale(players);
        }
    }
}

function hideCells(firstUpdate) {
    if (shouldHideCells) {
        let playerCells;
        let visibleCells = [];
        player = getPlayerByID(turnID);
        if (firstUpdate) {
            visibleCells = [];
            playerCells = player.cells;
        } else {
            playerCells = player.cellsToUpdate;
        }
        playerCells.forEach(cell => {
            neighbors = cell.getNeighbors(fieldDM, fieldSize, true);
            if (visibleCells.length > 0) {
                let cellsToPush = [];
                neighbors.forEach(neighbor => {
                    for (let i = 0; i < 4; i++) {
                        if (i != 0) {
                            if (cellsToPush[i] && neighbor.fieldID != cellsToPush[i].fieldID) {
                                cellsToPush = cellsToPush.flat();
                                cellElement = document.getElementById(neighbor.fieldID);
                                cellElement.classList.remove("hidden-cell");
                                cellsToPush.push(neighbor);
                            }
                        } else {
                            cellsToPush = cellsToPush.flat();
                            cellElement = document.getElementById(neighbor.fieldID);
                            cellElement.classList.remove("hidden-cell");
                            cellsToPush.push(neighbor);
                        }
                        visibleCells.push(cellsToPush);
                    }
                });
            } else {
                neighbors.forEach(neighbor => {
                    cellElement = document.getElementById(neighbor.fieldID);
                    cellElement.classList.remove("hidden-cell");
                });
                visibleCells.push(neighbors);      
            }
            visibleCells.push(cell);
            cellElement = document.getElementById(cell.fieldID);
            cellElement.classList.remove("hidden-cell");
            visibleCells = visibleCells.flat();
        });
        if (firstUpdate) {
            let hiddenField = excludeObjects(fieldDM, visibleCells, "fieldID");
            hiddenField.forEach(cells => {
                cells.forEach(cell => {
                    if (cell) {
                        cellElement = document.getElementById(cell.fieldID);
                        cellElement.classList.add("hidden-cell");
                    }
                });
            });
        }
        updateScale(players);
    }
}



