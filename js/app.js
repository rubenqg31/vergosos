const MI_EQUIPO = "VERGOSOS C.F";
//

async function cargarCalendario(){
  const respuesta =await fetch ("data/calendario.json");
  const datos = await respuesta.json();
  return datos;
}
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
      const cuando = partido.aplazado ? "Aplazado" : formatearFecha(partido.fechaHora);
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
async function iniciar() {
  const datos = await cargarCalendario();
  const proximo = buscarProximoPartido(datos);
  pintarProximoPartido(proximo);
  pintarCalendario (datos);
}

iniciar();
    
