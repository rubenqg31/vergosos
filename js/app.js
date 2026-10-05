
import { MI_EQUIPO, cargarCalendario,cargarResultados,juntarResultados } from "./comun.js";
//

function formatearFecha(fechaHora) {
  const fecha = new Date(fechaHora);
  const dia = fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  const hora = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${dia} · ${hora}`;
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
function pintarProximoPartido(partido){
  const seccion =document.getElementById("proximo-partido");
   if (!partido) {
    seccion.innerHTML = "<h2>Próximo partido</h2><p>No quedan partidos esta temporada.</p>";
    return;
  }
  seccion.innerHTML = `
    <h2>Próximo partido · Jornada ${partido.jornada}</h2>
    <p class="rival">${partido.local} vs ${partido.visitante}</p>
    <p> ${formatearFecha(partido.fechaHora)}</p>
    <p>Campo: ${partido.campo}</p>
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
function pintarClasificacion(lista) {
  const cuerpo = document.getElementById("tabla-clasificacion");
  let html = "";

  lista.forEach((fila, i) => {
    const dg = fila.gf - fila.gc;
    html += `
      <tr class="${fila.equipo === MI_EQUIPO ? "nosotros" : ""}">
        <td>${i + 1}</td>
        <td class="nombre">${fila.equipo}</td>
        <td>${fila.pj}</td>
        <td>${fila.pg}</td>
        <td>${fila.pe}</td>
        <td>${fila.pp}</td>
        <td>${dg > 0 ? "+" + dg : dg}</td>
        <td><strong>${fila.puntos}</strong></td>
      </tr>`;
  });

  cuerpo.innerHTML = html;
}
async function iniciar() {
  const datos = await cargarCalendario();
  const resultados = await cargarResultados();
  juntarResultados(datos,resultados);
  const proximo = buscarProximoPartido(datos);
  pintarProximoPartido(proximo);
  pintarCalendario (datos);
  pintarClasificacion(calcularClasificacion(datos));
}

iniciar();
    
