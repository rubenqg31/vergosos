import { db, auth } from "./firebase.js";
import { MI_EQUIPO, idPartido, cargarCalendario } from "./comun.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let calendario = null;
// ---------- Entrar y salir ----------

document.getElementById("boton-entrar").addEventListener("click", () => {
  signInWithPopup(auth, new GoogleAuthProvider());
});

document.getElementById("boton-salir").addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, async (usuario) => {
  const estado = document.getElementById("estado-sesion");
  const botonEntrar = document.getElementById("boton-entrar");
  const botonSalir = document.getElementById("boton-salir");
  const panel = document.getElementById("panel");

  if (usuario) {
    estado.textContent = `Hola, ${usuario.displayName}. Tu UID es: ${usuario.uid}`;
    botonEntrar.hidden = true;
    botonSalir.hidden = false;
    panel.hidden = false;

    if (calendario === null) {
      calendario = await cargarCalendario();
      prepararSelector();
    }
  } else {
    estado.textContent = "No has iniciado sesión.";
    botonEntrar.hidden = false;
    botonSalir.hidden = true;
    panel.hidden = true;
  }
});
// ---------- Elegir jornada ----------

function prepararSelector() {
  const selector = document.getElementById("selector-jornada");
  let html = "";
  for (const jornada of calendario.jornadas) {
    html += `<option value="${jornada.jornada}">Jornada ${jornada.jornada}</option>`;
  }
  selector.innerHTML = html;
  selector.addEventListener("change", pintarJornada);
  pintarJornada();
}

function jornadaElegida() {
  const numero = Number(document.getElementById("selector-jornada").value);
  return calendario.jornadas.find((jornada) => jornada.jornada === numero);
}

// ---------- Pintar el formulario ----------

async function pintarJornada() {
  const jornada = jornadaElegida();
  const lista = document.getElementById("lista-resultados");
  document.getElementById("mensaje").textContent = "";
  lista.innerHTML = "Cargando...";

  let html = "";
  for (let i = 0; i < jornada.partidos.length; i++) {
    const partido = jornada.partidos[i];
    const guardado = await getDoc(doc(db, "resultados", idPartido(jornada.jornada, partido)));
    const resultado = guardado.exists() ? guardado.data() : {};
    const esNuestro = partido.local === MI_EQUIPO || partido.visitante === MI_EQUIPO;

    html += `
      <div class="fila-resultado ${esNuestro ? "nuestro" : ""}">
        <span class="equipo">${partido.local}</span>
        <input type="number" min="0" id="local-${i}" value="${resultado.golesLocal ?? ""}">
        <span>-</span>
        <input type="number" min="0" id="visitante-${i}" value="${resultado.golesVisitante ?? ""}">
        <span class="equipo">${partido.visitante}</span>
      </div>`;
  }
  lista.innerHTML = html;
}

// ---------- Guardar ----------

document.getElementById("boton-guardar").addEventListener("click", guardarJornada);

async function guardarJornada() {
  const jornada = jornadaElegida();
  const mensaje = document.getElementById("mensaje");
  let guardados = 0;

  try {
    for (let i = 0; i < jornada.partidos.length; i++) {
      const partido = jornada.partidos[i];
      const golesLocal = document.getElementById(`local-${i}`).value;
      const golesVisitante = document.getElementById(`visitante-${i}`).value;

      if (golesLocal === "" || golesVisitante === "") continue;

      await setDoc(doc(db, "resultados", idPartido(jornada.jornada, partido)), {
        jornada: jornada.jornada,
        local: partido.local,
        visitante: partido.visitante,
        golesLocal: Number(golesLocal),
        golesVisitante: Number(golesVisitante)
      }, { merge: true });

      guardados++;
    }
    mensaje.textContent = `✅ Guardados ${guardados} resultados de la jornada ${jornada.jornada}.`;
  } catch (error) {
    mensaje.textContent = `❌ No se pudo guardar: ${error.message}`;
  }
}
