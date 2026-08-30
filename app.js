// Base de datos inicial de alimentos (valores por cada 100g)
const baseDeDatosAlimentos = [
    { nombre: "Pechuga de Pollo", cal: 165, pro: 31, carb: 0, grasa: 3.6 },
    { nombre: "Arroz Blanco Cocido", cal: 130, pro: 2.7, carb: 28, grasa: 0.3 },
    { nombre: "Avena", cal: 389, pro: 16.9, carb: 66, grasa: 6.9 },
    { nombre: "Huevo Entero", cal: 155, pro: 13, carb: 1.1, grasa: 11 },
    { nombre: "Plátano", cal: 89, pro: 1.1, carb: 23, grasa: 0.3 },
    { nombre: "Carne Molida 5% Grasa", cal: 215, pro: 26, carb: 0, grasa: 12 },
    { nombre: "Palta / Aguacate", cal: 160, pro: 2, carb: 8.5, grasa: 15 },
    { nombre: "Pan Hallulla / Marraqueta", cal: 280, pro: 8, carb: 55, grasa: 3 }
];

// Variables globales del día
let totalesDia = {
    calorias: 0,
    proteinas: 0,
    carbs: 0,
    grasas: 0
};

// Control de calorías por tiempo de comida
let caloriasComidas = {
    Desayuno: 0,
    Almuerzo: 0,
    Cena: 0,
    Snacks: 0
};

let comidaActual = "";
let alimentoSeleccionado = null;

// Funciones de navegación entre pantallas
function abrirBuscador(tipoComida) {
    comidaActual = tipoComida;
    document.getElementById('titulo-comida').innerText = `Agregar a ${tipoComida}`;
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('search-screen').classList.add('active');
    document.getElementById('input-buscar').value = '';
    mostrarListaAlimentos(baseDeDatosAlimentos);
}

function volverPrincipal() {
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
}

function volverBuscador() {
    document.getElementById('detail-screen').classList.remove('active');
    document.getElementById('search-screen').classList.add('active');
}

// Mostrar lista de alimentos en el buscador
function mostrarListaAlimentos(lista) {
    const contenedor = document.getElementById('lista-alimentos');
    contenedor.innerHTML = '';
    
    lista.forEach((alimento, index) => {
        const item = document.createElement('div');
        item.className = 'food-item';
        item.innerHTML = `<strong>${alimento.nombre}</strong> <br><small style="color: #666;">${alimento.cal} kcal | P: ${alimento.pro}g | C: ${alimento.carb}g | G: ${alimento.grasa}g (por 100g)</small>`;
        item.onclick = () => seleccionarAlimento(alimento);
        contenedor.appendChild(item);
    });
}

function filtrarAlimentos() {
    const texto = document.getElementById('input-buscar').value.toLowerCase();
    const filtrados = baseDeDatosAlimentos.filter(a => a.nombre.toLowerCase().includes(texto));
    mostrarListaAlimentos(filtrados);
}

// Seleccionar alimento para ir al detalle de gramos
function seleccionarAlimento(alimento) {
    alimentoSeleccionado = alimento;
    document.getElementById('alimento-seleccionado-nombre').innerText = alimento.nombre;
    document.getElementById('input-gramos').value = 100;
    document.getElementById('select-estado').value = "crudo";
    
    document.getElementById('search-screen').classList.remove('active');
    document.getElementById('detail-screen').classList.add('active');
    calcularMacrosDetalle();
}

// Calcular macros dinámicamente según gramos y estado
function calcularMacrosDetalle() {
    if (!alimentoSeleccionado) return;
    
    const gramos = parseFloat(document.getElementById('input-gramos').value) || 0;
    const estado = document.getElementById('select-estado').value;
    
    let multiplicadorFactor = gramos / 100;

    // Ajuste simple opcional si se selecciona cocido (ej. arroz absorbe agua, carne reduce peso)
    if (alimentoSeleccionado.nombre.includes("Arroz") && estado === "cocido") {
        // Factor orientativo si ingresan gramos ya cocidos
        multiplicadorFactor = gramos / 100; 
    }

    const calCalc = Math.round(alimentoSeleccionado.cal * multiplicadorFactor);
    const proCalc = (alimentoSeleccionado.pro * multiplicadorFactor).toFixed(1);
    const carbCalc = (alimentoSeleccionado.carb * multiplicadorFactor).toFixed(1);
    const grasaCalc = (alimentoSeleccionado.grasa * multiplicadorFactor).toFixed(1);

    document.getElementById('calc-cal').innerText = calCalc;
    document.getElementById('calc-pro').innerText = proCalc;
    document.getElementById('calc-carb').innerText = carbCalc;
    document.getElementById('calc-grasa').innerText = grasaCalc;
}

// Guardar el alimento en el consumo diario
function agregarAlComsumo() {
    const cal = parseFloat(document.getElementById('calc-cal').innerText);
    const pro = parseFloat(document.getElementById('calc-pro').innerText);
    const carb = parseFloat(document.getElementById('calc-carb').innerText);
    const grasa = parseFloat(document.getElementById('calc-grasa').innerText);

    // Sumar a totales del día
    totalesDia.calorias += cal;
    totalesDia.proteinas += pro;
    totalesDia.carbs += carb;
    totalesDia.grasas += grasa;

    // Sumar al tiempo de comida correspondiente
    caloriasComidas[comidaActual] += cal;

    // Actualizar pantalla principal
    document.getElementById('calorias-consumidas').innerText = Math.round(totalesDia.calorias);
    document.getElementById('pro-cons').innerText = Math.round(totalesDia.proteinas);
    document.getElementById('carb-cons').innerText = Math.round(totalesDia.carbs);
    document.getElementById('grasa-cons').innerText = Math.round(totalesDia.grasas);

    // Actualizar texto del recuadro de comida (ej. Desayuno)
    let idTexto = "";
    if (comidaActual === "Desayuno") idTexto = "desc-desayuno";
    if (comidaActual === "Almuerzo") idTexto = "desc-almuerzo";
    if (comidaActual === "Cena") idTexto = "desc-cena";
    if (comidaActual === "Snacks") idTexto = "desc-snack";

    document.getElementById(idTexto).innerText = `${caloriasComidas[comidaActual]} kcal`;

    alert("¡Alimento registrado con éxito!");
    volverPrincipal();
}
