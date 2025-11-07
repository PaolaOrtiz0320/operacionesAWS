document.addEventListener('DOMContentLoaded', () => {

  // URL DEL WEBHOOK DE N8N (usa tu URL real)
  const N8N_WEBHOOK_URL = "https://paoortiz0311.app.n8n.cloud/webhook/2b9c4088-7661-4e69-8aa7-b1e92945b1fb";

  // Referencias a los elementos del DOM
  const btnCalcular = document.getElementById('btnCalcular');
  const textoOperacion = document.getElementById('textoOperacion');

  // Alertas de resultado y error
  const divResultado = document.getElementById('divResultado');
  const resultadoTexto = document.getElementById('resultadoTexto');
  const divError = document.getElementById('divError');
  const errorTexto = document.getElementById('errorTexto');

  const textoOriginalBtn = 'Calcular <i class="bi bi-send ms-1"></i>';

  // === Evento principal ===
  btnCalcular.addEventListener('click', () => {
    const query = textoOperacion.value.trim();

    if (query === "") {
      alert("Por favor, escribe una operación.");
      return;
    }

    // --- Estado de carga ---
    divResultado.style.display = 'none';
    divError.style.display = 'none';

    btnCalcular.disabled = true;
    btnCalcular.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Calculando...
    `;

    // === Enviar solicitud a n8n ===
    fetch(N8N_WEBHOOK_URL + '?wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ textoUsuario: query })
    })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Error HTTP ${response.status}: ${response.statusText}');
      }

      // Leer como texto para evitar el "Unexpected end of JSON input"
      const raw = await response.text();

      if (!raw) {
        // Si la respuesta está vacía
        return { respuestaCalculada: 'Sin respuesta del servidor (cuerpo vacío).' };
      }

      // Intentar parsear el JSON
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.warn('Respuesta no JSON, contenido:', raw);
        return { respuestaCalculada: raw };
      }
    })
    .then((data) => {
      // --- Estado de Éxito ---
      btnCalcular.disabled = false;
      btnCalcular.innerHTML = textoOriginalBtn;

      // Mostrar el resultado (ajusta según el formato que devuelva tu n8n)
      resultadoTexto.innerText = data.respuestaCalculada 
                              ?? data.result 
                              ?? JSON.stringify(data);

      divResultado.style.display = 'block';
    })
    .catch((error) => {
      // --- Estado de Error ---
      btnCalcular.disabled = false;
      btnCalcular.innerHTML = textoOriginalBtn;

      console.error('Error al procesar:', error);
      errorTexto.innerText = 'Hubo un error al procesar la solicitud. Revisa la consola para más detalles.';
      divError.style.display = 'block';
    });
  });


});
