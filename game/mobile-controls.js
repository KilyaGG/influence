// Проверка на мобильное устройство
function isMobile() {
    return (('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0) || 
            (navigator.msMaxTouchPoints > 0));
}

// Если пользователь на мобильном — включаем touch-управление
if (isMobile()) {
    initMobileControls();
} else {
    console.log("Desktop");
}

// ===== МОБИЛЬНОЕ УПРАВЛЕНИЕ (TOUCH) =====
function initMobileControls() {
    const MIN_ZOOM = 0.4;
    const MAX_ZOOM = 3;
    let startTouchX = 0, startTouchY = 0;
    let initialDistance = null;
    let initialZoom = null;
    console.log("Mobile");

    // Обновление трансформации
    function updateTransformMobile(X, Y, zoom) {
        zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
        tableContainer.style.transform = `translate(${X}px, ${Y}px) scale(${zoom})`;
        zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
        posX = X;
        posY = Y;
        currentZoom = zoom;
    }

    // Перемещение (один палец)
    tableContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            startTouchX = e.touches[0].clientX - posX;
            startTouchY = e.touches[0].clientY - posY;
        } else if (e.touches.length === 2) {
            e.preventDefault();
            initialDistance = getDistance(e.touches[0], e.touches[1]);
            initialZoom = currentZoom;
        }
    });

    tableContainer.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
            e.preventDefault();
            const newX = e.touches[0].clientX - startTouchX;
            const newY = e.touches[0].clientY - startTouchY;
            updateTransformMobile(newX, newY, currentZoom);
        } else if (e.touches.length === 2) {
            e.preventDefault();
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            if (initialDistance !== null) {
                const newZoom = (currentDistance / initialDistance) * initialZoom;
                updateTransformMobile(posX, posY, newZoom);
            }
        }
    });

    tableContainer.addEventListener('touchend', () => {
        isDragging = false;
        initialDistance = null;
    });

    // Вспомогательная функция
    function getDistance(touch1, touch2) {
        return Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
    }

    // Запрещаем стандартные жесты браузера
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
}