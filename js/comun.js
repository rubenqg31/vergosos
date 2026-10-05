
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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
export async function cargarResultados (){
  const resultados={};
  const consulta = await getDocs(collection(db,"resultados"));
  consulta.forEach(doc=>{
    resultados[doc.id]=doc.data();});
  return resultados;
}
export function juntarResultados(datos, resultados){
  for (const jornada of datos.jornadas){
    for (const partido of jornada.partidos){
      const resultado = resultados [idPartido(jornada.jornada, partido)];
      if (resultado){
        Object.assign(partido,resultado);
      }
    }
  }
}
