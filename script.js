// main.js
document.addEventListener('DOMContentLoaded', () => {
  // URL del Webhook de n8n
  const N8N_WEBHOOK_URL = 'https://paoortiz0311.app.n8n.cloud/webhook/2b9c4088-7661-4e69-8aa7-b1e92945b1fb';

  // Referencias al DOM
  const btnCalcular     = document.getElementById('btnCalcular');
  const textoOperacion  = document.getElementById('textoOperacion');

  const divResultado    = document.getElementById('divResultado');
  const resultadoTexto  = document.getElementById('resultadoTexto');
  const divError        = document.getElementById('divError');
  const errorTexto      = document.getElementById('errorTexto');

  const textoOriginalBtn = 'Calcular <i class="bi bi-send ms-1"></i>';

  // Enviar con Ctrl+Enter
  textoOperacion.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      btnCalcular.click();
    }
  });

  btnCalcular.addEventListener('click', async () => {
    // Sanitiza entrada: convierte × o x por * y ÷ por /
    let query = textoOperacion.value.trim()
      .replace(/[×x]/g, '*')
      .replace(/÷/g, '/');

    if (!query) {
      alert('Por favor, escribe una operación.');
      return;
    }

    // Estado de carga
    divResultado.style.display = 'none';
    divError.style.display = 'none';
    btnCalcular.disabled = true;
    btnCalcular.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Calculando...
    `;

    try {
      // Llamada a n8n (espera respuesta sincrónica)
      const resp = await fetch(N8N_WEBHOOK_URL + '?wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoUsuario: query })
      });

      if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status}: ${resp.statusText}`);
      }

      // Leemos como texto (el Respond to Webhook devuelve texto plano o JSON)
      const raw = await resp.text();
      if (!raw) {
        throw new Error('Sin respuesta del servidor (cuerpo vacío).');
      }

      // Intentamos parsear JSON; si no, usamos el texto tal cual
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { respuestaCalculada: raw };
      }

      // Normaliza y muestra el resultado (sin “=”, sin espacios)
      let val = String(
        data.respuestaCalculada ?? data.result ?? raw
      ).trim().replace(/^=/, '').replace(',', '.');

      // Opcional: fija decimales visibles (p. ej., 8)
      // val = Number(val).toFixed(8);

      resultadoTexto.textContent = val;
      divResultado.style.display = 'block';
    } catch (err) {
      console.error('Error al procesar:', err);
      errorTexto.textContent = err.message || 'Error desconocido';
      divError.style.display = 'block';
    } finally {
      btnCalcular.disabled = false;
      btnCalcular.innerHTML = textoOriginalBtn;
    }
  });
});
