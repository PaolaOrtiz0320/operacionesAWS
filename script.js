document.addEventListener('DOMContentLoaded', () => {
  const N8N_WEBHOOK_URL = 'https://paolaortiz.app.n8n.cloud/webhook/2b9c4088-7661-4e69-8aa7-b1e92945b1fb';

  // DOM
  const btnCalcular = document.getElementById('btnCalcular');
  const textoOperacion = document.getElementById('textoOperacion');
  const divResultado = document.getElementById('divResultado');
  const resultadoTexto = document.getElementById('resultadoTexto');
  const divError = document.getElementById('divError');
  const errorTexto = document.getElementById('errorTexto');

  // Guarda el label original del botón tal como está en el HTML ("Realizar")
  const btnLabelOriginal = btnCalcular.innerHTML;

  function show(el){ el.classList.remove('d-none'); }
  function hide(el){ el.classList.add('d-none'); }

  async function calcular(query){
    hide(divResultado);
    hide(divError);
    btnCalcular.disabled = true;
    btnCalcular.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Calculando...
    `;

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoUsuario: query })
      });

      if (!res.ok) {
        const rawErr = await res.text().catch(()=>'');
        throw new Error(`HTTP ${res.status} ${res.statusText} -> ${rawErr}`);
      }

      const raw = await res.text();           // siempre como texto
      if (!raw) {
        resultadoTexto.textContent = 'Sin respuesta del servidor.';
        show(divResultado);
        return;
      }

      // intenta JSON; si no, muestra texto plano
      let data;
      try { data = JSON.parse(raw); } catch { data = raw; }

      const respuesta =
        (typeof data === 'string') ? data :
        data.respuestaCalculada ??
        data.resultado ??
        data.result ??
        JSON.stringify(data);

      resultadoTexto.textContent = respuesta;
      show(divResultado);

    } catch (err) {
      console.error(err);
      errorTexto.textContent = String(err.message || err);
      show(divError);
    } finally {
      btnCalcular.disabled = false;
      btnCalcular.innerHTML = btnLabelOriginal;
    }
  }

  btnCalcular.addEventListener('click', () => {
    const q = textoOperacion.value.trim();
    if (!q) { textoOperacion.focus(); return; }
    calcular(q);
  });

  // Enviar con Ctrl+Enter
  textoOperacion.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      const q = textoOperacion.value.trim();
      if (!q) return;
      calcular(q);
    }
  });
});
