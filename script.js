document.addEventListener('DOMContentLoaded', () => {

    // URL DE NODO WEBHOOK EN N8N
    const N8N_WEBHOOK_URL = "https://fernandaalcantara.app.n8n.cloud/webhook/2b9c4088-7661-4e69-8aa7-b1e92945b1fb";

    // Referencias a los elementos del DOM
    const btnCalcular = document.getElementById('btnCalcular');
    const textoOperacion = document.getElementById('textoOperacion');
    
    // Alertas de resultado y error
    const divResultado = document.getElementById('divResultado');
    const resultadoTexto = document.getElementById('resultadoTexto');
    const divError = document.getElementById('divError');
    const errorTexto = document.getElementById('errorTexto');

    const textoOriginalBtn = 'Calcular <i class="bi bi-send ms-1"></i>';

    btnCalcular.addEventListener('click', () => {
        const query = textoOperacion.value;

        if (query.trim() === "") {
            alert("Por favor, escribe una operación.");
            return;
        }

        // --- Estado de Carga ---
        // Ocultar alertas anteriores
        divResultado.style.display = 'none';
        divError.style.display = 'none';
        
        // Deshabilitar botón y mostrar spinner *dentro* del botón
        btnCalcular.disabled = true;
        btnCalcular.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Calculando...
        `;

        // 2. Enviar la solicitud a n8n
        fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                textoUsuario: query
            })
        })
        .then(response => {
            if (!response.ok) {
                // Si la respuesta del servidor no es 200 OK, la tratamos como un error
                throw new Error(`Error de red: ${response.statusText}`);
            }
            return response.json(); // Intenta parsear la respuesta como JSON
        })
        .then(data => {
            // --- Estado de Éxito ---
            // Restaurar botón
            btnCalcular.disabled = false;
            btnCalcular.innerHTML = textoOriginalBtn;

            // 3. Mostrar el resultado que n8n nos devuelve
            resultadoTexto.innerText = data.respuestaCalculada;
            divResultado.style.display = 'block';
        })
        .catch(error => {
            // --- Estado de Error ---
            // Restaurar botón
            btnCalcular.disabled = false;
            btnCalcular.innerHTML = textoOriginalBtn;

            // Manejo de errores (JSON inválido o error de red)
            console.error('Error:', error);
            errorTexto.innerText = 'Hubo un error al procesar la solicitud. Revisa la consola para más detalles.';
            divError.style.display = 'block';
        });
    });

});
