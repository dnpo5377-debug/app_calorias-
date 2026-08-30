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

// Objetivos diarios (personalizables)
let objetivosDiarios = {
    calorias: 2000,
    proteinas: 150,
    carbs: 200,
    grasas: 65
};

// Control de calorías por tiempo de comida
let caloriasComidas = {
    Desayuno: 0,
    Almuerzo: 0,
    Cena: 0,
    Snacks: 0
};

// Historial de alimentos
let historialAlimentos = [];

// Variables de estado
let comidaActual = "";
let alimentoSeleccionado = null;

// ============================================================
// FUNCIONES DE ALMACENAMIENTO EN LOCALSTORAGE
// ============================================================

/**
 * Guardar todos los datos en el navegador
 */
function guardarDatos() {
    localStorage.setItem('totalesDia', JSON.stringify(totalesDia));
    localStorage.setItem('caloriasComidas', JSON.stringify(caloriasComidas));
    localStorage.setItem('historialAlimentos', JSON.stringify(historialAlimentos));
    localStorage.setItem('fechaActual', new Date().toDateString());
    console.log('✅ Datos guardados correctamente');
}

/**
 * Cargar datos del localStorage
 */
function cargarDatos() {
    const fechaGuardada = localStorage.getItem('fechaActual');
    const fechaActual = new Date().toDateString();
    
    // Si pasó un día, limpiar todo
    if (fechaGuardada !== fechaActual) {
        console.log('📅 Nuevo día detectado - Limpiando datos anteriores');
        limpiarDia();
        return;
    }
    
    // Cargar datos guardados
    const totales = localStorage.getItem('totalesDia');
    const comidas = localStorage.getItem('caloriasComidas');
    const historial = localStorage.getItem('historialAlimentos');
    
    if (totales) totalesDia = JSON.parse(totales);
    if (comidas) caloriasComidas = JSON.parse(comidas);
    if (historial) historialAlimentos = JSON.parse(historial);
    
    console.log('📂 Datos cargados desde localStorage');
    actualizarPantallaResumen();
}

/**
 * Limpiar todo el día
 */
function limpiarDia() {
    totalesDia = { calorias: 0, proteinas: 0, carbs: 0, grasas: 0 };
    caloriasComidas = { Desayuno: 0, Almuerzo: 0, Cena: 0, Snacks: 0 };
    historialAlimentos = [];
    localStorage.setItem('fechaActual', new Date().toDateString());
    guardarDatos();
    actualizarPantallaResumen();
    console.log('🗑️ Día limpiado correctamente');
}

/**
 * Mostrar historial de alimentos del día
 */
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

// ============================================================
// FUNCIONES DE NAVEGACIÓN ENTRE PANTALLAS
// ============================================================

/**
 * Abrir buscador de alimentos
 */
function abrirBuscador(tipoComida) {
    comidaActual = tipoComida;
    document.getElementById('titulo-comida').innerText = `Agregar a ${tipoComida}`;
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('search-screen').classList.add('active');
    document.getElementById('input-buscar').value = '';
    mostrarListaAlimentos(baseDeDatosAlimentos);
}

/**
 * Volver a la pantalla principal
 */
function volverPrincipal() {
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
}

/**
 * Volver al buscador desde detalle
 */
function volverBuscador() {
    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('search-screen').classList.add('active');
}

// ============================================================
// FUNCIONES DEL BUSCADOR Y FILTRADO
// ============================================================

/**
 * Mostrar lista de alimentos en el buscador
 */
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
        item.style.padding = "10px";
        item.style.borderBottom = "1px solid #eee";
        item.style.cursor = "pointer";
        item.style.transition = "background 0.2s";
        item.innerHTML = `
            🍗 ${alimento.nombre} 
            
            <small>
                ${alimento.cal} kcal | P: ${alimento.pro}g | C: ${alimento.carb}g | G: ${alimento.grasa}g (x100g)
            </small>
        `;
        
        // Efecto hover
        item.onmouseover = () => item.style.background = '#f1f2f6';
        item.onmouseout = () => item.style.background = 'transparent';
        
        // Click para seleccionar
        item.onclick = function() {
            seleccionarAlimento(alimento);
        };
        
        contenedor.appendChild(item);
    });
}

/**
 * Filtrar alimentos por búsqueda
 */
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

/**
 * Seleccionar alimento para ir al detalle
 */
function seleccionarAlimento(alimento) {
    alimentoSeleccionado = alimento;
    document.getElementById('alimento-seleccionado-nombre').innerText = alimento.nombre;
    document.getElementById('input-gramos').value = 100;
    document.getElementById('select-estado').value = "crudo";
    
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.add('active');
    calcularMacrosDetalle();
}

/**
 * Calcular macros dinámicamente según gramos
 */
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

/**
 * Agregar alimento al consumo diario
 */
function agregarAlComsumo() {
    const cal = parseFloat(document.getElementById('calc-cal').innerText) || 0;
    const pro = parseFloat(document.getElementById('calc-pro').innerText) || 0;
    const carb = parseFloat(document.getElementById('calc-carb').innerText) || 0;
    const grasa = parseFloat(document.getElementById('calc-grasa').innerText) || 0;

    // Sumar a totales del día
    totalesDia.calorias += cal;
    totalesDia.proteinas += pro;
    totalesDia.carbs += carb;
    totalesDia.grasas += grasa;

    // Sumar al tiempo de comida correspondiente
    caloriasComidas[comidaActual] += cal;

    // Guardar en historial
    historialAlimentos.push({
        nombre: alimentoSeleccionado.nombre,
        comida: comidaActual,
        gramos: document.getElementById('input-gramos').value,
        calorias: cal,
        timestamp: new Date().getTime()
    });

    // Guardar en localStorage
    guardarDatos();

    // Actualizar pantalla
    actualizarPantallaResumen();
    
    console.log(`✅ ${alimentoSeleccionado.nombre} agregado a ${comidaActual}`);
    alert("✅ ¡Alimento registrado con éxito!");
    volverPrincipal();
}

/**
 * Actualizar la pantalla de resumen
 */
function actualizarPantallaResumen() {
    // Actualizar totales del día
    document.getElementById('calorias-consumidas').innerText = Math.round(totalesDia.calorias);
    document.getElementById('pro-cons').innerText = Math.round(totalesDia.proteinas);
    document.getElementById('carb-cons').innerText = Math.round(totalesDia.carbs);
    document.getElementById('grasa-cons').innerText = Math.round(totalesDia.grasas);

    // Actualizar cada comida
    document.getElementById('desc-desayuno').innerText = `${Math.round(caloriasComidas.Desayuno)} kcal`;
    document.getElementById('desc-almuerzo').innerText = `${Math.round(caloriasComidas.Almuerzo)} kcal`;
    document.getElementById('desc-cena').innerText = `${Math.round(caloriasComidas.Cena)} kcal`;
    document.getElementById('desc-snack').innerText = `${Math.round(caloriasComidas.Snacks)} kcal`;

    // Cambiar color de fondo si se excede el objetivo
    const cardResumen = document.querySelector('.card-resumen');
    if (totalesDia.calorias > objetivosDiarios.calorias) {
        cardResumen.style.background = '#e74c3c';
    } else if (totalesDia.calorias > objetivosDiarios.calorias * 0.9) {
        cardResumen.style.background = '#f39c12';
    } else {
        cardResumen.style.background = '#2c3e50';
    }
}

// ============================================================
// FUNCIÓN DE ESCÁNER (Placeholder - para futura implementación)
// ============================================================

/**
 * Iniciar escáner de código de barras
 */
function iniciarEscaner() {
    alert("📷 Función de escáner en desarrollo.\n\nActualmente puedes buscar el alimento manualmente en la lista.");
}

// ============================================================
// INICIALIZACIÓN DE LA APP
// ============================================================

/**
 * Ejecutar cuando carga la página
 */
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App cargando...');
    cargarDatos();
    console.log('✅ App lista para usar');
});

// Detectar cambios en los inputs de gramos en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    const inputGramos = document.getElementById('input-gramos');
    if (inputGramos) {
        inputGramos.addEventListener('input', calcularMacrosDetalle);
    }
});
