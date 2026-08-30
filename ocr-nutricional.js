// ============================================================
// SISTEMA DE OCR PARA LEER ETIQUETAS NUTRICIONALES
// Usando Tesseract.js (reconocimiento óptico de caracteres)
// ============================================================

// Cargar la librería de Tesseract
const { createWorker } = Tesseract;
let ocrWorker;

/**
 * Inicializar el worker de OCR
 */
async function inicializarOCR() {
    try {
        ocrWorker = await createWorker('spa'); // Español
        console.log('✅ OCR inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar OCR:', error);
        alert('⚠️ Error al cargar el sistema de OCR');
        return false;
    }
}

/**
 * Procesar imagen y extraer datos nutricionales
 */
async function procesarImagenNutricional(imagenFile) {
    if (!ocrWorker) {
        const inicializado = await inicializarOCR();
        if (!inicializado) return null;
    }

    try {
        console.log('📸 Procesando imagen...');
        
        // Leer la imagen con OCR
        const { data: { text } } = await ocrWorker.recognize(imagenFile);
        console.log('📝 Texto detectado:', text);

        // Procesar el texto para extraer datos nutricionales
        const datosNutricionales = extraerDatosNutricionales(text);
        
        return datosNutricionales;
    } catch (error) {
        console.error('❌ Error procesando imagen:', error);
        alert('⚠️ Error al procesar la imagen. Intenta de nuevo.');
        return null;
    }
}

/**
 * Extraer datos nutricionales del texto OCR
 * Busca patrones como "250 kcal", "12g proteína", etc.
 */
function extraerDatosNutricionales(texto) {
    const textoLimpio = texto.toLowerCase().replace(/\n/g, ' ');
    
    console.log('🔍 Extrayendo datos del texto...');

    // Expresiones regulares para encontrar valores
    const regexCalorias = /(\d+(?:[.,]\d+)?)\s*(?:kcal|cal|kilocalorías?)/i;
    const regexProteinas = /proteí?nas?:?\s*(\d+(?:[.,]\d+)?)\s*g/i;
    const regexCarbohidratos = /carbohidratos?|carbs?:?\s*(\d+(?:[.,]\d+)?)\s*g/i;
    const regexGrasas = /grasas?:?\s*(\d+(?:[.,]\d+)?)\s*g/i;
    const regexPorcion = /(?:porción|ración|servicio).*?(\d+(?:[.,]\d+)?)\s*(?:g|ml|gramos?)/i;

    // Extraer valores
    const calorias = extraerValor(texto, regexCalorias);
    const proteinas = extraerValor(texto, regexProteinas);
    const carbohidratos = extraerValor(texto, regexCarbohidratos);
    const grasas = extraerValor(texto, regexGrasas);
    const porcion = extraerValor(texto, regexPorcion) || 100; // Por defecto 100g

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
        detectado: calorias > 0 // Si detectó al menos calorías
    };
}

/**
 * Función auxiliar para extraer valor con regex
 */
function extraerValor(texto, regex) {
    const match = texto.match(regex);
    if (match && match[1]) {
        let valor = match[1].replace(',', '.');
        return parseFloat(valor) || 0;
    }
    return 0;
}

/**
 * Terminar el worker de OCR
 */
async function terminarOCR() {
    if (ocrWorker) {
        await ocrWorker.terminate();
        ocrWorker = null;
        console.log('⛔ OCR terminado');
    }
}
