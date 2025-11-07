// script.js (UTF-8, LF)

// Asegúrate de reescribir a mano esta URL (sin comillas “inteligentes”)
const N8N_WEBHOOK_URL = 'https://paoortiz0311.app.n8n.cloud/webhook/2b9c4088-7661-4e69-8aa7-b1e92945b1fb';
const REQ_TIMEOUT_MS = 25000;

document.addEventListener('DOMContentLoaded', () => {
  const btnCalcular = document.getElementById('btnCalcular');
  const textoOperacion = document.getElementById('textoOperacion');

  const divResultado = document.getElementById('divResultado');
  const resultadoTexto = document.getElementById('resultadoTexto');

  const divError = document.getElementById('divError');
  const errorTexto = document.getElementById('errorTexto');

  const textoOriginalBtn = 'Calcular <i class="bi bi-send ms-1"></i>';

  function setLoading(loading) {
    if (loading) {
      btnCalcular.disabled = true;
      btnCalcular.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Calculando...';
    } else {
      btnCalcular.disabled = false;
      btnCalcular.innerHTML = textoOriginalBtn;
    }
  }

  function limpiarAlertas() {
    divResultado.style.display = 'none';
    divError.style.display = 'none';
    resultadoTexto.textContent = '';
    errorTexto.textContent = '';
  }

  function mostrarResultado(txt) {
    resultadoTexto.textContent = String(txt);
    divResultado.style.display = 'block';
  }

  function mostrarError(msg) {
    errorTexto.textContent = String(msg);
    divError.style.display = 'block';
  }

  function safeParseJSON(text) {
    try { return { ok: true, data: JSON.parse(text) }; }
    catch (e) { return { ok: false, err: e }; }
  }

  async function calcular() {
    const query = (textoOperacion.value || '').trim();
    if (!query) {
      alert('Por favor, escribe una operación.');
      return;
    }

    limpiarAlertas();
    setLoading(true);

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), REQ_TIMEOUT_MS);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoUsuario: query }),
        signal: ac.signal,
        // credentials: 'omit', // normalmente no hace falta
        // mode: 'cors',       // por defecto en fetch del navegador
      });

      const contentType = res.headers.get('content-type') || '';
      const raw = await res.text(); // evita "Unexpected end of JSON input"

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} | ${raw || 'sin cuerpo'}`);
      }

      if (!raw) {
        throw new Error('La respuesta llegó vacía.');
      }

      if (!contentType.includes('application/json')) {
        // Si no es JSON, muestra el texto crudo (útil para depurar)
        mostrarResultado(raw);
        return;
      }

      const parsed = safeParseJSON(raw);
      if (!parsed.ok) {
        throw new Error(`No se pudo parsear JSON: ${parsed.err?.message || 'desconocido'}`);
      }

      const data = parsed.data;

      // n8n debe responder { respuestaCalculada: "..." }
      if ('respuestaCalculada' in data) {
        mostrarResultado(data.respuestaCalculada);
      } else if ('error' in data) {
        throw new Error(data.error);
      } else {
        // Si la forma cambió, muestra todo para inspección
        mostrarResultado(JSON.stringify(data, null, 2));
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        mostrarError('Tiempo de espera agotado. Intenta de nuevo.');
      } else {
        mostrarError(err.message || 'Hubo un error al procesar la solicitud.');
      }
      console.error('Error:', err);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  }

  btnCalcular.addEventListener('click', calcular);

  // Atajo: Ctrl+Enter para enviar
  textoOperacion.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) calcular();
  });
});
