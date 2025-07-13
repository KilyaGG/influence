let lastGameState = JSON.parse(localStorage.getItem('gamefieldSave')) || {};
let players = [];
let fieldDM;

if (lastGameState.isContinue) {
    initGameSave();
}

function initGameSave() {
    if (lastGameState.fieldDM) {
        fieldDM = lastGameState.fieldDM;
        for (let i = 0; i < fieldSize; i++) {
            for (let j = 0; j < fieldSize; j++) {
                cell = fieldDM[i][j];
                if (cell) {
                    let cella = new Cell();
                    cella.x = cell.x;
                    cella.y = cell.y;
                    cella.type = cell.type;
                    cella.color = cell.color;
                    cella.lvl = cell.lvl;
                    cella.fieldID = cell.fieldID;
                    cella.ownerID = cell.ownerID;
                    cella.special = cell.special;
                    fieldDM[i][j] = cella;
                }
            }
        }
    }
    if (lastGameState.players) {
        players = lastGameState.players;
        for (let i = 0; i < players.length; i++) {
            player = players[i];
            playera = new Player();
            playera.id = player.id;
            playera.color = player.color;
            playerCells = player.cells;
            for (let i = 0; i < playerCells.length; i++) {
                x = playerCells[i].x;
                y = playerCells[i].y;
                playerCells[i] = fieldDM[x][y];
            }
            playera.cells = playerCells;
            playera.power = player.power;
            playera.upgradePoints = player.upgradePoints;
            playera.key = player.key;
            playera.turn = player.turn;
            players[i] = playera;
        }
    }
}

function changeFieldData(cellData) {
    x = cellData.x;
    y = cellData.y;
    fieldDM[x][y] = cellData;
}


function getPlayerByID(playerID) {
    for (let idx = 0; idx < players.length; idx++) {
        if (players[idx] && players[idx].id === playerID) {
            return players[idx];
        }
    }
}

function cellRandomizer() {
    let cellType = Math.floor(Math.random()*10);
    let mediumNum = 2;
    let bigNum = 1;
    if (cellType === mediumNum) {
        return 1;
    } else if (bigNum === cellType && isUsingModes && bigCells){
        cellType1 = Math.floor(Math.random()*5);
        if (bigNum === cellType1) {
            return 2;
        }
    } else {
        return 0;
    }
    return 0;
    
}

function specialRandomizer(cell) {
    let ranum = Math.floor(Math.random()*80);
    if (ranum === 1 && upgradeTowers && isUsingModes) {
        cell.lvl = 5;
        return "upgradeTower";
    }
}

const rainbowColors = [
  "red",
  "blue",
  "yellow",
  "green",
  "orange",  
  "indigo",
  "violet",
  "#00ffee",
  "#ff7b00",
  "#ff00f2"
];

function generateDataModel(length) {
    const perlin = new PerlinNoise();
    fieldDM = []
    for (let i = 0; i < length; i++) {
        fieldDM[i] = [];
        for (let j = 0; j < length; j++) {
            coordMultipler = fieldSize/100 - 0.1;
            let noiseValue = perlin.noise2D(i * coordMultipler, j * coordMultipler, 0.4, 1, 10);
            if (cutMap) {
                for (let k = 1; k <= cutValue;k++) {
                    noiseValue = perlin.generateEdgeNoise(i,j,length,length,0.2,noiseValue,k/3);
                }
            }
            if (noiseValue >= 0.45) {
                let cell = new Cell();
                cell.x = i;
                cell.y = j;
                cell.color = null;
                cell.lvl = 0;
                cell.fieldID = `${i}_${j}`;
                cell.special = specialRandomizer(cell);
                if (!cell.special) {
                    cell.type = cellRandomizer();
                } else {
                    cell.type = 0;
                }
                fieldDM[i][j] = cell;
            } else {
                fieldDM[i][j] = null;
            }
            
        }
    }
    playerTerritorySize = calcuclateEachPlayerTerritory();
    fieldDM = addSmallHoles(fieldDM);
    fieldDM = connectIslands(fieldDM, 30, 4, false);
    fieldDM = addFieldPlayers(fieldDM, playerTerritorySize);
    return fieldDM;
}

function calcuclateEachPlayerTerritory() {
    let playerTerritorySize;
    if (fieldSize >= playersCount + 2) {
        playerTerritorySize = Math.floor((fieldSize / playersCount) - (fieldSize/10));
    } else {
        playerTerritorySize = 1;
    }
    return playerTerritorySize;
    
}
function setPlayerTerritory(x, y, size) {
    topX = x - size;
    topY = y - size;
    bottomX = x + size;
    bottomY = y + size;
    topCell = {x: topX, y: topY};
    bottomCell = {x: bottomX, y: bottomY};
    return [topCell, bottomCell];

}

function addPlayer(ranX, ranY, i, tookPlaces, selectedTurn, turnRandomizer, colorIndex, playerTerritorySize, selectedCell) {
    player = new Player();
    player.id = Math.floor(Math.random()*(ranX+ranY)*i*10);
    player.color = rainbowColors[colorIndex];
    if (i === turnRandomizer || i === playersCount && !selectedTurn) {
        player.turn = true;
    } else {
        player.turn = false;
    }
    cellTerritory = setPlayerTerritory(ranX, ranY,playerTerritorySize)
    tookPlaces.push(cellTerritory);
    lvl = Math.floor(4/(0.5*playersCount) + (0.05*fieldSize));
    selectedCell.ownerID = player.id;
    selectedCell.lvl = lvl;
    selectedCell.color = player.color;
    selectedCell.fieldID = `${ranX}_${ranY}`;

    player.cells.push(selectedCell);
    player.power = player.calculatePower();
    points = Math.round(fieldSize/10);
    if (fieldSize<10) {
        points = 2;
    }
    player.upgradePoints = points;
    player.key = i - 1;

    players.push(player);

    return player.turn;
}

function addFieldPlayers(fieldDM, territorySize = 5) {
    let tookPlaces = [];
    let colorIndex = 0;
    let i = 1;
    let selectedTurn = false;
    let turnRandomizer = Math.floor(Math.random()*playersCount);
    while (i <= playersCount) {
        let ranX = Math.floor(Math.random()*fieldSize);
        let ranY = Math.floor(Math.random()*fieldSize);
        let selectedCell = fieldDM[ranX][ranY];
        if (selectedCell != null && !selectedCell.ownerID && !selectedCell.color && !selectedCell.special) {
            if (tookPlaces.length > 0) {
                placedPlayer = false;
                tookPlaces.forEach(place => {
                        if (ranX < place[0].x || ranX > place[1].x && ranY < place[0].y || ranY > place[1].y) {
                            if (!placedPlayer) {
                                playerTurn = addPlayer(ranX, ranY, i, tookPlaces, selectedTurn, turnRandomizer, colorIndex, territorySize, selectedCell);
                                if (playerTurn) {
                                    selectedTurn = true;
                                }
                                placedPlayer = true;
                                colorIndex++;
                                i++;
                            }              
                        }
                });
            } else {
                playerTurn = addPlayer(ranX, ranY, i, tookPlaces, selectedTurn, turnRandomizer, colorIndex, territorySize, selectedCell);
                if (playerTurn) {
                    selectedTurn = true;
                }
                colorIndex++;
                i++;
            }
            
        }
        
    }
    console.log(`Players placed with interval: ${territorySize}`)
    return fieldDM;
}
if (!fieldDM) {
    fieldDM = generateDataModel(fieldSize);
}
