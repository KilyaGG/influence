let fieldDM = [];
let fieldSize = 30;
let isSelectingCells = false;
let selectedFirstCell;
let selectedCells = [];

function generateDM(fieldDM, length) {
    for (let i = 0; i < length; i++) {
        fieldDM[i] = [];
        for (let j = 0; j < length; j++) {
            let cell = new Cell();
            cell.x = i;
            cell.y = j;
            cell.color = null;
            cell.lvl = 0;
            cell.fieldID = `${i}_${j}`;
            cell.type = 0;
            fieldDM[i][j] = cell;
        }
    }
    return fieldDM;
}

fieldDM = generateDM(fieldDM, fieldSize);
function getCellByID(id) {
    for (let i = 0; i < fieldSize; i++) {
        for (let j = 0; j < fieldSize; j++) {
            if (fieldDM[i][j].fieldID === id) {
                return fieldDM[i][j];
            }
        }
    }
}
function selectCells(cellID, button) {
    cell = getCellByID(cellID);
    if (button === 0) {
        if (isSelectingCells) {
            if (selectedFirstCell) {
                topX = selectedFirstCell.x;
                topY = selectedFirstCell.y;
                bottomX = cell.x
                bottomY = cell.y;
                for (let i = topX; i <= bottomX; i++) {
                    for (let j = topY; j <= bottomY; j++) {
                        element = document.getElementById(fieldDM[i][j].fieldID);
                        element.classList.add("selected-cell");
                        selectedCells.push(fieldDM[i][j]);
                    }
                }
            } else {
                selectedFirstCell = cell;
                element = document.getElementById(cell.fieldID);
                element.classList.add("selected-cell");
                console.log(selectedFirstCell);
            }
        }
    }
}
function unselect() {
    selectedCells.forEach(cell => {
        element = document.getElementById(cell.fieldID);
        element.classList.remove("selected-cell");
    });
    selectedCells = [];
    selectedFirstCell = null;
}
function updateCell(input, cell) {
    lvl = input;
    if (lvl) {
        if (lvl === "remove") {
            cell.type = "removed";
        } else {
            if (lvl === "max") {
            cell.lvl = cell.getMaxSizeByType();
            }
            if (lvl === "min") {
                cell.lvl = 1;
            }
            if (parseInt(lvl)) {
                cell.lvl = parseInt(lvl);
            }
            if (lvl === "rlvl") {
                maxSize = cell.getMaxSizeByType();
                cell.lvl = Math.floor(Math.random()*maxSize);
            }
            cell.type = null;
            if (lvl === "rtype") {
                cell.type = Math.floor(Math.random()*3);
            }
            if (lvl === "type0") {
                cell.type = 0;
            }
            if (lvl === "type1") {
                cell.type = 1;
            }
            if (lvl === "type2") {
                cell.type = 2;
            }
        }
    }
    if (!cell.type) {
        cell.type = 0;
    }
}