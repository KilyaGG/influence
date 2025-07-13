let turnID;
let selectedCell;
let isUpgrading = false;
if (lastGameState.isContinue) {
    if (lastGameState.turnID) {
        turnID = lastGameState.turnID;
    }
    if (lastGameState.isUpgrading) {
        isUpgrading = lastGameState.isUpgrading;
    }
} else {
    turnID = getTurn();
}
function checkCell(cellID, mustUpgrade = false) {
    let parts = cellID.split('_');
    let x = parseInt(parts[0]);
    let y = parseInt(parts[1]);
    let contactedPlayers = [];
    if (cellID != "emptyCell" || !isUpgrading) {
        if (selectedCell && !mustUpgrade) {
            if (selectedCell.lvl > 1) {
                neighbors = selectedCell.getNeighbors(fieldDM, fieldSize);
                neighbors.forEach(cell => {
                    let failedToAttack = false;
                    if (cell === fieldDM[x][y] && cell.ownerID != turnID) {
                        ownerID = turnID;
                        owner = getPlayerByID(ownerID);
                        if (fieldDM[x][y].lvl != 0) {
                            workConflictResult = workConflict(fieldDM[x][y], selectedCell);
                            let playersToWork = workConflictResult[0];
                            failedToAttack = workConflictResult[1];
                            contactedPlayers = playersToWork;
                        } else {
                            targetLvl = selectedCell.lvl - 1;
                            let tempCell;
                            if (targetLvl > selectedCell.getMaxSizeByType()) {
                                fieldDM[x][y].getOwned(owner, 8);
                                tempCell = selectedCell;
                                tempCell.lvl = 4;
                                
                            } else {
                                fieldDM[x][y].getOwned(owner, targetLvl);
                                tempCell = selectedCell;
                                tempCell.lvl = 1;
                            }
                            changeFieldData(tempCell);
                            player = getPlayerByID(fieldDM[x][y].ownerID);
                            player.cellsToUpdate.push(tempCell, fieldDM[x][y]);
                            contactedPlayers.push(getPlayerByID(fieldDM[x][y].ownerID));
                        }
                        owner.power = owner.calculatePower();
                        if (!failedToAttack) {
                            selectedCell = fieldDM[x][y];
                        }
                        
                        //console.log(`Placed cell! Cell:`);
                        //console.log(fieldDM[x][y]);
                    }
                }); 
            }
        }  
        if (fieldDM[x][y].ownerID === turnID) {
            if (!isUpgrading) {
                selectedCell = fieldDM[x][y];
                //console.log(`Selected cell! Cell:`);
                //console.log(fieldDM[x][y]);
            } else {
                if (mustUpgrade) {
                    cell = fieldDM[x][y];
                    size = cell.getMaxSizeByType(cell.type);
                    upgradeValue = size - cell.lvl;
                    for (let i = 1; i <= upgradeValue; i++) {
                        upgrade(fieldDM[x][y], 1);
                    }
                } else {
                    upgrade(fieldDM[x][y], 1);
                }
                player = getPlayerByID(fieldDM[x][y].ownerID);
                player.cellsToUpdate.push(fieldDM[x][y]);
                contactedPlayers.push(player);
            }

        }
        
    }
    return contactedPlayers;
}

function workConflict(cell, enemyCell) {
    enemyPlayer = getPlayerByID(enemyCell.ownerID);
    let playersToWork = [];
    let failedToAttack = false;
    if (cell.lvl < enemyCell.lvl) {

        winCell(cell, enemyCell, enemyPlayer, playersToWork);

    } else if (cell.lvl > enemyCell.lvl) {

        defeatCell(cell, enemyCell, playersToWork);
        failedToAttack = true;
    } else if (cell.lvl = enemyCell.lvl) {

        let ranum = Math.floor(Math.random()*2);

        if (ranum === 1) {
            winCell(cell, enemyCell, enemyPlayer, playersToWork)
        } else {

            defeatCell(cell, enemyCell, playersToWork);
            failedToAttack = true;
        }
    }
    return [playersToWork, failedToAttack];
}

function winCell(cell, enemyCell, enemyPlayer, playersToWork) {
    cell.getOwned(enemyPlayer, enemyCell.lvl - cell.lvl, getPlayerByID(cell.ownerID));
    enemyCell.lvl = 1;
    enemyPlayer.cellsToUpdate.push(enemyCell);
    player = getPlayerByID(cell.ownerID);
    player.cellsToUpdate.push(cell);
    playersToWork.push(enemyPlayer, player);
}

function checkForPlayerBugs() {
    players.forEach(player => {
        if (player) {
            player.cells.forEach(cell => {
                if (cell.ownerID != player.id || cell.color != player.color) {
                    player.cells = remove(player.cells, cell);
                }
            });   
        }
    });
}

function defeatCell(cell, enemyCell, playersToWork) {
    lvl = cell.lvl - (enemyCell.lvl);
    if (lvl > 0) {
        cell.lvl = lvl;
    } else {
        cell.lvl = 1
    }
    enemyCell.lvl = 1;

    enemyPlayer.cellsToUpdate.push(enemyCell);
    let player;
    if (!cell.special || cell.ownerID) {
        player = getPlayerByID(cell.ownerID);
        player.cellsToUpdate.push(cell);
    } else {
        player = cell;
    }
    playersToWork.push(enemyPlayer, player);
}

function getTurn() {
    let playerID;
    players.forEach(player => {
        if (player && player.turn) {
            playerID = player.id;
        }
    });
    return playerID;
}

function checkPlayersToRemove() {
    for (let i = 0; i < players.length-1; i++) {
        player = players[i];
        if (player && player.cells.length === 0) {
            console.log(`Player ${players[i].color} lost`);
            players[i] = null;
        }
    }
}

function switchPlayer() {
    checkForPlayerBugs();
    if (!isUpgrading) {
        id = getTurn();
        player = getPlayerByID(id);
        player.turn = false;
        player.upgradePoints = 0;
        playerKey = player.key;
        //console.log(`Turn reset on ${players[playerKey].color}`);
        let key;
        if (!players[playerKey+1] && players[0]) {
            key = 0;
        } else {
            if (!players[playerKey+1]) {
                for (let i = 0; i < players.length-1; i++) {
                    if (players[i]) {
                        key = i;
                        foundPlayer = true;
                    }
                }
            } else {
                key = playerKey+1;
            }
        }
        if (key != undefined) {
            players[key].turn = true;
            players[key].upgradePoints = players[key].calculateUpgradePoints();
            if (isUsingModes && upgradeTowers) {
                workSpecialCellsOnTurnSwtich(players[key], fieldDM);
            }
            turnID = players[key].id
            //console.log(`Turn switced to ${players[key].color}`);
            selectedCell = null;
        } else {
            console.log(`PLAYER ${player.color} WON!!!`);
        }
    }
}

function upgrade(cell, value) {
    player = getPlayerByID(cell.ownerID);
    if (player.upgradePoints >= value && cell.lvl != cell.getMaxSizeByType()) {
        player.upgradePoints -= value;
        if (cell.lvl < cell.getMaxSizeByType()) {
            cell.lvl += value;
            console.log(`Cell at X: ${cell.x} Y: ${cell.y} upgraded for ${value}`);
    }   }
}

function switchUpgradeState() {
    let shouldSwitch = false;
    if (isUpgrading) {
        isUpgrading = false;
        switchPlayer();
        shouldSwitch = true;
    } else {
        isUpgrading = true;
    }
    selectedCell = null;
    console.log(`Upgrading state switched to ${isUpgrading}`);
    return shouldSwitch;
    //самая крутая функция кстати
}