/**
 * Расширяет узкие места в соединениях между островами.
 * @param {Array<Array<any>>} grid - Игровое поле.
 * @param {number} minNeckWidth - Минимальная допустимая ширина (если уже >= minNeckWidth, не трогаем).
 * @param {number} targetWidth - Желаемая ширина после расширения.
 * @param {string} fillValue - Чем заполнять расширенные области (например, "bridge").
 * @returns {Array<Array<any>>} - Новое поле с расширенными перешейками.
 */
function widenNeckAreas(grid, minNeckWidth = 2, targetWidth = 4, fillValue = "bridge") {
    if (!grid || grid.length === 0) return grid;

    const rows = grid.length;
    const cols = grid[0].length;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // 1. Находим все мосты (клетки, которые не null и не являются частью крупных островов)
    const bridgeCells = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] === fillValue) {
                bridgeCells.push([i, j]);
            }
        }
    }

    // 2. Для каждой клетки моста проверяем, является ли она частью узкого места
    for (const [x, y] of bridgeCells) {
        let isNeck = false;

        // Проверяем, является ли эта клетка частью узкого перешейка
        for (const [dx, dy] of directions) {
            const nx1 = x + dx;
            const ny1 = y + dy;
            const nx2 = x - dx;
            const ny2 = y - dy;

            // Если по обе стороны от моста есть земля (остров), то это перешеек
            if (
                nx1 >= 0 && nx1 < rows && ny1 >= 0 && ny1 < cols &&
                nx2 >= 0 && nx2 < rows && ny2 >= 0 && ny2 < cols &&
                grid[nx1][ny1] !== null && grid[nx1][ny1] !== fillValue &&
                grid[nx2][ny2] !== null && grid[nx2][ny2] !== fillValue
            ) {
                isNeck = true;
                break;
            }
        }

        // 3. Если это узкое место, расширяем его
        if (isNeck) {
            expandArea(grid, x, y, targetWidth, fillValue);
        }
    }

    return grid;
}

/**
 * "Раздувает" область вокруг точки до заданного радиуса.
 */
function expandArea(grid, centerX, centerY, radius, fillValue) {
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > radius) continue; // Круг вместо квадрата для плавности

            const nx = centerX + dx;
            const ny = centerY + dy;
            if (
                nx >= 0 && nx < grid.length &&
                ny >= 0 && ny < grid[0].length &&
                grid[nx][ny] === null
            ) {
                let cell = new Cell();
                cell.x = dx;
                cell.y = dy;
                cell.type = cellRandomizer();
                cell.color = null;
                cell.lvl = 0;
                cell.fieldID = `${dx}_${dy}`;
                grid[dx][dy] = cell;
                    console.log(`Expanded area at:`);
                    console.log(grid[centerX][centerY]);
            }
        }
    }
}

/**
 * Объединяет острова, удаляет маленькие и строит широкие/естественные мосты.
 * @param {Array<Array<any>>} grid - Двумерный массив (null - пустота, иначе - земля).
 * @param {number} minIslandSize - Минимальный размер острова (иначе удаляется).
 * @param {number} bridgeWidth - Ширина моста (1 = линия, 2+ = широкий мост).
 * @param {boolean} useAStar - Если true, строит извилистые мосты (медленнее).
 * @returns {Array<Array<any>>} - Новое поле с объединёнными островами.
 */
function connectIslands(grid, minIslandSize = 20, bridgeWidth = 1, useAStar = false) {
    if (!grid || grid.length === 0) return grid;

    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
    let islands = [];

    // 1. Поиск всех островов (BFS)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (grid[i][j] !== null && !visited[i][j]) {
                const island = [];
                const queue = [[i, j]];
                visited[i][j] = true;

                while (queue.length > 0) {
                    const [x, y] = queue.shift();
                    island.push([x, y]);

                    // Проверяем 4 соседние клетки
                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (const [dx, dy] of directions) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (
                            nx >= 0 && nx < rows &&
                            ny >= 0 && ny < cols &&
                            grid[nx][ny] !== null &&
                            !visited[nx][ny]
                        ) {
                            visited[nx][ny] = true;
                            queue.push([nx, ny]);
                        }
                    }
                }
                if (island.length >= minIslandSize) {
                    islands.push(island);
                } else {
                    // Удаляем маленький остров
                    for (const [x, y] of island) {
                        grid[x][y] = null;
                    }
                }
            }
        }
    }

    if (islands.length <= 1) return grid; // Нет островов или только один

    // 2. Сортируем острова по размеру (от большего к меньшему)
    islands.sort((a, b) => b.length - a.length);
    const [mainIsland, ...otherIslands] = islands;

    // 3. Соединяем каждый остров с главным
    for (const island of otherIslands) {
        let closestPair = null;
        let minDistance = Infinity;

        // Ищем ближайшую пару точек между островами
        for (const [x1, y1] of mainIsland) {
            for (const [x2, y2] of island) {
                const distance = Math.abs(x1 - x2) + Math.abs(y2 - y1); // Манхэттенское расстояние
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPair = [[x1, y1], [x2, y2]];
                }
            }
        }

        // Строим мост
        if (closestPair) {
            const [[x1, y1], [x2, y2]] = closestPair;
            if (useAStar) {
                buildAStarBridge(grid, x1, y1, x2, y2, bridgeWidth);
            } else {
                buildBresenhamBridge(grid, x1, y1, x2, y2, bridgeWidth);
            }
        }
    }

    return grid;
}

/**
 * Строит широкий мост по алгоритму Брезенхема.
 */
function buildBresenhamBridge(grid, x1, y1, x2, y2, width) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        // Заполняем не только точку, но и область вокруг (для ширины)
        for (let dw = -width; dw <= width; dw++) {
            for (let dh = -width; dh <= width; dh++) {
                const nx = x1 + dw;
                const ny = y1 + dh;
                if (
                    nx >= 0 && nx < grid.length &&
                    ny >= 0 && ny < grid[0].length &&
                    grid[nx][ny] === null
                ) {
                    let cell = new Cell();
                    cell.x = nx;
                    cell.y = ny;
                    cell.type = cellRandomizer();
                    cell.color = null;
                    cell.lvl = 0;
                    cell.fieldID = `${nx}_${ny}`;
                    grid[nx][ny] = cell; // Или другое значение
                    //console.log(`Bridge cell placed:`)
                    //console.log(grid[nx][ny]);
                }
            }
        }

        if (x1 === x2 && y1 === y2) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

/**
 * Строит извилистый мост через алгоритм A* (естественный путь).
 */
function buildAStarBridge(grid, x1, y1, x2, y2, width) {
    // Упрощенная версия A* (можно заменить на полноценную реализацию)
    const path = findAStarPath(grid, x1, y1, x2, y2);
    if (!path) return;

    // Расширяем путь до указанной ширины
    for (const [x, y] of path) {
        for (let dw = -width; dw <= width; dw++) {
            for (let dh = -width; dh <= width; dh++) {
                const nx = x + dw;
                const ny = y + dh;
                if (
                    nx >= 0 && nx < grid.length &&
                    ny >= 0 && ny < grid[0].length &&
                    grid[nx][ny] === null
                ) {
                    grid[nx][ny] = "bridge";
                }
            }
        }
    }
}

/** Упрощенный A* (для примера) */
function findAStarPath(grid, startX, startY, targetX, targetY) {
    // Здесь должна быть реализация A* (можно использовать библиотеку или написать свою)
    // Для примера возвращаем прямую линию (как Брезенхем)
    const path = [];
    let x = startX, y = startY;
    while (x !== targetX || y !== targetY) {
        path.push([x, y]);
        if (x < targetX) x++;
        else if (x > targetX) x--;
        if (y < targetY) y++;
        else if (y > targetY) y--;
    }
    path.push([targetX, targetY]);
    return path;
}

function addSmallHoles(fieldDM) {
    const perlin = new PerlinNoise();
    for (let i = 0; i < fieldDM.length; i++) {
        for (let j = 0; j < fieldDM.length; j++) {
            if (fieldDM[i][j]) {
                noiseValue = perlin.noise2D(i * 0.1,j * 0.1,0.1,4,4,4);
                if (noiseValue <= 0.35) {
                    fieldDM[i][j] = null;
                }
            }
        }
    }
    return fieldDM;
}