// Variables para llevar el control de los totales
let totalCalorias = 0;
let totalProteinas = 0;
let totalCarbs = 0;
let totalGrasas = 0;

function registrarAlimento() {
    // Capturamos los valores que escribiste en las casillas
    const nombre = document.getElementById('nombre-alimento').value;
    const calorias = parseFloat(document.getElementById('calorias-alimento').value) || 0;
    const proteinas = parseFloat(document.getElementById('pro-alimento').value) || 0;
    
    // Validamos que al menos escribas un nombre y calorías
    if (nombre === "" || calorias === 0) {
        alert("Por favor ingresa al menos el nombre del alimento y sus calorías.");
        return;
    }

    // Sumamos a los totales del día (para este MVP asumimos valores estándar o directos)
    totalCalorias += calorias;
    totalProteinas += proteinas;
    // Para simplificar el MVP, estimamos carbohidratos y grasas proporcionales si no se llenan, o en 0
    totalCarbs += 0; 
    totalGrasas += 0;

    // Actualizamos la pantalla con los nuevos totales
    document.getElementById('total-calorias').innerText = `${totalCalorias} / 2000 kcal`;
    document.getElementById('total-pro').innerText = totalProteinas;
    document.getElementById('total-carbs').innerText = totalCarbs;
    document.getElementById('total-grasas').innerText = totalGrasas;

    // Limpiamos las casillas para el siguiente alimento
    document.getElementById('nombre-alimento').value = '';
    document.getElementById('calorias-alimento').value = '';
    document.getElementById('pro-alimento').value = '';

    alert("¡Alimento agregado con éxito!");
}
