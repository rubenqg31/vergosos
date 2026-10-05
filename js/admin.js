import { db, auth } from "./firebase.js";
import { MI_EQUIPO, JUGADORES, idPartido, cargarCalendario } from "./comun.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let calendario = null;
// ---------- Entrar y salir ----------

document.getElementById("boton-entrar").addEventListener("click", () => {
  signInWithPopup(auth, new GoogleAuthProvider()).catch((error) => {
    document.getElementById("estado-sesion").textContent = `❌ No se pudo entrar: ${error.code}`;
  });
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
  let detalles ="";
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
    if(esNuestro){
      detalles =pintarDetalles(resultado);
    }
  }
  lista.innerHTML = html + detalles;
  activarDetalles();
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

        const datosPartido = {
        jornada: jornada.jornada,
        local: partido.local,
        visitante: partido.visitante,
        golesLocal: Number(golesLocal),
        golesVisitante: Number(golesVisitante)
      };

      const esNuestro = partido.local === MI_EQUIPO || partido.visitante === MI_EQUIPO;
      if (esNuestro) {
        Object.assign(datosPartido, leerDetalles());
      }

      await setDoc(doc(db, "resultados", idPartido(jornada.jornada, partido)), datosPartido, { merge: true });

      guardados++;
    }
    mensaje.textContent = `✅ Guardados ${guardados} resultados de la jornada ${jornada.jornada}.`;
  } catch (error) {
    mensaje.textContent = `❌ No se pudo guardar: ${error.message}`;
  }
}
// ---------- Detalles de Vergosos ----------

function opcionesJugadores(elegido, textoVacio) {
  let html = "";
  if (textoVacio) {
    html += `<option value="">${textoVacio}</option>`;
  }
  for (const nombre of JUGADORES) {
    html += `<option value="${nombre}" ${nombre === elegido ? "selected" : ""}>${nombre}</option>`;
  }
  return html;
}
function filaGol (gol = {}){
  return `
     <div class="fila-detalle fila-gol">
      ⚽ <select class="goleador">${opcionesJugadores(gol.jugador)}</select>
      🅰️ <select class="asistente">${opcionesJugadores(gol.asistencia, "Sin asistencia")}</select>
      <button type="button" class="quitar">✕</button>
    </div>`;
}
function filaTarjeta(tarjeta = {}) {
  return `
    <div class="fila-detalle fila-tarjeta">
      <select class="jugador-tarjeta">${opcionesJugadores(tarjeta.jugador)}</select>
      <select class="tipo-tarjeta">
        <option value="amarilla" ${tarjeta.tipo === "amarilla" ? "selected" : ""}>🟨 Amarilla</option>
        <option value="roja" ${tarjeta.tipo === "roja" ? "selected" : ""}>🟥 Roja</option>
      </select>
      <button type="button" class="quitar">✕</button>
    </div>`;
}
function pintarDetalles (resultado) {
  const jugaron = resultado.jugaron ?? [];
  let casillas = "";
  for (const nombre of JUGADORES){
    casillas += `
      <label class="casilla">
        <input type="checkbox" value="${nombre}" ${jugaron.includes(nombre) ? "checked" : ""}> ${nombre}
      </label>`;
  }
let goles ="";
  for (const gol of resultado.goles ?? []){
    goles += filaGol(gol);
  }
  let tarjetas ="";
  for (const tarjeta of resultado.tarjetas ?? []) {
    tarjetas += filaTarjeta(tarjeta);
  }
    return `
    <div id="detalles">
      <h3>Detalles de Vergosos</h3>

      <h4>¿Quién jugó?</h4>
      <div id="lista-jugaron">${casillas}</div>

      <h4>Goles</h4>
      <div id="lista-goles">${goles}</div>
      <button type="button" id="anadir-gol">+ Añadir gol</button>

      <h4>Tarjetas</h4>
      <div id="lista-tarjetas">${tarjetas}</div>
      <button type="button" id="anadir-tarjeta">+ Añadir tarjeta</button>

      <h4>MVP</h4>
      <select id="mvp">${opcionesJugadores(resultado.mvp, "Nadie")}</select>
    </div>`;
}
function activarDetalles() {
  const detalles = document.getElementById("detalles");
  if (!detalles) return;

  document.getElementById("anadir-gol").addEventListener("click", () => {
    document.getElementById("lista-goles").insertAdjacentHTML("beforeend", filaGol());
  });

  document.getElementById("anadir-tarjeta").addEventListener("click", () => {
    document.getElementById("lista-tarjetas").insertAdjacentHTML("beforeend", filaTarjeta());
  });

  detalles.addEventListener("click", (evento) => {
    if (evento.target.classList.contains("quitar")) {
      evento.target.parentElement.remove();
    }
  });
}
function leerDetalles() {
  const goles = [];
  for (const fila of document.querySelectorAll(".fila-gol")) {
    goles.push({
      jugador: fila.querySelector(".goleador").value,
      asistencia: fila.querySelector(".asistente").value || null
    });
  }

  const tarjetas = [];
  for (const fila of document.querySelectorAll(".fila-tarjeta")) {
    tarjetas.push({
      jugador: fila.querySelector(".jugador-tarjeta").value,
      tipo: fila.querySelector(".tipo-tarjeta").value
    });
  }

  const jugaron = [];
  for (const casilla of document.querySelectorAll("#lista-jugaron input:checked")) {
    jugaron.push(casilla.value);
  }

  const mvp = document.getElementById("mvp").value || null;

  return { goles, tarjetas, jugaron, mvp };
}  

