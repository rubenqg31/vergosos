import { MI_EQUIPO, JUGADORES, cargarCalendario, cargarResultados, juntarResultados } from "./comun.js";

function calcularEstadisticas (datos) {
  const tabla = {};
  function filaDe (nombre) {
    if (!tabla[nombre]) {
      tabla [nombre] ={nombre : nombre, pj:0 , goles: 0, asistencias: 0, amarillas: 0, rojas: 0, mvp: 0 };
    }
    return tabla [nombre];
  }
   JUGADORES.forEach(nombre => filaDe(nombre));
  for (const jornada of datos.jornadas) {
    for (const partido of jornada.partidos) {
      for (const nombre of partido.jugaron ?? []) {
        filaDe(nombre).pj++;
      }
      for (const gol of partido.goles ?? []) {
        filaDe(gol.jugador).goles++;
        if (gol.asistencia) filaDe(gol.asistencia).asistencias++;
      }
      for (const tarjeta of partido.tarjetas ?? []) {
        if (tarjeta.tipo === "amarilla") filaDe(tarjeta.jugador).amarillas++;
        else filaDe(tarjeta.jugador).rojas++;
      }
      if (partido.mvp) filaDe(partido.mvp).mvp++;
    }
  }
const lista = Object.values(tabla);
  lista.sort((a, b) =>
    b.goles - a.goles ||
    b.asistencias - a.asistencias ||
    b.pj - a.pj
  );
  return lista;
}
function pintarEstadisticas(lista) {
  const cuerpo = document.getElementById("tabla-estadisticas");
  let html = "";

  for (const fila of lista) {
    html += `
      <tr>
        <td class="nombre">${fila.nombre}</td>
        <td>${fila.pj}</td>
        <td><strong>${fila.goles}</strong></td>
        <td>${fila.asistencias}</td>
        <td>${fila.amarillas}</td>
        <td>${fila.rojas}</td>
        <td>${fila.mvp}</td>
      </tr>`;
  }

  cuerpo.innerHTML = html;
}
function resumenGoles(partido) {
  const cuenta = {};
  for (const gol of partido.goles ?? []) {
    cuenta[gol.jugador] = (cuenta[gol.jugador] ?? 0) + 1;
  }

  const trozos = [];
  for (const nombre in cuenta) {
    trozos.push(cuenta[nombre] > 1 ? `${nombre} (${cuenta[nombre]})` : nombre);
  }
  return trozos.join(", ");
}
function pintarPartidos(datos) {
  const lista = document.getElementById("lista-jugados");
  let html = "";

  for (const jornada of datos.jornadas) {
    for (const partido of jornada.partidos) {
      const enCasa = partido.local === MI_EQUIPO;
      const fuera = partido.visitante === MI_EQUIPO;
      if (!enCasa && !fuera) continue;
      if (partido.golesLocal === undefined) continue;

      const goleadores = resumenGoles(partido);

      html += `
        <li>
          <p><strong>J${jornada.jornada}</strong> · ${partido.local} ${partido.golesLocal} - ${partido.golesVisitante} ${partido.visitante}</p>
          ${goleadores ? `<p>⚽ ${goleadores}</p>` : ""}
          ${partido.mvp ? `<p>⭐ MVP: ${partido.mvp}</p>` : ""}
        </li>`;
    }
  }

  lista.innerHTML = html || "<li>Todavía no hay partidos jugados.</li>";
}
async function iniciar() {
  const datos = await cargarCalendario();
  const resultados = await cargarResultados();
  juntarResultados(datos, resultados);
  pintarEstadisticas(calcularEstadisticas(datos));
  pintarPartidos(datos);
}

iniciar();
