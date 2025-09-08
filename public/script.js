// Variables globales
let currentShortCode = null;
let editingShortCode = null;

// Elementos del DOM
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const customCodeInput = document.getElementById('customCodeInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultContainer = document.getElementById('resultContainer');
const statsContainer = document.getElementById('statsContainer');
const loadingContainer = document.getElementById('loadingContainer');
const errorContainer = document.getElementById('errorContainer');
const originalUrlSpan = document.getElementById('originalUrl');
const shortUrlSpan = document.getElementById('shortUrl');
const errorMessage = document.getElementById('errorMessage');

// Elementos de pestañas
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const createTab = document.getElementById('createTab');
const historyTab = document.getElementById('historyTab');
const historyContent = document.getElementById('historyContent');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');

// Elementos de modales
const editUrlModal = document.getElementById('editUrlModal');
const editCodeModal = document.getElementById('editCodeModal');
const detailedStatsModal = document.getElementById('detailedStatsModal');
const editUrlForm = document.getElementById('editUrlForm');
const editCodeForm = document.getElementById('editCodeForm');
const editUrlInput = document.getElementById('editUrlInput');
const editCodeInput = document.getElementById('editCodeInput');

// Elementos del modal de estadísticas
const statsLoading = document.getElementById('statsLoading');
const statsContent = document.getElementById('statsContent');
const statsCreatedAt = document.getElementById('statsCreatedAt');
const statsTotalClicks = document.getElementById('statsTotalClicks');
const countryStats = document.getElementById('countryStats');
const deviceStats = document.getElementById('deviceStats');

// Event listeners
urlForm.addEventListener('submit', handleUrlSubmit);
refreshHistoryBtn.addEventListener('click', loadHistory);
editUrlForm.addEventListener('submit', handleEditUrl);
editCodeForm.addEventListener('submit', handleEditCode);

// Event listeners para pestañas
tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
});

// Event listener para validación de código personalizado
customCodeInput.addEventListener('input', validateCustomCode);
editCodeInput.addEventListener('input', validateEditCustomCode);

// Función principal para manejar el envío del formulario
async function handleUrlSubmit(e) {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    const customCode = customCodeInput.value.trim();
    
    if (!url) {
        showError('Por favor, ingresa una URL válida');
        return;
    }
    
    if (customCode && !isValidCustomCode(customCode)) {
        showError('Código personalizado inválido. Solo se permiten letras, números y guiones (3-20 caracteres).');
        return;
    }
    
    showLoading();
    hideError();
    hideResult();
    hideStats();
    
    try {
        const requestBody = { url: url };
        if (customCode) {
            requestBody.customCode = customCode;
        }
        
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al acortar la URL');
        }
        
        // Mostrar resultado
        showResult(data);
        currentShortCode = data.shortCode;
        
        // Limpiar formulario
        customCodeInput.value = '';
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Función para mostrar el resultado
function showResult(data) {
    originalUrlSpan.textContent = data.originalUrl;
    shortUrlSpan.textContent = data.shortUrl;
    resultContainer.classList.remove('hidden');
}

// Función para obtener estadísticas
async function getStats() {
    if (!currentShortCode) {
        showError('No hay código de URL disponible');
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        const response = await fetch(`/api/stats/${currentShortCode}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener estadísticas');
        }
        
        // Mostrar estadísticas
        document.getElementById('clickCount').textContent = data.clicks;
        document.getElementById('createdDate').textContent = formatDate(data.createdAt);
        statsContainer.classList.remove('hidden');
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Función para copiar al portapapeles
async function copyToClipboard(textOrElementId) {
    let text;
    
    // Si es un string directo, usarlo; si es un ID de elemento, obtener el texto
    if (typeof textOrElementId === 'string' && textOrElementId.startsWith('http')) {
        text = textOrElementId;
    } else {
        const element = document.getElementById(textOrElementId);
        text = element ? element.textContent : textOrElementId;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showCopySuccess(textOrElementId);
    } catch (err) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopySuccess(textOrElementId);
    }
}

// Función para mostrar éxito al copiar
function showCopySuccess(textOrElementId) {
    // Buscar el botón que fue clickeado
    const clickedButton = event ? event.target.closest('button') : null;
    
    if (clickedButton) {
        const originalIcon = clickedButton.innerHTML;
        
        clickedButton.innerHTML = '<i class="fas fa-check"></i>';
        clickedButton.style.background = '#28a745';
        
        setTimeout(() => {
            clickedButton.innerHTML = originalIcon;
            clickedButton.style.background = '';
        }, 2000);
    }
}

// Función para acortar otra URL
function shortenAnother() {
    urlInput.value = '';
    customCodeInput.value = '';
    urlInput.focus();
    hideResult();
    hideStats();
    hideError();
    currentShortCode = null;
}

// Función para cambiar entre pestañas
function switchTab(tabName) {
    // Remover clase active de todos los botones y contenidos
    tabButtons.forEach(button => button.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Agregar clase active al botón y contenido seleccionado
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Si se cambia a historial, cargar el historial
    if (tabName === 'history') {
        loadHistory();
    }
}

// Función para validar código personalizado
function validateCustomCode() {
    const code = customCodeInput.value;
    const isValid = isValidCustomCode(code);
    
    if (code && !isValid) {
        customCodeInput.style.borderColor = '#dc3545';
        customCodeInput.style.backgroundColor = '#fff5f5';
    } else {
        customCodeInput.style.borderColor = '#e1e5e9';
        customCodeInput.style.backgroundColor = 'transparent';
    }
}

// Función para validar código personalizado
function isValidCustomCode(code) {
    const regex = /^[a-zA-Z0-9-]{3,20}$/;
    return regex.test(code);
}

// Función para cargar historial
async function loadHistory() {
    showHistoryLoading();
    
    try {
        const response = await fetch('/api/history');
        const history = await response.json();
        
        if (!response.ok) {
            throw new Error('Error al cargar el historial');
        }
        
        displayHistory(history);
        
    } catch (error) {
        showHistoryError(error.message);
    }
}

// Función para mostrar loading del historial
function showHistoryLoading() {
    historyContent.innerHTML = `
        <div class="loading-history">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando historial...</p>
        </div>
    `;
}

// Función para mostrar error del historial
function showHistoryError(message) {
    historyContent.innerHTML = `
        <div class="error-history">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button class="btn-secondary" onclick="loadHistory()">
                <i class="fas fa-retry"></i>
                Reintentar
            </button>
        </div>
    `;
}

// Función para mostrar historial
function displayHistory(history) {
    if (history.length === 0) {
        historyContent.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <h3>No hay URLs creadas</h3>
                <p>Comienza creando tu primera URL acortada</p>
            </div>
        `;
        return;
    }
    
    const historyHTML = history.map(item => `
        <div class="history-item">
            <div class="history-item-header">
                <div class="history-item-title">
                    <i class="fas fa-link"></i>
                    ${item.shortCode}
                </div>
                <div class="history-item-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(item.createdAt)}
                </div>
            </div>
            
            <div class="history-item-urls">
                <div class="history-url">
                    <span class="history-url-label">Original:</span>
                    <span class="history-url-text">${item.originalUrl}</span>
                    <button class="history-url-copy" onclick="copyToClipboard('${item.originalUrl}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
                
                <div class="history-url">
                    <span class="history-url-label">Acortada:</span>
                    <span class="history-url-text">${item.shortUrl}</span>
                    <button class="history-url-copy" onclick="copyToClipboard('${item.shortUrl}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            
            <div class="history-item-stats">
                <div class="history-clicks">
                    <i class="fas fa-mouse-pointer"></i>
                    <span>${item.clicks} clicks</span>
                </div>
                
                <div class="history-actions">
                    <button class="history-action-btn primary" onclick="viewStats('${item.shortCode}')">
                        <i class="fas fa-chart-bar"></i>
                        Ver Stats
                    </button>
                    <button class="history-action-btn edit" onclick="editUrl('${item.shortCode}', '${item.originalUrl}')">
                        <i class="fas fa-edit"></i>
                        Editar URL
                    </button>
                    <button class="history-action-btn edit" onclick="editCode('${item.shortCode}')">
                        <i class="fas fa-tag"></i>
                        Editar Código
                    </button>
                    <button class="history-action-btn" onclick="copyToClipboard('${item.shortUrl}')">
                        <i class="fas fa-copy"></i>
                        Copiar
                    </button>
                    <button class="history-action-btn delete" onclick="deleteUrl('${item.shortCode}')">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    historyContent.innerHTML = `<div class="history-list">${historyHTML}</div>`;
}

// Función para ver estadísticas desde el historial
function viewStats(shortCode) {
    showDetailedStats(shortCode);
}

// Funciones para editar URLs
function editUrl(shortCode, currentUrl) {
    editingShortCode = shortCode;
    editUrlInput.value = currentUrl;
    editUrlModal.classList.remove('hidden');
    editUrlInput.focus();
}

function editCode(shortCode) {
    editingShortCode = shortCode;
    editCodeInput.value = shortCode;
    editCodeModal.classList.remove('hidden');
    editCodeInput.focus();
}

// Función para validar código personalizado en edición
function validateEditCustomCode() {
    const code = editCodeInput.value;
    const isValid = isValidCustomCode(code);
    
    if (code && !isValid) {
        editCodeInput.style.borderColor = '#dc3545';
        editCodeInput.style.backgroundColor = '#fff5f5';
    } else {
        editCodeInput.style.borderColor = '#e1e5e9';
        editCodeInput.style.backgroundColor = 'transparent';
    }
}

// Función para manejar la edición de URL
async function handleEditUrl(e) {
    e.preventDefault();
    
    const newUrl = editUrlInput.value.trim();
    
    if (!newUrl) {
        showError('Por favor, ingresa una URL válida');
        return;
    }
    
    if (!isValidUrl(newUrl)) {
        showError('URL inválida');
        return;
    }
    
    try {
        const response = await fetch(`/api/edit-url/${editingShortCode}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newUrl: newUrl })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar la URL');
        }
        
        // Cerrar modal y recargar historial
        closeEditUrlModal();
        loadHistory();
        showSuccess('URL actualizada correctamente');
        
    } catch (error) {
        showError(error.message);
    }
}

// Función para manejar la edición de código
async function handleEditCode(e) {
    e.preventDefault();
    
    const newCode = editCodeInput.value.trim();
    
    if (!newCode) {
        showError('Por favor, ingresa un código válido');
        return;
    }
    
    if (!isValidCustomCode(newCode)) {
        showError('Código personalizado inválido. Solo se permiten letras, números y guiones (3-20 caracteres).');
        return;
    }
    
    try {
        const response = await fetch(`/api/edit-code/${editingShortCode}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newCode: newCode })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar el código');
        }
        
        // Cerrar modal y recargar historial
        closeEditCodeModal();
        loadHistory();
        showSuccess('Código actualizado correctamente');
        
    } catch (error) {
        showError(error.message);
    }
}

// Funciones para cerrar modales
function closeEditUrlModal() {
    editUrlModal.classList.add('hidden');
    editUrlInput.value = '';
    editingShortCode = null;
}

function closeEditCodeModal() {
    editCodeModal.classList.add('hidden');
    editCodeInput.value = '';
    editingShortCode = null;
}

// Función para mostrar mensaje de éxito
function showSuccess(message) {
    // Crear un mensaje de éxito temporal
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Mostrar con animación
    setTimeout(() => {
        successDiv.classList.add('show');
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 300);
    }, 3000);
}

// Funciones para estadísticas detalladas
async function showDetailedStats(shortCode) {
    detailedStatsModal.classList.remove('hidden');
    statsLoading.classList.remove('hidden');
    statsContent.classList.add('hidden');
    
    try {
        const response = await fetch(`/api/detailed-stats/${shortCode}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar estadísticas');
        }
        
        displayDetailedStats(data);
        
    } catch (error) {
        showError(error.message);
        closeDetailedStatsModal();
    }
}

function displayDetailedStats(data) {
    // Información básica
    statsCreatedAt.textContent = formatDate(data.urlInfo.createdAt);
    statsTotalClicks.textContent = data.urlInfo.totalClicks;
    
    // Mostrar contenido
    statsLoading.classList.add('hidden');
    statsContent.classList.remove('hidden');
}


function closeDetailedStatsModal() {
    detailedStatsModal.classList.add('hidden');
    statsLoading.classList.remove('hidden');
    statsContent.classList.add('hidden');
}

// Función para ocultar estadísticas
function hideStats() {
    statsContainer.classList.add('hidden');
}

// Funciones para mostrar/ocultar elementos
function showLoading() {
    loadingContainer.classList.remove('hidden');
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Acortando...';
}

function hideLoading() {
    loadingContainer.classList.add('hidden');
    shortenBtn.disabled = false;
    shortenBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Acortar';
}

function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
}

function hideError() {
    errorContainer.classList.add('hidden');
}

function hideResult() {
    resultContainer.classList.add('hidden');
}

// Función para formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para validar URL en tiempo real
urlInput.addEventListener('input', function() {
    const url = this.value.trim();
    const isValid = isValidUrl(url);
    
    if (url && !isValid) {
        this.style.borderColor = '#dc3545';
    } else {
        this.style.borderColor = '#e1e5e9';
    }
});

// Función para validar URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        // Intentar con https:// si no tiene protocolo
        try {
            new URL('https://' + string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// Efectos visuales adicionales
document.addEventListener('DOMContentLoaded', function() {
    // Animación de entrada para el formulario
    const formContainer = document.querySelector('.url-form-container');
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        formContainer.style.transition = 'all 0.6s ease';
        formContainer.style.opacity = '1';
        formContainer.style.transform = 'translateY(0)';
    }, 100);
    
    // Focus automático en el input
    urlInput.focus();
});

// Función para eliminar URL
async function deleteUrl(shortCode) {
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que quieres eliminar esta URL? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/delete/${shortCode}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar URL');
        }
        
        // Mostrar mensaje de éxito
        showSuccess('URL eliminada correctamente');
        
        // Actualizar el historial
        loadHistory();
        
    } catch (error) {
        showError(error.message);
    }
}

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error:', e.error);
    showError('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
});

// Función para manejar errores de red
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejection:', e.reason);
    showError('Error de conexión. Verifica tu conexión a internet.');
});
