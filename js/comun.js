export const MI_EQUIPO = "VERGOSOS C.F";
export const JUGADORES = [ "Rubén", 
                          "Varopa" , 
                          "Alex", 
                          "Dani", 
                          "Beto", 
                          "Manu",
                          "Ramón",
                          "Jaime",
                          "Carlitos",
                          "Gero",
                          "Muri",
                          "Chiqui", 
                          "Hugo", 
                          "Gamazo",
                          "Carluski"
                         ];

export function idPartido(jornada, partido) {
  return `J${jornada} ${partido.local} vs ${partido.visitante}`;
}

export async function cargarCalendario() {
  const respuesta = await fetch("data/calendario.json");
  const datos = await respuesta.json();
  return datos;
}
