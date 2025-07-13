function workSpecialCellsOnTurnSwtich(player, fieldDM) {
    player.cells.forEach(cell => {
        if (cell.special === "upgradeTower") {
            neighbors = cell.getNeighbors(fieldDM, fieldSize);
            neighbors.forEach(neighbor => {
                cellEllement = document.getElementById(neighbor.fieldID);
                cellEllement.classList.remove("upgrade-tower-target");
                if (!neighbor.special && neighbor.ownerID === cell.ownerID && neighbor.lvl < neighbor.getMaxSizeByType()) {
                    neighbor.lvl++;
                    cellEllement.innerHTML = neighbor.lvl;
                    cellEllement.classList.add("upgrade-tower-target");
                }
            });
        }
    });
}