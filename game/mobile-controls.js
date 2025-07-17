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
    // Запрещаем стандартные жесты браузера
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
}

function setupPinchZoom(tableContainer) {
    let initialDistance = 0;
    let currentScale = 1;

    tableContainer.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            // Вычисляем начальное расстояние между двумя пальцами
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    });

    tableContainer.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            e.preventDefault(); // Предотвращаем стандартное поведение (например, прокрутку страницы)
            
            // Вычисляем текущее расстояние между пальцами
            const currentDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            if (initialDistance > 0) {
                // Вычисляем коэффициент масштабирования
                const scale = currentDistance / initialDistance;
                
                // Применяем масштаб к элементу
                currentScale = Math.max(0.5, Math.min(scale * currentScale, 3)); // Ограничиваем масштаб от 0.5 до 3
                tableContainer.style.transform = `scale(${currentScale})`;
                tableContainer.style.transformOrigin = '0 0'; // Точка трансформации в верхнем левом углу
            }
        }
    });

    tableContainer.addEventListener('touchend', function() {
        initialDistance = 0; // Сбрасываем начальное расстояние при окончании жеста
    });
}
setupPinchZoom(tableContainer);