// ==============================================================================
// 1. CONFIGURACIÓN DEL SERVIDOR (¡URL FINAL PEGADA AQUÍ!)
// ==============================================================================

// URL de la Aplicación Web de Google Apps Script (doPost y doGet)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwTTFKDv6DjGw1sqejwjpaUlhmRahLWfOHj-8gzXk6H6DaMElC_zzB-RWTlK3ZlnYIwiw/exec';

// Función auxiliar robusta para obtener valores enteros (devuelve número o 0).
const getIntValue = (id) => {
    const value = document.getElementById(id).value;
    return value === "" || isNaN(parseInt(value)) ? 0 : parseInt(value);
};

// ==============================================================================
// 2. FUNCIÓN CRUD - AGREGAR (Escribe en Google Sheets - POST)
// ==============================================================================

function agregarReserva(e) {
    e.preventDefault(); 
    
    const btnSubmit = document.getElementById('form-reserva').querySelector('button[type="submit"]');
    
    // 1. Recoger datos del formulario
    const nuevaReserva = {
        nombre_cliente: document.getElementById('nombre_cliente').value,
        apellido_cliente: document.getElementById('apellido_cliente').value,
        telefono_contacto: document.getElementById('telefono_contacto').value,
        tomada_por: document.getElementById('tomada_por').value,
        fecha_evento: document.getElementById('fecha_evento').value,
        hora_llegada: document.getElementById('hora_llegada').value,
        pax_adultos: getIntValue('pax_adultos'), 
        pax_kids: getIntValue('pax_kids'),
        tipo_menu: document.getElementById('tipo_menu').value,
        consideraciones: document.getElementById('consideraciones').value
    };
    
    // 2. Indicador de carga
    btnSubmit.textContent = 'Guardando...';
    btnSubmit.disabled = true;
    
    // 3. Enviar datos al Apps Script (doPost)
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(nuevaReserva),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === "success") {
            alert("✅ Reserva guardada con éxito en la Hoja de Cálculo.");
            document.getElementById('form-reserva').reset();
            mostrarReservas(); 
        } else {
            alert("❌ Error al guardar la reserva: " + (data.message || "Verifica la configuración del Apps Script."));
        }
    })
    .catch(error => {
        alert("❌ Error de red o conexión al servidor.");
        console.error('Error:', error);
    })
    .finally(() => {
        btnSubmit.textContent = 'Agregar Reserva';
        btnSubmit.disabled = false;
    });
}


// ==============================================================================
// 3. FUNCIÓN DE RENDERIZADO (Lee desde Google Sheets - GET)
// ==============================================================================

function mostrarReservas() {
    const lista = document.getElementById('lista-reservas');
    lista.innerHTML = '<tr><td colspan="8">Cargando reservas desde Google Sheets...</td></tr>';

    // Leer datos desde el Apps Script (doGet)
    fetch(APPS_SCRIPT_URL)
    .then(response => response.json())
    .then(result => {
        lista.innerHTML = ''; 

        if (result.error) {
             lista.innerHTML = `<tr><td colspan="8" style="color: red;">Error al cargar: ${result.error}</td></tr>`;
             return;
        }

        const reservas = result.data || [];
        
        if (reservas.length === 0) {
             lista.innerHTML = '<tr><td colspan="8">No hay reservas agendadas aún.</td></tr>';
        }

        reservas.forEach(reserva => {
            const fila = lista.insertRow();
            
            // NOTA: El orden debe coincidir con el mapeo en doGet del Apps Script.
            fila.insertCell().textContent = reserva.id; 
            fila.insertCell().textContent = `${reserva.nombre_cliente} ${reserva.apellido_cliente}`;
            fila.insertCell().textContent = reserva.telefono_contacto;
            
            const fechaEventoStr = reserva.fecha_evento instanceof Date ? reserva.fecha_evento.toLocaleDateString() : reserva.fecha_evento;
            fila.insertCell().textContent = `${fechaEventoStr} @ ${reserva.hora_llegada}`;
            
            fila.insertCell().textContent = `${reserva.pax_adultos} A / ${reserva.pax_kids} N`;
            fila.insertCell().textContent = reserva.tipo_menu;
            fila.insertCell().textContent = reserva.tomada_por;
            
            // Columna de Acción (Borrar deshabilitado)
            const celdaAccion = fila.insertCell();
            const btnBorrar = document.createElement('button');
            btnBorrar.textContent = 'X Borrar (Nube)';
            btnBorrar.disabled = true;
            celdaAccion.appendChild(btnBorrar);
        });
    })
    .catch(error => {
        lista.innerHTML = `<tr><td colspan="8" style="color: red;">Error al conectar con la URL del Apps Script: ${error}</td></tr>`;
    });
}

// ==============================================================================
// 4. INICIALIZACIÓN
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Asocia el formulario con la nueva función agregarReserva
    document.getElementById('form-reserva').addEventListener('submit', agregarReserva);
    
    // 2. Carga y muestra las reservas al iniciar
    mostrarReservas(); 
    
    // 3. Botón de exportar deshabilitado
    const btnExportar = document.getElementById('btn-exportar');
    btnExportar.textContent = 'Reservas Centralizadas (Google Sheets)';
    btnExportar.disabled = true;
});