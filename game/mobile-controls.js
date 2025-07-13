let initialDistance = null;
let initialZoom = null;
let initialPosX = 0, initialPosY = 0;
let startTouchX = 0, startTouchY = 0;

// Функция для обновления трансформации
function updateTransformMobile(X, Y, zoom, focalPoint = null) {
    if (!focalPoint) {
        const { innerWidth, innerHeight } = window;
        focalPoint = { x: innerWidth / 2, y: innerHeight / 2 };
    }

    const scaleFactor = zoom / currentZoom;
    const newX = focalPoint.x - (focalPoint.x - posX) * scaleFactor;
    const newY = focalPoint.y - (focalPoint.y - posY) * scaleFactor;

    // Ограничиваем, чтобы таблица не уходила за границы
    const maxX = (innerWidth * (zoom - 1)) / 2;
    const maxY = (innerHeight * (zoom - 1)) / 2;
    const clampedX = Math.min(maxX, Math.max(-maxX, newX));
    const clampedY = Math.min(maxY, Math.max(-maxY, newY));

    tableContainer.style.transform = `translate(${clampedX}px, ${clampedY}px) scale(${zoom})`;
    zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    
    posX = clampedX;
    posY = clampedY;
    currentZoom = zoom;
}

// ===== ПЕРЕМЕЩЕНИЕ ОДНИМ ПАЛЬЦЕМ (DRAG) =====
window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        startTouchX = e.touches[0].clientX - posX;
        startTouchY = e.touches[0].clientY - posY;
    } else if (e.touches.length === 2) {
        // Обработка pinch-to-zoom (как раньше)
        e.preventDefault();
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
    if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        const newX = e.touches[0].clientX - startTouchX;
        const newY = e.touches[0].clientY - startTouchY;
        updateTransformMobile(newX, newY, currentZoom);
    } else if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        if (initialDistance !== null) {
            const newZoom = (currentDistance / initialDistance) * initialZoom;
            const clampedZoom = Math.max(0.5, Math.min(3, newZoom));
            
            const focalPoint = {
                x: (touch1.clientX + touch2.clientX) / 2,
                y: (touch1.clientY + touch2.clientY) / 2
            };
            
            updateTransformMobile(initialPosX, initialPosY, clampedZoom, focalPoint);
        }
    }
});

window.addEventListener('touchend', () => {
    isDragging = false;
    initialDistance = null;
});

// ===== ПРЕДОТВРАЩАЕМ СТАНДАРТНОЕ ПОВЕДЕНИЕ БРАУЗЕРА =====
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());