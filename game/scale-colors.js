function updateScale(playersData) {
    const scaleElement = document.getElementById('colorScale');
    let data = [];
    playersData.forEach(player => {
        if (player) {
            pData = {
            "size": player.cells.length,
            "color": player.color
        };
        data.push(pData);
        }
    });
    try {
        scaleElement.innerHTML = '';
        
        // Считаем общий размер для процентного соотношения
        const totalSize = data.reduce((sum, item) => sum + (item.size || 0), 0);
        
        // Создаем элементы шкалы
        data.forEach(item => {
            const percentage = (item.size / totalSize) * 100;
            const itemElement = document.createElement('div');
            itemElement.className = 'scale-item';
            itemElement.style.backgroundColor = item.color;
            itemElement.style.width = `${percentage}%`;
            itemElement.title = `Размер: ${item.size} (${percentage.toFixed(1)}%)`;
            
            scaleElement.appendChild(itemElement);
        });
        
    } catch (error) {
        alert(`Ошибка при обработке данных: ${error.message}`);
        console.error(error);
    }
}