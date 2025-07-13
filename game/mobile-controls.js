const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

let initialDistance = null;
let initialX = posX;
let initialY = posY;
let initialTouches = [];

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        // Запоминаем начальное расстояние между пальцами для зума
        initialDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        initialTouches = Array.from(e.touches);
    } else if (e.touches.length === 1) {
        // Запоминаем начальную позицию для перемещения
        initialX = posX;
        initialY = posY;
        initialTouches = Array.from(e.touches);
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    if (e.touches.length === 2 && initialDistance !== null) {
        // Обработка зума
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        
        const zoomFactor = currentDistance / initialDistance;
        const newZoom = currentZoom * zoomFactor;
        
        updateTransform(posX, posY, newZoom);
    } else if (e.touches.length === 1 && initialTouches.length === 1) {
        // Обработка перемещения
        const deltaX = e.touches[0].clientX - initialTouches[0].clientX;
        const deltaY = e.touches[0].clientY - initialTouches[0].clientY;
        
        updateTransform(initialX + deltaX, initialY + deltaY, currentZoom);
    }
}

function handleTouchEnd() {
    initialDistance = null;
    initialTouches = [];
}

function updateTransform(X, Y, zoom) {
    tableContainer.style.transform = `translate(${X}px, ${Y}px) scale(${zoom})`;
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    posX = X;
    posY = Y;
    currentZoom = zoom;
}

// Добавляем обработчики только для мобильных устройств
if (isMobile) {
    tableContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    tableContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    tableContainer.addEventListener('touchend', handleTouchEnd);
}