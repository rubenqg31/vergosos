const MI_EQUIPO = "VERGOSOS C.F";
//
async function cargarCalendario(){
  const respuesta =await fetch ("data/calendario.json");
  const datos = await respuesta.json();
  return datos;
}
function buscarProximoPartido (datos){
  const ahora =new Date();
  const futuros =[];
  for (const jornada of datos.jornadas){
    for(const partido of jornada.partidos){
      const juegaVergosos = partido.local === MI_EQUIPO|| partido.visitante === MI_EQUIPO;
      const fecha =new Date (partido.fechaHora);

    if (juegaVergosos && fecha>hora){
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
  const fecha = new Date(partido.fechaHora);
  const dia =fech.toLocaleDateString("es-ES",{weekday:"long",day:"numeric", month:"long"});
  const hora =fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  seccion.innerHTML = `
    <h2>Próximo partido · Jornada ${partido.jornada}</h2>
    <p class="rival">${partido.local} vs ${partido.visitante}</p>
    <p>${dia}, ${hora}</p>
    <p>Campo: ${partido.campo}</p>
  `;
}
async function iniciar() {
  const datos = await cargarCalendario();
  const proximo = buscarProximoPartido(datos);
  pintarProximoPartido(proximo);
}

iniciar();
    
