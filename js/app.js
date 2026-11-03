
import { MI_EQUIPO, cargarCalendario,cargarResultados,juntarResultados } from "./comun.js";
//

function formatearFecha(fechaHora) {
  const fecha = new Date(fechaHora);
  const dia = fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  const hora = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${dia} · ${hora}`;
}
function nombreCorto(nombre) {
  const sinSiglas = nombre
    .replace(/^(C\.D\.|S\.S\.C\.)\s+/, "")
    .replace(/\s+(F\.C\.|C\.F\.?|FC)$/, "");
  return sinSiglas
    .toLowerCase()
    .replace(/(^|\s)\S/g, letra => letra.toUpperCase())
    .replace(/ (Of|De|La|El) /g, palabra => palabra.toLowerCase());
}

// Partidos jugados (o aplazados) de un equipo, vistos desde ese equipo, en orden de jornada
function partidosDe(datos, equipo) {
  const lista = [];
  for (const jornada of datos.jornadas) {
    for (const partido of jornada.partidos) {
      const enCasa = partido.local === equipo;
      const fuera = partido.visitante === equipo;
      if (!enCasa && !fuera) continue;

      const item = {
        jornada: jornada.jornada,
        rival: enCasa ? partido.visitante : partido.local,
        lugar: enCasa ? "C" : "F",
      };

      if (partido.golesLocal !== undefined) {
        item.mios = enCasa ? partido.golesLocal : partido.golesVisitante;
        item.suyos = enCasa ? partido.golesVisitante : partido.golesLocal;
        item.letra = item.mios > item.suyos ? "G" : item.mios < item.suyos ? "P" : "E";
      } else if (partido.aplazado) {
        item.aplazado = true;
      } else {
        continue; // todavía no se ha jugado
      }
      lista.push(item);
    }
  }
  return lista;
}

function htmlRacha(datos, equipo) {
  const jugados = partidosDe(datos, equipo).filter(p => !p.aplazado).slice(-5);
  let filas = "";
  for (let i = 0; i < 5; i++) {
    const p = jugados[i];
    if (p) {
      filas += `
        <div class="bola">
          <span class="circulo ${p.letra}">${p.letra}</span>
          <span class="marcador">${p.mios}-${p.suyos}</span>
          <span class="contra">${nombreCorto(p.rival)}</span>
        </div>`;
    } else {
      filas += `<div class="bola"><span class="circulo hueco">–</span></div>`;
    }
  }
  return `
    <div class="mitad">
      <h3>${nombreCorto(equipo)}</h3>
      <div class="bolas">${filas}</div>
    </div>`;
}
function buscarProximoPartido (datos){
  const ahora =new Date();
  const futuros =[];
  for (const jornada of datos.jornadas){
    for(const partido of jornada.partidos){
      const juegaVergosos = partido.local === MI_EQUIPO|| partido.visitante === MI_EQUIPO;
      const fecha =new Date (partido.fechaHora);

    if (juegaVergosos && fecha> ahora){
      partido.jornada =jornada.jornada;
      futuros.push(partido);
    }
    }
  }
  futuros.sort((a,b)=> new Date(a.fechaHora)-new Date (b.fechaHora));
  return futuros [0];
}
function pintarProximoPartido(partido, datos){
  const seccion =document.getElementById("proximo-partido");
   if (!partido) {
    seccion.innerHTML = "<h2>Próximo partido</h2><p>No quedan partidos esta temporada.</p>";
    return;
  }
  const rival = partido.local === MI_EQUIPO ? partido.visitante : partido.local;
  seccion.innerHTML = `
    <h2>Próximo partido · Jornada ${partido.jornada}</h2>
    <p class="rival">${partido.local} vs ${partido.visitante}</p>
    <p> ${formatearFecha(partido.fechaHora)}</p>
    <p>Campo: ${partido.campo}</p>
    <div class="rachas">
      ${htmlRacha(datos, MI_EQUIPO)}
      ${htmlRacha(datos, rival)}
    </div>
  `;
}
function pintarCalendario(datos){
  const lista =document.getElementById("lista-partidos");
  const ahora =new Date();
  let html ="";
  for (const jornada of datos.jornadas){
    if (jornada.descansa === MI_EQUIPO){
      html += `<li class="descanso"><span class="jornada">J${jornada.jornada}</span> Descansamos</li>`;
      continue;
    }
    for (const partido of jornada.partidos){
      const enCasa =partido.local === MI_EQUIPO;
      const fuera =partido.visitante ===MI_EQUIPO;
      if (!enCasa && !fuera) continue;
      
      const rival = enCasa ? partido.visitante : partido.local;
      const tieneResultado = partido.golesLocal !== undefined;
      const cuando = tieneResultado
      ? `${partido.golesLocal} - ${partido.golesVisitante}`
      : partido.aplazado ? "Aplazado" : formatearFecha(partido.fechaHora);
      const jugado = new Date(partido.fechaHora) < ahora;
     
      html += `
        <li class="${jugado ? "jugado" : ""}">
          <span class="jornada">J${jornada.jornada}</span>
          <span class="rival-lista">${rival}</span>
          <span class="lugar">${enCasa ? "Casa" : "Fuera"}</span>
          <span class="cuando">${cuando}</span>
        </li>`;
    }
  }

  lista.innerHTML = html;
}     
function calcularClasificacion (datos) {
  const tabla ={};
  function filaDe (equipo) {
    if (!tabla[equipo]){
      tabla [equipo] = {equipo : equipo, pj:0,pg:0,pe:0,pp:0, gf: 0, gc: 0, puntos: 0 };
    }
    return tabla[equipo];
  }
  for (const jornada of datos.jornadas){
    for (const partido of jornada.partidos){
      const local = filaDe(partido.local);
      const visitante =filaDe(partido.visitante);

      if(partido.golesLocal === undefined) continue;
      local.pj++;
      visitante.pj++;
      local.gf += partido.golesLocal;
      local.gc += partido.golesVisitante;
      visitante.gf += partido.golesVisitante;
      visitante.gc += partido.golesLocal;

      if (partido.golesLocal> partido.golesVisitante){
        local.pg++;
        visitante.pp++;
        local.puntos +=3;
        } else if (partido.golesLocal < partido.golesVisitante) {
        visitante.pg++;
        local.pp++;
        visitante.puntos += 3;
      } else {
        local.pe++;
        visitante.pe++;
        local.puntos += 1;
        visitante.puntos += 1;
      }
    }
  }
  const lista = Object.values(tabla);
  lista.sort((a, b) =>
    b.puntos - a.puntos ||
    (b.gf - b.gc) - (a.gf - a.gc) ||
    b.gf - a.gf
  );
  return lista;
}
function pintarClasificacion(lista, datos) {
  const cuerpo = document.getElementById("tabla-clasificacion");
  let html = "";

  lista.forEach((fila, i) => {
    const dg = fila.gf - fila.gc;
    const chips = partidosDe(datos, fila.equipo).map(p => {
      const resultado = p.aplazado
        ? `<span class="res A">Apl.</span>`
        : `<span class="res ${p.letra}">${p.mios}-${p.suyos}</span>`;
      return `<span class="peque">${resultado}<span class="j">J${p.jornada}</span>${nombreCorto(p.rival)} <span class="lc">${p.lugar}</span></span>`;
    }).join("");
    html += `
      <tr class="equipo ${fila.equipo === MI_EQUIPO ? "nosotros" : ""}" tabindex="0" aria-expanded="false">
        <td>${i + 1}</td>
        <td class="nombre"><span class="flecha">›</span>${fila.equipo}</td>
        <td>${fila.pj}</td>
        <td>${fila.pg}</td>
        <td>${fila.pe}</td>
        <td>${fila.pp}</td>
        <td>${dg > 0 ? "+" + dg : dg}</td>
        <td><strong>${fila.puntos}</strong></td>
      </tr>
      <tr class="historial" hidden>
        <td colspan="8"><div class="peques">${chips || "Aún no ha jugado"}</div></td>
      </tr>`;
  });

  cuerpo.innerHTML = html;
  cuerpo.querySelectorAll("tr.equipo").forEach(tr => {
    function alternar() {
      const historial = tr.nextElementSibling;
      historial.hidden = !historial.hidden;
      tr.classList.toggle("abierto", !historial.hidden);
      tr.setAttribute("aria-expanded", String(!historial.hidden));
    }
    tr.addEventListener("click", alternar);
    tr.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(); }
    });
  });
}
async function iniciar() {
  const datos = await cargarCalendario();
  const resultados = await cargarResultados();
  juntarResultados(datos,resultados);
  const proximo = buscarProximoPartido(datos);
  pintarProximoPartido(proximo, datos);
  pintarCalendario (datos);
  pintarClasificacion(calcularClasificacion(datos), datos);
}

iniciar();
    
