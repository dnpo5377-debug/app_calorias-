// ============================================================
// SISTEMA DE CAPTURA DE FOTO DE ETIQUETA NUTRICIONAL
// ============================================================

let videoElement;
let canvasElement;
let capturaActiva = false;

/**
 * Iniciar captura de foto de etiqueta nutricional
 */
function iniciarCapturaEtiqueta() {
    console.log('📸 Iniciando captura de etiqueta...');
    
    const readerDiv = document.getElementById('reader');
    readerDiv.innerHTML = '';
    readerDiv.style.background = '#000';
    
    // Crear elementos de video y canvas
    videoElement = document.createElement('video');
    videoElement.style.width = '100%';
    videoElement.style.height = 'auto';
    videoElement.autoplay = true;
    videoElement.playsinline = true;
    
    canvasElement = document.createElement('canvas');
    canvasElement.style.display = 'none';
    
    readerDiv.appendChild(videoElement);
    readerDiv.appendChild(canvasElement);
    
    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
    })
    .then(stream => {
        videoElement.srcObject = stream;
        capturaActiva = true;
        
        // Crear botones de captura
        crearBotonesCapturaEtiqueta();
        console.log('✅ Cámara iniciada para captura de etiqueta');
    })
    .catch(error => {
        console.error('❌ Error al acceder a cámara:', error);
        alert('⚠️ No se pudo acceder a la cámara.\n\nPor favor, verifica los permisos.');
    });
}

/**
 * Crear botones para captura de etiqueta
 */
function crearBotonesCapturaEtiqueta() {
    const readerDiv = document.getElementById('reader');
    
    // Contenedor de botones
    const botonesDiv = document.createElement('div');
    botonesDiv.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 10px;
        justify-content: center;
    `;
    
    // Botón para capturar
    const btnCapturar = document.createElement('button');
    btnCapturar.innerHTML = '📷 Capturar Foto';
    btnCapturar.style.cssText = `
        background-color: #27ae60;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        flex: 1;
    `;
    btnCapturar.onclick = capturarFotoEtiqueta;
    
    // Botón para cancelar
    const btnCancelar = document.createElement('button');
    btnCancelar.innerHTML = '❌ Cancelar';
    btnCancelar.style.cssText = `
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        flex: 1;
    `;
    btnCancelar.onclick = cancelarCapturaEtiqueta;
    
    botonesDiv.appendChild(btnCapturar);
    botonesDiv.appendChild(btnCancelar);
    
    readerDiv.appendChild(botonesDiv);
}

/**
 * Capturar foto de la etiqueta
 */
async function capturarFotoEtiqueta() {
    if (!videoElement || !canvasElement) return;
    
    try {
        console.log('📸 Capturando foto...');
        
        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0);
        
        // Convertir a blob
        canvasElement.toBlob(async (blob) => {
            await procesarFotoEtiqueta(blob);
        }, 'image/jpeg', 0.95);
        
    } catch (error) {
        console.error('❌ Error capturando foto:', error);
        alert('⚠️ Error al capturar la foto');
    }
}

/**
 * Procesar foto capturada con OCR
 */
async function procesarFotoEtiqueta(fotoBlob) {
    try {
        console.log('🔄 Procesando foto con OCR...');
        
        // Mostrar loading
        mostrarLoading('Analizando etiqueta nutricional...');
        
        // Inicializar OCR si no está ya
        if (!ocrWorker) {
            await inicializarOCR();
        }
        
        // Procesar la imagen
        const datosNutricionales = await procesarImagenNutricional(fotoBlob);
        
        ocultarLoading();
        
        if (datosNutricionales && datosNutricionales.detectado) {
            // Mostrar datos para verificación
            mostrarVerificacionDatos(datosNutricionales);
        } else {
            alert('⚠️ No se pudieron detectar datos nutricionales.\n\nIntenta con una foto más clara de la etiqueta.');
        }
        
    } catch (error) {
        console.error('❌ Error procesando foto:', error);
        ocultarLoading();
        alert('⚠️ Error al procesar la foto');
    }
}

/**
 * Mostrar pantalla de verificación de datos
 */
function mostrarVerificacionDatos(datosDetectados) {
    const readerDiv = document.getElementById('reader');
    
    // Detener video
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    
    readerDiv.innerHTML = `
        
            📋 Verifica los datos detectados:
            
            
                <label>Calorías (por porción de ${datosDetectados.porcion}g):</label>
                <input>
            
            
            
                <label>Proteínas (g):
                <input>
            
            
            
                <label>Carbohidratos (g):
                <input>
            
            
            
                <label>Grasas (g):
                <input>
            
            
            
                <label>Tamaño de porción (g):
                <input>
            
            
            
                <label>Nombre del producto:
                <input>
            
            
            
                <label>Marca (opcional):
                <input>
            
            
            
                <button>
                    ✅ Confirmar y Usar
                </button>
                <button>
                    🔄 Recapturar
                
            
        
    `;
    
    capturaActiva = false;
}

/**
 * Confirmar datos del OCR y crear alimento
 */
function confirmarDatosOCR() {
    const nombre = document.getElementById('ocr-nombre').value.trim();
    const marca = document.getElementById('ocr-marca').value.trim() || 'No especificada';
    const calorias = parseFloat(document.getElementById('ocr-calorias').value) || 0;
    const proteinas = parseFloat(document.getElementById('ocr-proteinas').value) || 0;
    const carbohidratos = parseFloat(document.getElementById('ocr-carbohidratos').value) || 0;
    const grasas = parseFloat(document.getElementById('ocr-grasas').value) || 0;
    const porcion = parseFloat(document.getElementById('ocr-porcion').value) || 100;

    if (!nombre) {
        alert('⚠️ Por favor ingresa el nombre del producto');
        return;
    }

    if (calorias === 0) {
        alert('⚠️ Las calorías deben ser mayor a 0');
        return;
    }

    // Calcular valores por 100g
    const factorConversion = 100 / porcion;
    const caloriasPor100 = calorias * factorConversion;
    const proteinasPor100 = proteinas * factorConversion;
    const carbosPor100 = carbohidratos * factorConversion;
    const grasasPor100 = grasas * factorConversion;

    // Crear objeto de alimento
    const nuevoAlimento = {
        nombre: nombre,
        cal: Math.round(caloriasPor100 * 10) / 10,
        pro: Math.round(proteinasPor100 * 10) / 10,
        carb: Math.round(carbosPor100 * 10) / 10,
        grasa: Math.round(grasasPor100 * 10) / 10,
        marca: marca,
        origen: 'OCR', // Marcar que viene de foto
        fechaAgregado: new Date().toLocaleDateString('es-ES')
    };

    console.log('✅ Nuevo alimento creado:', nuevoAlimento);

    // Agregar a la base de datos
    agregarNuevoAlimentoABaseDatos(nuevoAlimento);

    // Usar este alimento inmediatamente
    alimentoSeleccionado = nuevoAlimento;
    document.getElementById('alimento-seleccionado-nombre').innerText = nuevoAlimento.nombre;
    document.getElementById('input-gramos').value = 100;
    
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.add('active');
    calcularMacrosDetalle();
    
    alert(`✅ ¡Alimento "${nuevoAlimento.nombre}" agregado a tu base de datos!`);
}

/**
 * Agregar nuevo alimento a la base de datos
 */
function agregarNuevoAlimentoABaseDatos(alimento) {
    // Verificar que no exista
    const existe = baseDeDatosAlimentos.find(a => 
        a.nombre.toLowerCase() === alimento.nombre.toLowerCase()
    );

    if (!existe) {
        baseDeDatosAlimentos.push(alimento);
        console.log(`✅ Alimento "${alimento.nombre}" agregado a la base de datos`);
        
        // Guardar en localStorage
        localStorage.setItem('alimentosCustom', JSON.stringify(
            baseDeDatosAlimentos.filter(a => a.origen === 'OCR')
        ));
    } else {
        console.log(`ℹ️ El alimento "${alimento.nombre}" ya existe en la base de datos`);
    }
}

/**
 * Cancelar captura de etiqueta
 */
function cancelarCapturaEtiqueta() {
    console.log('❌ Captura cancelada');
    
    // Detener video
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Limpiar reader
    const readerDiv = document.getElementById('reader');
    readerDiv.innerHTML = '';
    readerDiv.style.background = 'transparent';
    
    // Mostrar botones nuevamente
    const btnEscaner = document.getElementById('btn-escaner');
    const btnDetener = document.getElementById('btn-detener-escaner');
    if (btnEscaner) btnEscaner.style.display = 'block';
    if (btnDetener) btnDetener.style.display = 'none';
    
    capturaActiva = false;
}

/**
 * Mostrar indicador de loading
 */
function mostrarLoading(mensaje) {
    const readerDiv = document.getElementById('reader');
    readerDiv.innerHTML = `
        
            ⏳
            ${mensaje}
            Esto puede tardar unos segundos...
        
    `;
}

/**
 * Ocultar indicador de loading
 */
function ocultarLoading() {
    // Ya se reemplaza con otro contenido
}

/**
 * Cargar alimentos guardados desde localStorage
 */
function cargarAlimentosPersonalizados() {
    const alimentosGuardados = localStorage.getItem('alimentosCustom');
    if (alimentosGuardados) {
        const alimentos = JSON.parse(alimentosGuardados);
        baseDeDatosAlimentos.push(...alimentos);
        console.log(`✅ ${alimentos.length} alimentos personalizados cargados`);
    }
}
