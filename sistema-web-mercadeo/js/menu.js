// ==============================================================================
// 1. FUNCIONES PARA EL MENÚ DE PRODUCCIÓN (Lectura de JSON)
// ==============================================================================

function cargarFichasMenu() {
    const container = document.getElementById('fichas-container');
    // Si el contenedor no existe, salimos sin hacer nada
    if (!container) return; 

    container.innerHTML = '<p>Cargando fichas de menú...</p>';

    // La ruta es relativa a la ubicación del archivo HTML que llama a menu.js
    fetch('../js/menuData.js') 
        .then(response => {
            if (!response.ok) {
                // Si el archivo no existe (404), lanzamos un error
                throw new Error('El archivo menuData.json no fue encontrado.');
            }
            return response.json();
        })
        .then(data => {
            let htmlContent = '';
            
            data.forEach(plato => {
                // 1. Mapear el array de ingredientes a una lista <li> en HTML
                const ingredientesHTML = plato.ingredientes.map(ing => `<li>${ing}</li>`).join('');

                // 2. Construir la ficha HTML completa
                htmlContent += `
                    <div class="ficha-producto" data-id="${plato.id}">
                        <h2 class="nombre-plato">${plato.nombre}</h2>
                        <div class="ficha-contenido">
                            <div class="ficha-imagen">
                                <img src="${plato.imagen_src}" alt="Foto del plato ${plato.nombre}">
                            </div>
                            <div class="ficha-detalles">
                                <h3>Detalles de Ingredientes</h3>
                                <ul class="lista-ingredientes">${ingredientesHTML}</ul>
                                <h3>Presentación / Montaje</h3>
                                <p class="montaje-instrucciones">${plato.montaje}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // 3. Inyectar el contenido en el contenedor
            container.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error('Error cargando menú:', error);
            container.innerHTML = `<p style="color: red;">Error al cargar las fichas de menú: ${error.message}</p>`;
        });
}


// ==============================================================================
// 2. INICIALIZACIÓN
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Carga las fichas del menú al iniciar la página
    cargarFichasMenu(); 

    // 2. Asigna la función de impresión al botón
    const btnImprimir = document.getElementById('btn-imprimir-menu');
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            window.print();
        });
    }
});