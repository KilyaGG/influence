const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

let initialDistance = null;
let initialZoom = null;
let initialPosX = 0, initialPosY = 0;

// Функция для обновления трансформации
function updateTransformMobile(X, Y, zoom, focalPoint = null) {
    if (!focalPoint) {
        const { innerWidth, innerHeight } = window;
        focalPoint = { x: innerWidth / 2, y: innerHeight / 2 };
    }

    const scaleFactor = zoom / currentZoom;
    const newX = focalPoint.x - (focalPoint.x - posX) * scaleFactor;
    const newY = focalPoint.y - (focalPoint.y - posY) * scaleFactor;

    tableContainer.style.transform = `translate(${newX}px, ${newY}px) scale(${zoom})`;
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    
    posX = newX;
    posY = newY;
    const MIN_ZOOM = 0.4, MAX_ZOOM = 3;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    currentZoom = zoom;
}
if (isMobile) {
    // Обработчики для pinch-to-zoom
window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault(); // Предотвращаем стандартное поведение (например, масштабирование страницы)
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        initialZoom = currentZoom;
        initialPosX = posX;
        initialPosY = posY;
    }
});

window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (initialDistance !== null) {
            const newZoom = (currentDistance / initialDistance) * initialZoom;
            
            // Ограничиваем масштаб (например, от 0.5 до 3)
            const clampedZoom = Math.max(0.5, Math.min(3, newZoom));
            
            // Точка масштабирования — середина между двумя пальцами
            const focalPoint = {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            };
            
            updateTransformMobile(initialPosX, initialPosY, clampedZoom, focalPoint);
        }
    }
});

window.addEventListener('touchend', () => {
    initialDistance = null; // Сброс при завершении жеста
});
}
