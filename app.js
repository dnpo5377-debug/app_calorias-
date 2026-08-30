// ============================================================
// BASE DE DATOS INICIAL DE ALIMENTOS (valores por cada 100g)
// ============================================================
const baseDeDatosAlimentos = [
    { nombre: "Pechuga de Pollo", cal: 165, pro: 31, carb: 0, grasa: 3.6 },
    { nombre: "Arroz Blanco Cocido", cal: 130, pro: 2.7, carb: 28, grasa: 0.3 },
    { nombre: "Avena", cal: 389, pro: 16.9, carb: 66, grasa: 6.9 },
    { nombre: "Huevo Entero", cal: 155, pro: 13, carb: 1.1, grasa: 11 },
    { nombre: "Plátano", cal: 89, pro: 1.1, carb: 23, grasa: 0.3 },
    { nombre: "Carne Molida 5% Grasa", cal: 215, pro: 26, carb: 0, grasa: 12 },
    { nombre: "Palta / Aguacate", cal: 160, pro: 2, carb: 8.5, grasa: 15 },
    { nombre: "Pan Hallulla / Marraqueta", cal: 280, pro: 8, carb: 55, grasa: 3 },
    { nombre: "Leche Desnatada", cal: 35, pro: 3.4, carb: 4.8, grasa: 0.1 },
    { nombre: "Brócoli Cocido", cal: 34, pro: 2.8, carb: 7, grasa: 0.4 },
    { nombre: "Salmón Cocido", cal: 206, pro: 22, carb: 0, grasa: 13 },
    { nombre: "Papa Cocida", cal: 77, pro: 1.7, carb: 17, grasa: 0.1 },
    { nombre: "Manzana", cal: 52, pro: 0.3, carb: 14, grasa: 0.2 },
    { nombre: "Naranja", cal: 47, pro: 0.9, carb: 12, grasa: 0.1 },
    { nombre: "Tomate", cal: 18, pro: 0.9, carb: 3.9, grasa: 0.2 },
    { nombre: "Lechuga", cal: 15, pro: 1.2, carb: 2.9, grasa: 0.2 },
    { nombre: "Atún en Lata", cal: 132, pro: 29, carb: 0, grasa: 1 },
    { nombre: "Queso Cheddar", cal: 403, pro: 23, carb: 3.3, grasa: 33 },
    { nombre: "Yogur Natural", cal: 59, pro: 10, carb: 3.6, grasa: 0.4 },
    { nombre: "Almendras", cal: 579, pro: 21, carb: 22, grasa: 50 }
];

// ============================================================
// VARIABLES GLOBALES DEL DÍA
// ============================================================
let totalesDia = {
    calorias: 0,
    proteinas: 0,
    carbs: 0,
    grasas: 0
};

let objetivosDiarios = {
    calorias: 2000,
    proteinas: 150,
    carbs: 200,
    grasas: 65
};

let caloriasComidas = {
    Desayuno: 0,
    Almuerzo: 0,
    Cena: 0,
    Snacks: 0
};

let historialAlimentos = [];
let comidaActual = "";
let alimentoSeleccionado = null;

// Variables del escáner
let htmlQrcodeScanner;
let escánerActivo = false;

// Variables de OCR
let ocrWorker;

// ============================================================
// FUNCIONES DE ALMACENAMIENTO EN LOCALSTORAGE
// ============================================================

function guardarDatos() {
    localStorage.setItem('totalesDia', JSON.stringify(totalesDia));
    localStorage.setItem('caloriasComidas', JSON.stringify(caloriasComidas));
    localStorage.setItem('historialAlimentos', JSON.stringify(historialAlimentos));
    localStorage.setItem('fechaActual', new Date().toDateString());
    console.log('✅ Datos guardados correctamente');
}

function cargarDatos() {
    const fechaGuardada = localStorage.getItem('fechaActual');
    const fechaActual = new Date().toDateString();
    
    if (fechaGuardada !== fechaActual) {
        console.log('📅 Nuevo día detectado - Limpiando datos anteriores');
        limpiarDia();
        return;
    }
    
    const totales = localStorage.getItem('totalesDia');
    const comidas = localStorage.getItem('caloriasComidas');
    const historial = localStorage.getItem('historialAlimentos');
    
    if (totales) totalesDia = JSON.parse(totales);
    if (comidas) caloriasComidas = JSON.parse(comidas);
    if (historial) historialAlimentos = JSON.parse(historial);
    
    console.log('📂 Datos cargados desde localStorage');
    actualizarPantallaResumen();
}

function limpiarDia() {
    totalesDia = { calorias: 0, proteinas: 0, carbs: 0, grasas: 0 };
    caloriasComidas = { Desayuno: 0, Almuerzo: 0, Cena: 0, Snacks: 0 };
    historialAlimentos = [];
    localStorage.setItem('fechaActual', new Date().toDateString());
    guardarDatos();
    actualizarPantallaResumen();
    console.log('🗑️ Día limpiado correctamente');
}

function mostrarHistorial() {
    if (historialAlimentos.length === 0) {
        alert('📭 No hay alimentos registrados aún');
        return;
    }
    
    let mensaje = '📋 HISTORIAL DEL DÍA:\n\n';
    
    historialAlimentos.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre}\n`;
        mensaje += `   Comida: ${item.comida} | ${item.gramos}g\n`;
        mensaje += `   Calorías: ${item.calorias} kcal\n\n`;
    });
    
    alert(mensaje);
}

function cargarAlimentosPersonalizados() {
    const alimentosGuardados = localStorage.getItem('alimentosCustom');
    if (alimentosGuardados) {
        const alimentos = JSON.parse(alimentosGuardados);
        baseDeDatosAlimentos.push(...alimentos);
        console.log(`✅ ${alimentos.length} alimentos personalizados cargados`);
    }
}

// ============================================================
// FUNCIONES DE NAVEGACIÓN ENTRE PANTALLAS
// ============================================================

function abrirBuscador(tipoComida) {
    comidaActual = tipoComida;
    document.getElementById('titulo-comida').innerText = `Agregar a ${tipoComida}`;
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('search-screen').classList.add('active');
    document.getElementById('input-buscar').value = '';
    
    if (escánerActivo) {
        detenerEscaner();
    }
    
    const readerDiv = document.getElementById('reader');
    if (readerDiv) readerDiv.innerHTML = '';
    
    mostrarListaAlimentos(baseDeDatosAlimentos);
}

function volverPrincipal() {
    if (escánerActivo) {
        detenerEscaner();
    }
    cancelarCapturaEtiqueta();
    
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
}

function volverBuscador() {
    if (escánerActivo) {
        detenerEscaner();
    }
    cancelarCapturaEtiqueta();
    
    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('search-screen').classList.add('active');
}

// ============================================================
// FUNCIONES DEL BUSCADOR Y FILTRADO
// ============================================================

function mostrarListaAlimentos(lista) {
    const contenedor = document.getElementById('lista-alimentos');
    contenedor.innerHTML = '';
    
    if (lista.length === 0) {
        contenedor.innerHTML = '❌ No se encontró el alimento';
        return;
    }

    lista.forEach((alimento) => {
        const item = document.createElement('div');
        item.className = 'food-item';
        item.style.padding = "12px";
        item.style.borderBottom = "1px solid #eee";
        item.style.cursor = "pointer";
        item.style.transition = "background 0.2s";
        item.innerHTML = `
            🍗 ${alimento.nombre} 
            
            <small>
                ${alimento.cal} kcal | P: ${alimento.pro}g | C: ${alimento.carb}g | G: ${alimento.grasa}g (x100g)
            </small>
        `;
        
        item.onmouseover = () => item.style.background = '#f1f2f6';
        item.onmouseout = () => item.style.background = 'transparent';
        
        item.onclick = function() {
            seleccionarAlimento(alimento);
        };
        
        contenedor.appendChild(item);
    });
}

function filtrarAlimentos() {
    const texto = document.getElementById('input-buscar').value.toLowerCase().trim();
    
    if (texto === '') {
        mostrarListaAlimentos(baseDeDatosAlimentos);
        return;
    }
    
    const filtrados = baseDeDatosAlimentos.filter(a => 
        a.nombre.toLowerCase().includes(texto)
    );
    
    mostrarListaAlimentos(filtrados);
}

// ============================================================
// FUNCIONES DE DETALLE DE ALIMENTO
// ============================================================

function seleccionarAlimento(alimento) {
    alimentoSeleccionado = alimento;
    document.getElementById('alimento-seleccionado-nombre').innerText = alimento.nombre;
    document.getElementById('input-gramos').value = 100;
    document.getElementById('select-estado').value = "crudo";
    
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.add('active');
    calcularMacrosDetalle();
}

function calcularMacrosDetalle() {
    if (!alimentoSeleccionado) return;
    
    const gramos = parseFloat(document.getElementById('input-gramos').value) || 0;
    const multiplicadorFactor = gramos / 100;

    const calCalc = Math.round(alimentoSeleccionado.cal * multiplicadorFactor);
    const proCalc = (alimentoSeleccionado.pro * multiplicadorFactor).toFixed(1);
    const carbCalc = (alimentoSeleccionado.carb * multiplicadorFactor).toFixed(1);
    const grasaCalc = (alimentoSeleccionado.grasa * multiplicadorFactor).toFixed(1);

    document.getElementById('calc-cal').innerText = calCalc;
    document.getElementById('calc-pro').innerText = proCalc;
    document.getElementById('calc-carb').innerText = carbCalc;
    document.getElementById('calc-grasa').innerText = grasaCalc;
}

// ============================================================
// FUNCIONES DE GUARDADO
// ============================================================

function agregarAlComsumo() {
    const cal = parseFloat(document.getElementById('calc-cal').innerText) || 0;
    const pro = parseFloat(document.getElementById('calc-pro').innerText) || 0;
    const carb = parseFloat(document.getElementById('calc-carb').innerText) || 0;
    const grasa = parseFloat(document.getElementById('calc-grasa').innerText) || 0;

    totalesDia.calorias += cal;
    totalesDia.proteinas += pro;
    totalesDia.carbs += carb;
    totalesDia.grasas += grasa;

    caloriasComidas[comidaActual] += cal;

    historialAlimentos.push({
        nombre: alimentoSeleccionado.nombre,
        comida: comidaActual,
        gramos: document.getElementById('input-gramos').value,
        calorias: cal,
        timestamp: new Date().getTime()
    });

    guardarDatos();
    actualizarPantallaResumen();
    
    console.log(`✅ ${alimentoSeleccionado.nombre} agregado a ${comidaActual}`);
    alert("✅ ¡Alimento registrado con éxito!");
    volverPrincipal();
}

function actualizarPantallaResumen() {
    document.getElementById('calorias-consumidas').innerText = Math.round(totalesDia.calorias);
    document.getElementById('pro-cons').innerText = Math.round(totalesDia.proteinas);
    document.getElementById('carb-cons').innerText = Math.round(totalesDia.carbs);
    document.getElementById('grasa-cons').innerText = Math.round(totalesDia.grasas);

    document.getElementById('desc-desayuno').innerText = `${Math.round(caloriasComidas.Desayuno)} kcal`;
    document.getElementById('desc-almuerzo').innerText = `${Math.round(caloriasComidas.Almuerzo)} kcal`;
    document.getElementById('desc-cena').innerText = `${Math.round(caloriasComidas.Cena)} kcal`;
    document.getElementById('desc-snack').innerText = `${Math.round(caloriasComidas.Snacks)} kcal`;

    const cardResumen = document.querySelector('.card-resumen');
    if (cardResumen) {
        if (totalesDia.calorias > objetivosDiarios.calorias) {
            cardResumen.style.background = '#e74c3c';
        } else if (totalesDia.calorias > objetivosDiarios.calorias * 0.9) {
            cardResumen.style.background = '#f39c12';
        } else {
            cardResumen.style.background = '#2c3e50';
        }
    }
}

// ============================================================
// FUNCIONES DE ESCÁNER DE CÓDIGO DE BARRAS
// ============================================================

function iniciarEscaner() {
    const readerDiv = document.getElementById('reader');
    
    if (escánerActivo) {
        detenerEscaner();
        return;
    }

    escánerActivo = true;
    readerDiv.innerHTML = '';
    
    const btnEscaner = document.getElementById('btn-escaner');
    const btnDetener = document.getElementById('btn-detener-escaner');
    if (btnEscaner) btnEscaner.style.display = 'none';
    if (btnDetener) btnDetener.style.display = 'block';
    
    htmlQrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
            fps: 10,
            qrbox: { width: 250, height: 250},
            aspectRatio: 1.0
        },
        false
    );

    htmlQrcodeScanner.render(onScanSuccess, onScanError);

    console.log('📷 Escáner iniciado');
}

function onScanSuccess(decodedText, decodedResult) {
    console.log(`✅ Código detectado: ${decodedText}`);
    buscarAlimentoPorCodigo(decodedText);
}

function onScanError(error) {
    console.log(`📷 Buscando código de barras...`);
}

function buscarAlimentoPorCodigo(codigoBarras) {
    detenerEscaner();
    alert(`⚠️ Código de barras: ${codigoBarras}\n\nNo encontrado en la base de datos local.\n\n¿Quieres tomar una foto de la etiqueta nutricional?`);
}

function detenerEscaner() {
    if (escánerActivo && htmlQrcodeScanner) {
        htmlQrcodeScanner.clear();
        document.getElementById('reader').innerHTML = '';
        escánerActivo = false;
        
        const btnEscaner = document.getElementById('btn-escaner');
        const btnDetener = document.getElementById('btn-detener-escaner');
        if (btnEscaner) btnEscaner.style.display = 'block';
        if (btnDetener) btnDetener.style.display = 'none';
        
        console.log('⛔ Escáner detenido');
    }
}

// ============================================================
// FUNCIONES OCR Y CAPTURA DE ETIQUETA NUTRICIONAL
// ============================================================

let videoElement;
let canvasElement;
let capturaActiva = false;

function inicializarOCR() {
    if (typeof Tesseract === 'undefined') {
        alert('⚠️ Error: Librería OCR no cargada.');
        return false;
    }
    
    const { createWorker } = Tesseract;
    
    createWorker('spa').then(worker => {
        ocrWorker = worker;
        console.log('✅ OCR inicializado correctamente');
    }).catch(error => {
        console.error('❌ Error al inicializar OCR:', error);
        alert('⚠️ Error al cargar el sistema de OCR');
    });
    
    return true;
}

function iniciarCapturaEtiqueta() {
    console.log('📸 Iniciando captura de etiqueta...');
    
    const readerDiv = document.getElementById('reader');
    readerDiv.innerHTML = '';
    readerDiv.style.background = '#000';
    
    videoElement = document.createElement('video');
    videoElement.style.width = '100%';
    videoElement.style.height = 'auto';
    videoElement.autoplay = true;
    videoElement.playsinline = true;
    
    canvasElement = document.createElement('canvas');
    canvasElement.style.display = 'none';
    
    readerDiv.appendChild(videoElement);
    readerDiv.appendChild(canvasElement);
    
    navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
    })
    .then(stream => {
        videoElement.srcObject = stream;
        capturaActiva = true;
        crearBotonesCapturaEtiqueta();
        console.log('✅ Cámara iniciada para captura de etiqueta');
    })
    .catch(error => {
        console.error('❌ Error al acceder a cámara:', error);
        alert('⚠️ No se pudo acceder a la cámara.');
    });
}

function crearBotonesCapturaEtiqueta() {
    const readerDiv = document.getElementById('reader');
    
    const botonesDiv = document.createElement('div');
    botonesDiv.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 10px;
        justify-content: center;
    `;
    
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

async function capturarFotoEtiqueta() {
    if (!videoElement || !canvasElement) return;
    
    try {
        console.log('📸 Capturando foto...');
        
        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0);
        
        canvasElement.toBlob(async (blob) => {
            await procesarFotoEtiqueta(blob);
        }, 'image/jpeg', 0.95);
        
    } catch (error) {
        console.error('❌ Error capturando foto:', error);
        alert('⚠️ Error al capturar la foto');
    }
}

async function procesarFotoEtiqueta(fotoBlob) {
    try {
        console.log('🔄 Procesando foto con OCR...');
        
        mostrarLoading('Analizando etiqueta nutricional...');
        
        if (!ocrWorker) {
            inicializarOCR();
            // Esperar a que se inicialice
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (!ocrWorker) {
            ocultarLoading();
            alert('⚠️ Error al cargar OCR. Intenta de nuevo.');
            return;
        }
        
        const { data: { text } } = await ocrWorker.recognize(fotoBlob);
        console.log('📝 Texto detectado:', text);

        const datosNutricionales = extraerDatosNutricionales(text);
        
        ocultarLoading();
        
        if (datosNutricionales && datosNutricionales.detectado) {
            mostrarVerificacionDatos(datosNutricionales);
        } else {
            alert('⚠️ No se pudieron detectar datos nutricionales.\n\nIntenta con una foto más clara.');
        }
        
    } catch (error) {
        console.error('❌ Error procesando foto:', error);
        ocultarLoading();
        alert('⚠️ Error al procesar la foto');
    }
}

function extraerDatosNutricionales(texto) {
    const textoLimpio = texto.toLowerCase().replace(/\n/g, ' ');
    
    console.log('🔍 Extrayendo datos del texto...');

    const regexCalorias = /(\d+(?:[.,]\d+)?)\s*(?:kcal|cal|kilocalorías?)/i;
    const regexProteinas = /proteí?nas?:?\s*(\d+(?:[.,]\d+)?)\s*g/i;
    const regexCarbohidratos = /carbohidratos?|carbs?:?\s*(\d+(?:[.,]\d+)?)\s*g/i;
    const regexGrasas = /grasas?:?\s*(\d+(?:[.,]\d+)?)\s*g/i;
    const regexPorcion = /(?:porción|ración|servicio).*?(\d+(?:[.,]\d+)?)\s*(?:g|ml|gramos?)/i;

    const calorias = extraerValor(texto, regexCalorias);
    const proteinas = extraerValor(texto, regexProteinas);
    const carbohidratos = extraerValor(texto, regexCarbohidratos);
    const grasas = extraerValor(texto, regexGrasas);
    const porcion = extraerValor(texto, regexPorcion) || 100;

    console.log('📊 Datos extraídos:');
    console.log(`- Calorías: ${calorias}`);
    console.log(`- Proteínas: ${proteinas}`);
    console.log(`- Carbohidratos: ${carbohidratos}`);
    console.log(`- Grasas: ${grasas}`);
    console.log(`- Porción: ${porcion}g`);

    return {
        calorias: calorias,
        proteinas: proteinas,
        carbohidratos: carbohidratos,
        grasas: grasas,
        porcion: porcion,
        detectado: calorias > 0
    };
}

function extraerValor(texto, regex) {
    const match = texto.match(regex);
    if (match && match[1]) {
        let valor = match[1].replace(',', '.');
        return parseFloat(valor) || 0;
    }
    return 0;
}

function mostrarVerificacionDatos(datosDetectados) {
    const readerDiv = document.getElementById('reader');
    
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    
    readerDiv.innerHTML = `
        
            📋 Verifica los datos detectados:
            
            
                <label>Nombre del producto:</label>
                <input>
            
            
            
                <label>Calorías (por porción de ${datosDetectados.porcion}g):
                <input>
            
            
            
                <label>Proteínas (g):
                <input>
            
            
            
                <label>Carbohidratos (g):
                <input>
            
            
            
                <label>Grasas (g):
                <input>
            
            
            
                <label>Tamaño de porción (g):
                <input>
            
            
            
                <button>
                    ✅ Confirmar y Usar
                </button>
                <button>
                    🔄 Recapturar
                
            
        
    `;
    
    capturaActiva = false;
}

function confirmarDatosOCR() {
    const nombre = document.getElementById('ocr-nombre').value.trim();
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

    const factorConversion = 100 / porcion;
    const caloriasPor100 = calorias * factorConversion;
    const proteinasPor100 = proteinas * factorConversion;
    const carbosPor100 = carbohidratos * factorConversion;
    const grasasPor100 = grasas * factorConversion;

    const nuevoAlimento = {
        nombre: nombre,
        cal: Math.round(caloriasPor100 * 10) / 10,
        pro: Math.round(proteinasPor100 * 10) / 10,
        carb: Math.round(carbosPor100 * 10) / 10,
        grasa: Math.round(grasasPor100 * 10) / 10,
        origen: 'OCR',
        fechaAgregado: new Date().toLocaleDateString('es-ES')
    };

    console.log('✅ Nuevo alimento creado:', nuevoAlimento);

    agregarNuevoAlimentoABaseDatos(nuevoAlimento);

    alimentoSeleccionado = nuevoAlimento;
    document.getElementById('alimento-seleccionado-nombre').innerText = nuevoAlimento.nombre;
    document.getElementById('input-gramos').value = 100;
    
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.add('active');
    calcularMacrosDetalle();
    
    alert(`✅ ¡Alimento "${nuevoAlimento.nombre}" agregado a tu base de datos!`);
}

function agregarNuevoAlimentoABaseDatos(alimento) {
    const existe = baseDeDatosAlimentos.find(a => 
        a.nombre.toLowerCase() === alimento.nombre.toLowerCase()
    );

    if (!existe) {
        baseDeDatosAlimentos.push(alimento);
        console.log(`✅ Alimento "${alimento.nombre}" agregado a la base de datos`);
        
        let alimentosCustom = JSON.parse(localStorage.getItem('alimentosCustom') || '[]');
        alimentosCustom.push(alimento);
        localStorage.setItem('alimentosCustom', JSON.stringify(alimentosCustom));
    } else {
        console.log(`ℹ️ El alimento "${alimento.nombre}" ya existe`);
    }
}

function cancelarCapturaEtiqueta() {
    console.log('❌ Captura cancelada');
    
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
    }
    
    const readerDiv = document.getElementById('reader');
    readerDiv.innerHTML = '';
    readerDiv.style.background = 'transparent';
    
    const btnEscaner = document.getElementById('btn-escaner');
    const btnDetener = document.getElementById('btn-detener-escaner');
    if (btnEscaner) btnEscaner.style.display = 'block';
    if (btnDetener) btnDetener.style.display = 'none';
    
    capturaActiva = false;
}

function mostrarLoading(mensaje) {
    const readerDiv = document.getElementById('reader');
    readerDiv.innerHTML = `
        
            ⏳
            ${mensaje}
            Esto puede tardar unos segundos...
        
    `;
}

function ocultarLoading() {
    // Ya se reemplaza con otro contenido
}

// ============================================================
// INICIALIZACIÓN DE LA APP
// ============================================================

window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App cargando...');
    cargarAlimentosPersonalizados();
    cargarDatos();
    inicializarOCR();
    console.log('✅ App lista para usar');
});

document.addEventListener('DOMContentLoaded', function() {
    const inputGramos = document.getElementById('input-gramos');
    if (inputGramos) {
        inputGramos.addEventListener('input', calcularMacrosDetalle);
    }
});
