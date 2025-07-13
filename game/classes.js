class PerlinNoise {
    constructor() {
        this.gradients = {};
        this.memory = {};
        this.perlin_permutation = this.generatePermutation();
    }

    generatePermutation() {
        const p = new Array(256);
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }
        
        // Fisher-Yates shuffle
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        
        // Дублируем массив для упрощения вычислений
        return p.concat(p.slice());
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        // Упрощенная версия с 12 возможными градиентами
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y = 0, z = 0) {
        // Мемоизация для оптимизации
        const key = `${x},${y},${z}`;
        if (this.memory[key] !== undefined) {
            return this.memory[key];
        }

        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perlin_permutation[X] + Y;
        const AA = this.perlin_permutation[A] + Z;
        const AB = this.perlin_permutation[A + 1] + Z;
        const B = this.perlin_permutation[X + 1] + Y;
        const BA = this.perlin_permutation[B] + Z;
        const BB = this.perlin_permutation[B + 1] + Z;

        const gradAA = this.grad(this.perlin_permutation[AA], x, y, z);
        const gradBA = this.grad(this.perlin_permutation[BA], x-1, y, z);
        const gradAB = this.grad(this.perlin_permutation[AB], x, y-1, z);
        const gradBB = this.grad(this.perlin_permutation[BB], x-1, y-1, z);
        const gradAA1 = this.grad(this.perlin_permutation[AA+1], x, y, z-1);
        const gradBA1 = this.grad(this.perlin_permutation[BA+1], x-1, y, z-1);
        const gradAB1 = this.grad(this.perlin_permutation[AB+1], x, y-1, z-1);
        const gradBB1 = this.grad(this.perlin_permutation[BB+1], x-1, y-1, z-1);

        const lerp1 = this.lerp(
            this.lerp(gradAA, gradBA, u),
            this.lerp(gradAB, gradBB, u),
            v
        );

        const lerp2 = this.lerp(
            this.lerp(gradAA1, gradBA1, u),
            this.lerp(gradAB1, gradBB1, u),
            v
        );

        const result = (this.lerp(lerp1, lerp2, w) + 1) / 2; // Нормализация к [0,1]

        this.memory[key] = result;
        return result;
    }

    // Генерация 2D шума с возможностью масштабирования
    noise2D(x, y, scale = 1, octaves = 1, persistence = 0.5, lacunarity = 2.0) {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }

    
    /**
     * Генерирует краевой шум и накладывает его на входную карту
     * @param {number} x Координата x
     * @param {number} y Координата y
     * @param {number} width Ширина области
     * @param {number} height Высота области
     * @param {number} edgeSize Размер краевой области (в % от ширины/высоты)
     * @param {number} baseNoise Значение базового шума (0-1)
     * @param {number} scale Масштаб для noise2D
     * @returns {number} Результирующее значение шума
     */
    generateEdgeNoise(x, y, width, height, edgeSize, baseNoise, scale = 1) {
        // Нормализуем координаты для определения положения относительно краев
        const edgeX = Math.min(x / width, 1 - x / width) * (1 / edgeSize);
        const edgeY = Math.min(y / height, 1 - y / height) * (1 / edgeSize);
        
        // Определяем коэффициент краевого эффекта (0-1)
        const edgeFactor = Math.min(1, Math.min(edgeX, edgeY));
        
        // Генерируем шум для краев
        const edgeNoise = this.noise2D(x, y, scale);
        
        // Комбинируем: чем ближе к краю, тем больше влияет edgeNoise
        const result = this.lerp(baseNoise, edgeNoise, 1 - edgeFactor);
        
        // Применяем пороговое значение (0.4 как в условии)
        return edgeFactor < 1 ? Math.min(result, 0.4 * (1 - edgeFactor) + baseNoise * edgeFactor) : baseNoise;
    }
}




// Вспомогательная функция линейной интерполяции
function lerp(a, b, t) {
    return a + (b - a) * t;
}



class Cell {
    constructor() {
        this.x;
        this.y;
        this.type;
        this.color;
        this.lvl;
        this.special = false;
        this.ownerID;
        this.fieldID;
    }

    getOwned(player, lvl, enemyPlayer = null) {
        this.ownerID = player.id;
        if (lvl > 0) {
            this.lvl = lvl;
        } else {
            this.lvl = 1;
        }
        this.color = player.color;
        this.fieldID = `${this.x}_${this.y}`;
        player.cells.push(this);
        if (enemyPlayer) {
            enemyPlayer.cells = remove(enemyPlayer.cells, this);
        }
    }

    getNeighbors(fieldDM, length, showAllNeighbors = false) {
        let neighbors = [];
        if (this.y - 1 >= 0) {
            if (fieldDM[this.x][this.y - 1]) {
                neighbors.push(fieldDM[this.x][this.y - 1]);
            }
        }
        if (this.y + 1 <= length - 1) {
            if (fieldDM[this.x][this.y + 1]) {
                neighbors.push(fieldDM[this.x][this.y + 1]);
            }
            
        }
        if (this.x + 1 <= length - 1) {
            if (fieldDM[this.x + 1][this.y]) {
                neighbors.push(fieldDM[this.x + 1][this.y]);
            }
            
        }
        if (this.x - 1 >= 0) {
            if (fieldDM[this.x - 1][this.y]) {
                neighbors.push(fieldDM[this.x - 1][this.y]);
            }
            
        }
        if (showAllNeighbors) {
                    if (this.y - 1 >= 0 && this.x - 1 >= 0) {
                        if (fieldDM[this.x - 1][this.y - 1]) {
                            neighbors.push(fieldDM[this.x - 1][this.y - 1]);
                        }
                    }
                    if (this.y + 1 <= length - 1 && this.x + 1 <= length - 1) {
                        if (fieldDM[this.x + 1][this.y + 1]) {
                            neighbors.push(fieldDM[this.x + 1][this.y + 1]);
                        }
                        
                    }
                    if (this.x + 1 <= length - 1 && this.y - 1 >= 0) {
                        if (fieldDM[this.x + 1][this.y - 1]) {
                            neighbors.push(fieldDM[this.x + 1][this.y - 1]);
                        }
                        
                    }
                    if (this.x - 1 >= 0 && this.y + 1 <= length - 1) {
                        if (fieldDM[this.x - 1][this.y + 1]) {
                            neighbors.push(fieldDM[this.x - 1][this.y + 1]);
                        }
                        
                    }
        }
        return neighbors;
    }

    getMaxSizeByType() {
        if (this.type === 0) {
            return 8;
        } else if (this.type === 1) {
            return 12;
        } else if (this.type === 2) {
            return 18;
        }
    }
}


class Player {
    constructor() {
        this.name;
        this.id;
        this.turn;
        this.color;
        this.power;
        this.upgradePoints;
        this.cellsToUpdate = [];
        this.cells = [];
        this.key;
    }

    calculatePower() {
        let power = Math.round(this.cells.length * 0.7);
        this.cells.forEach(cell => {
            if (cell.lvl > 3) {
                power += 1;
            }
        });
        return power;
    }
    calculateUpgradePoints() {
        let points = this.power + 1;
        return points;
    }
}
function remove(arr, element) {
  return arr.filter(item => item !== element);
}

function excludeObjects(twoDimArray, oneDimArray, key = 'id') {
    // Создаем новый массив, чтобы не изменять исходный
    const result = [];

    // Перебираем каждый подмассив в двумерном массиве
    for (let i = 0; i < twoDimArray.length; i++) {
        const sublist = twoDimArray[i];
        const newSublist = [];

        // Перебираем каждый объект в подмассиве
        for (let j = 0; j < sublist.length; j++) {
            const item = sublist[j];
            let shouldExclude = false;

            // Проверяем, есть ли текущий объект в массиве на исключение
            for (let k = 0; k < oneDimArray.length; k++) {
                const excludedObj = oneDimArray[k];
                if (item && excludedObj) {
                    // Сравниваем объекты по указанному полю
                    if (excludedObj[key] === item[key]) {
                        shouldExclude = true;
                        break; // Прекращаем проверку, если нашли совпадение
                    }
                }
            }
            // Если объект не найден в массиве на исключение, добавляем его в новый подмассив
            if (!shouldExclude) {
                newSublist.push(item);
            }
        }

        // Добавляем отфильтрованный подмассив в результат
        result.push(newSublist);
    }

    return result;
}