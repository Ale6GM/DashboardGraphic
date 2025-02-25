import Chart from "chart.js/auto";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { jsPDF } from "jspdf";

// Declaracion de variables globales
let botonCerrar = document.getElementById("cerrarGrafico");
let botonExportar = document.getElementById("exportarGrafico");
let botonGenerarGrafico = document.getElementById("generarGrafico");
let grafico = null;
let nuevoGrafico = document.getElementById("nuevoGrafico");
let areaParametros = document.getElementById("config");
let cerrarParametros = document.getElementById("cerrarParametros");
let tipoGrafico = document.getElementById("tipoGrafico");
let selectorDatos = document.getElementById("selectorDatos");
let leyenda = document.getElementById('leyenda');
let menu = document.getElementById('menuOpciones');

// variables de los vinculos primarios del dashboard
const vinculoRecursos = document.getElementById('vinculoRecursos');
const vinculoCostos = document.getElementById('vinculoCostosMensuales');
const vinculoRHumanos = document.getElementById('vinculoRHumanos');
const vinculoProduccion = document.getElementById('vinculoProdDiaria');



// funcion generica para mostrar los paneles
const mostrarPaneles = (panel) => {
  panel.classList.toggle('visible');
};


// Eventos para mostrar y ocultar los parametros de configuracion del grafico
nuevoGrafico.addEventListener("click", () => {
  mostrarPaneles(areaParametros);
});

// evento para mostrar el panel desde el dropdown
menu.addEventListener('click', () => {
  mostrarPaneles(areaParametros);
})



cerrarParametros.addEventListener("click", () => {
  areaParametros.classList.remove("visible");
  //areaParametros.style.display = 'none';
});

// Recursos por Categorias
const generarGraficoRecursosPorCategorias = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Realizamos la consulta de los datos al endPoint
    const response = await fetch("http://matconsapi.test/api/recursos");
    const recursos = await response.json();

    // Preparamos los datos para pasarselos al grafico
    const data = {
      labels: recursos.map((nombre) => nombre.nombre),
      datasets: [
        {
          data: recursos.map((cantidad) => cantidad.cantidad),
          borderWidth: 1,
          borderColor: styles.color.solids.map((color) => color),
          backgroundColor: styles.color.alphas.map((color) => color),
          tension: 0.5,
          fill: true,
          pointBorderWidth: 5,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    };

    // Configuracion de las opciones del grafico  
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Recursos por Categorias",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresado en Toneladas Métricas",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
        scale: {
          gridLines: {
            color: "#fff",
          },
          ticks: {
            display: "false",
          },
        },
      },
    };
    // Creamos el grafico
    grafico = new Chart("grafico", { type: tipoGrafico.value, data, options });

    // Mostramos un mensaje de exito
    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// funcion para generar el grafico de los recursos por su ubicacion

const generarGraficoRecursosPorUbicacion = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;
    const response = await fetch("http://matconsapi.test/api/recursosPorUbicacion");
    const recursos = await response.json();

    const ubicacionesUnicas = [
      ...new Set(recursos.map((item) => item.ubicacion)),
    ];
    const materialesUnicos = [...new Set(recursos.map((item) => item.mineral))];

    const data = {
      labels: ubicacionesUnicas,
      datasets: materialesUnicos.map((material) => ({
        label: material,
        data: ubicacionesUnicas.map((ubicacion) => {
          const encontrado = recursos.find(
            (r) => r.ubicacion === ubicacion && r.mineral === material
          );
          return encontrado ? encontrado.cantidad : 0;
        }),
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        borderWidth: 1,
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      })),
    };

    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Recursos por Ubicación",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresado en Toneladas Métricas",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };

    grafico = new Chart("grafico", { type: tipoGrafico.value, data, options });

    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// funcion para generar el grafico de la proporcion de los recursos con respecto al inventario general
const generarGraficoProporcion = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;
    const response = await fetch(
      "http://matconsapi.test/api/recursosProporcion"
    );
    const recursos = await response.json();
    const data = {
      labels: recursos.map((nombre) => nombre.nombre),
      datasets: [
        {
          label: "Proporción con respecto al Inventario",
          data: recursos.map((cantidad) => cantidad.porciento),
          borderWidth: 1,
          borderColor: styles.color.solids.map((color) => color),
          backgroundColor: styles.color.alphas.map((color) => color),
          tension: 0.5,
          fill: true,
          pointBorderWidth: 5,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    };
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Proporción con respecto al Inventario General",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresado en Tanto por Ciento",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scales: {
        x: {
          // Configuración del eje X
          beginAtZero: true,
          ticks: {
            display: true,
          },
        },
        y: {
          // Configuración del eje Y (si es necesario)
          beginAtZero: true,
          max: 100, // Fijar el máximo en 100%
          ticks: {
            stepSize: 10, // Incrementos de 10%
            callback: function (value) {
              return value + "%"; // Agregar símbolo de porcentaje
            },
          },
        },
      },
    };
    grafico = new Chart("grafico", { type: tipoGrafico.value, data, options });

    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// Funcion para generar el grafico de los costos mensuales de producción
const generarGraficoCostosMensuales = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Realizamos la consulta de los datos al endPoint
    const response = await fetch("http://matconsapi.test/api/costos");
    const costos = await response.json();

    // preparamos los datos para el grafico
    const labels = costos.map((item) => item.mes);
    const datasets = [
      {
        label: "Combustible",
        data: costos.map((item) => item.Combustible),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Electricidad",
        data: costos.map((item) => item.Electricidad),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Trasporte",
        data: costos.map((item) => item.Transporte),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Alimentación",
        data: costos.map((item) => item.Alimentacion),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
    ];
    // Definimos las Opciones del grafico
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Costos Mensuales de Producción",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresados en Pesos",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };
    // creamos el grafico
    grafico = new Chart("grafico", {
      type: tipoGrafico.value,
      data: {
        labels: labels,
        datasets: datasets,
      },
      options,
    });
    // Si el grafico se crea correctamente aparece el mensaje de exito
    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// funcion para generar los costos por trimestres
const agruparPorTrimestre = (costos) => {
  const trimestres = {};
  costos.forEach((item, index) => {
    const trimestre = Math.floor(index / 3) + 1;
    if (!trimestres[trimestre]) {
      trimestres[trimestre] = {
        Combustible: 0,
        Electricidad: 0,
        Transporte: 0,
        Alimentacion: 0,
      };
    }
    // sumamos los valores en cada categoria
    trimestres[trimestre].Combustible += item.Combustible;
    trimestres[trimestre].Electricidad += item.Electricidad;
    trimestres[trimestre].Transporte += item.Transporte;
    trimestres[trimestre].Alimentacion += item.Alimentacion;
  });
  return trimestres;
};

// funcion para generar los costos semestrales de produccion
const agruparPorSemestre = (costos) => {
  const semestres = {};
  costos.forEach((item, index) => {
    const semestre = Math.floor(index / 6) + 1;
    if (!semestres[semestre]) {
      semestres[semestre] = {
        Combustible: 0,
        Electricidad: 0,
        Transporte: 0,
        Alimentacion: 0,
      };
    }
    // sumamos los valores en cada categoria
    semestres[semestre].Combustible += item.Combustible;
    semestres[semestre].Electricidad += item.Electricidad;
    semestres[semestre].Transporte += item.Transporte;
    semestres[semestre].Alimentacion += item.Alimentacion;
  });
  return semestres;
};

// funcion para agrupar costos anuales

const agruparPorAno = (costos) => {
  const anos = {};
  costos.forEach((item, index) => {
    const ano = Math.floor(index / 12) + 1;
    if (!anos[ano]) {
      anos[ano] = {
        Combustible: 0,
        Electricidad: 0,
        Transporte: 0,
        Alimentacion: 0,
      };
    }
    // sumamos los valores en cada categoria
    anos[ano].Combustible += item.Combustible;
    anos[ano].Electricidad += item.Electricidad;
    anos[ano].Transporte += item.Transporte;
    anos[ano].Alimentacion += item.Alimentacion;
  });
  return anos;
};

// funcion para generar los costos trimestralas de produccion

const generarGraficoCostosTrimestrales = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Realizamos la consulta de los datos al endPoint
    const response = await fetch("http://matconsapi.test/api/costos");
    const costos = await response.json();
    const datosTrimestrales = agruparPorTrimestre(costos);

    // preparamos los datos para el grafico
    const labels = Object.keys(datosTrimestrales).map(
      (item) => `Trimestre ${item}`
    );
    const datasets = [
      {
        label: "Combustible",
        data: Object.values(datosTrimestrales).map((item) => item.Combustible),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Electricidad",
        data: Object.values(datosTrimestrales).map((item) => item.Electricidad),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Trasporte",
        data: Object.values(datosTrimestrales).map((item) => item.Transporte),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Alimentación",
        data: Object.values(datosTrimestrales).map((item) => item.Alimentacion),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
    ];
    // Definimos las Opciones del grafico
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Costos Trimestrales de Producción",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresados en Pesos",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };

    grafico = new Chart("grafico", {
      type: tipoGrafico.value,
      data: {
        labels: labels,
        datasets: datasets,
      },
      options,
    });
    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// funcion para generar el grafico de los costos semestrales de produccion
const generarGraficoCostosSemestrales = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Realizamos la consulta de los datos al endPoint
    const response = await fetch("http://matconsapi.test/api/costos");
    const costos = await response.json();
    const datosSemestrales = agruparPorSemestre(costos);
    // preparamos los datos para el grafico
    const labels = Object.keys(datosSemestrales).map(
      (item) => `Semestre ${item}`
    );
    const datasets = [
      {
        label: "Combustible",
        data: Object.values(datosSemestrales).map((item) => item.Combustible),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Electricidad",
        data: Object.values(datosSemestrales).map((item) => item.Electricidad),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Trasporte",
        data: Object.values(datosSemestrales).map((item) => item.Transporte),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Alimentación",
        data: Object.values(datosSemestrales).map((item) => item.Alimentacion),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
    ];
    // Definimos las Opciones del grafico
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Costos Semestrales de Producción",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresados en Pesos",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };

    // creamos el grafico
    grafico = new Chart("grafico", {
      type: tipoGrafico.value,
      data: {
        labels: labels,
        datasets: datasets,
      },
      options,
    });
    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// funcion para generar los costos anuales de produccion
const generarGrficoCostosAnuales = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Realizamos la consulta de los datos al endPoint
    const response = await fetch("http://matconsapi.test/api/costos");
    const costos = await response.json();
    const datosAnuales = agruparPorAno(costos);
    console.log(datosAnuales);
    // preparamos los datos para montarlos en el grafico.
    const labels = Object.keys(datosAnuales).map((item) => `Año ${item}`);
    const datasets = [
      {
        label: "Combustible",
        data: Object.values(datosAnuales).map((item) => item.Combustible),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Electricidad",
        data: Object.values(datosAnuales).map((item) => item.Electricidad),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Trasporte",
        data: Object.values(datosAnuales).map((item) => item.Transporte),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Alimentación",
        data: Object.values(datosAnuales).map((item) => item.Alimentacion),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
    ];
    // Definimos las Opciones del grafico
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Costos Anuales de Producción",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresados en Pesos",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };

    // creamos el grafico
    grafico = new Chart("grafico", {
      type: tipoGrafico.value,
      data: {
        labels: labels,
        datasets: datasets,
      },
      options,
    });
    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// Funcion para generar el grafico de los recursos Humanos

const generarGraficoRecursosHumanos = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Consultamos los datos al endpoint
    const response = await fetch("http://matconsapi.test/api/recursos_humanos");
    const recursosHumanos = await response.json();

    // preparamos los datos del grafico
    const data = {
      labels: recursosHumanos.map((item) => item.categoria),
      datasets: [
        {
          label: "Categorias",
          data: recursosHumanos.map((item) => item.cantidad),
          borderWidth: 1,
          borderColor: styles.color.solids.map((color) => color),
          backgroundColor: styles.color.alphas.map((color) => color),
          tension: 0.5,
          fill: true,
          pointBorderWidth: 5,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Recursos Humanos del Proyecto",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        scale: {
          gridLines: {
            color: "#fff",
          },
          ticks: {
            display: "false",
          },
        },
      },
    };

    grafico = new Chart("grafico", {
      type: tipoGrafico.value,
      data,
      options,
    });

    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

const generarGraficoProduccionPorTurnos = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // consultamos los datos al endpint
    const response = await fetch(
      "http://matconsapi.test/api/produccion_turnos"
    );
    const produccion = await response.json();

    // preparamos los datos para el grafico
    const labels = produccion.map((item) => `Turno ${item.turno}`);
    const datasets = [
      {
        label: "Cemento",
        data: produccion.map((item) => item.Cemento),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Bloques",
        data: produccion.map((item) => item.Bloques),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Mortero",
        data: produccion.map((item) => item.Mortero),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Hormigon",
        data: produccion.map((item) => item.Hormigon),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
    ];
    const options = {
      plugins: {
        legend: {
          diplay: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Producción Diaria por turnos de Trabajo",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresados en Toneladas Métricas",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };
    grafico = new Chart("grafico", {
      type: tipoGrafico.value,
      data: {
        labels: labels,
        datasets: datasets,
        options,
      },
    });

    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

const generarGraficoDeMaterialesPorProducto = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // consultamos los datos al endpint
    const response = await fetch(
      "http://matconsapi.test/api/materiales_por_producto"
    );
    const productosMateriales = await response.json();

    // preparamos los datos para pasarlos al grafico
    let labels = productosMateriales.map((item) => item.producto);

    let materiales = [
      ...new Set(
        productosMateriales.flatMap((item) =>
          Object.keys(item).filter((keys) => keys !== "producto")
        )
      ),
    ];

    let datasets = materiales.map((material) => {
      return {
        label: material,
        data: productosMateriales.map((item) => item[material]),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      };
    });

    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Materiales Usados por Producto Producido",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Por cada Tonelada de Producto",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };

    grafico = new Chart("grafico", {
      type: tipoGrafico.value,
      data: {
        labels: labels,
        datasets: datasets,
      },
      options,
    });

    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

// funcion que escucha los eventos click en el boton de generar grafico
botonGenerarGrafico.addEventListener("click", () => {
  if (selectorDatos.value === "" || tipoGrafico.value === "") {
    Swal.fire({
      title: "Error",
      text: "Debe seleccionar un tipo de grafico y los Datos a Graficar",
      icon: "error",
    });
  } else if (selectorDatos.value == "rPC") {
    generarGraficoRecursosPorCategorias();
  } else if (selectorDatos.value == "rPU") {
    generarGraficoRecursosPorUbicacion();
  } else if (selectorDatos.value == "pCRIG") {
    generarGraficoProporcion();
  } else if (selectorDatos.value == "cMP") {
    generarGraficoCostosMensuales();
  } else if (selectorDatos.value == "cTP") {
    generarGraficoCostosTrimestrales();
  } else if (selectorDatos.value == "cSP") {
    generarGraficoCostosSemestrales();
  } else if (selectorDatos.value == "cAP") {
    generarGrficoCostosAnuales();
  } else if (selectorDatos.value == "rRHH") {
    generarGraficoRecursosHumanos();
  } else if (selectorDatos.value == "pDTT") {
    generarGraficoProduccionPorTurnos();
  } else if (selectorDatos.value == "rUP") {
    generarGraficoDeMaterialesPorProducto();
  }
});

// funcion para cerrar el grafico
botonCerrar.addEventListener("click", () => {
  // Verificar si hay un gráfico generado antes de continuar
  const canvas = document.getElementById("grafico");
  if (!grafico) {
    Swal.fire({
      title: "Error",
      text: "Aún no hay un gráfico generado.",
      icon: "error",
    });
    return;
  }

  if (
    canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height)
      .data.every((v) => v === 0)
  ) {
    Swal.fire({
      title: "Error",
      text: "No hay gráfico para Cerrar.",
      icon: "error",
    });
    return;
  }

  // Mostrar SweetAlert para confirmar la eliminación
  Swal.fire({
    title: "¿Estás seguro que deseas cerrar el gráfico?",
    text: "Esta acción no es reversible!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    cancelButtonText: "Cancelar",
    confirmButtonText: "Eliminar!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Limpiar el gráfico
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el contenido del canvas
      }

      // destruyo el grafico
      grafico.destroy();

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "Eliminado!",
        text: "El gráfico ha sido eliminado correctamente.",
        icon: "success",
      });
    }
  });
});

// funcion para exportar el grafico
botonExportar.addEventListener("click", async () => {
  try {
    // Verificar si hay un gráfico generado antes de continuar
    if (!grafico) {
      Swal.fire({
        title: "Error",
        text: "Aún no hay un Gráfico Generado",
        icon: "error",
      });
      return; // Salir temprano si no hay gráfico
    }

    // Obtener el canvas del gráfico
    const canvas = document.getElementById("grafico");
    if (
      canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height)
        .data.every((v) => v === 0)
    ) {
      Swal.fire({
        title: "Error",
        text: "No hay gráfico para exportar.",
        icon: "error",
      });
      return;
    }

    // Definir las opciones de formato disponibles
    const inputOptions = {
      PDF: "Exportar como PDF",
      PNG: "Exportar como PNG",
    };

    // Mostrar SweetAlert para seleccionar el formato
    const { value: formato } = await Swal.fire({
      title: "Selecciona el Formato",
      input: "radio",
      inputOptions,
      inputValidator: (value) => {
        if (!value) {
          return "Debes Seleccionar uno de los Dos!";
        }
      },
    });

    // Si no se seleccionó ningún formato, salir temprano
    if (!formato) return;

    // Procesar según el formato seleccionado
    if (formato === "PDF") {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();

      // Calcular proporción correcta para el gráfico
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Agregar imagen al PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Guardar PDF
      pdf.save("mi-grafico.pdf");

      // Confirmación de selección
      Swal.fire({
        title: "Exportación Exitosa",
        text: "El gráfico ha sido exportado en formato PDF.",
        icon: "success",
      });
    } else if (formato === "PNG") {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "grafico.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Confirmación de selección
      Swal.fire({
        title: "Descarga Iniciada",
        text: "El gráfico se está descargando en formato PNG.",
        icon: "success",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Ocurrió un error al exportar el gráfico. Por favor, inténtalo de nuevo.",
      icon: "error",
    });
    console.error("Error:", error);
  }
});

// funciones para mostrar los graficos desde los vinculos de las targetas principales del dashboard

const generarGraficoRecursosPorCategoriasVinculo = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Realizamos la consulta de los datos al endPoint
    const response = await fetch("http://matconsapi.test/api/recursos");
    const recursos = await response.json();

    // Preparamos los datos para pasarselos al grafico
    const data = {
      labels: recursos.map((nombre) => nombre.nombre),
      datasets: [
        {
          data: recursos.map((cantidad) => cantidad.cantidad),
          borderWidth: 1,
          borderColor: styles.color.solids.map((color) => color),
          backgroundColor: styles.color.alphas.map((color) => color),
          tension: 0.5,
          fill: true,
          pointBorderWidth: 5,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    };

    // Configuracion de las opciones del grafico  
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Recursos por Categorias",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresado en Toneladas Métricas",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
        scale: {
          gridLines: {
            color: "#fff",
          },
          ticks: {
            display: "false",
          },
        },
      },
    };
    // Creamos el grafico
    grafico = new Chart("grafico", { type: 'bar', data, options });

    // Mostramos un mensaje de exito
    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

const generarGraficoCostosMensualesVinculo = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Realizamos la consulta de los datos al endPoint
    const response = await fetch("http://matconsapi.test/api/costos");
    const costos = await response.json();

    // preparamos los datos para el grafico
    const labels = costos.map((item) => item.mes);
    const datasets = [
      {
        label: "Combustible",
        data: costos.map((item) => item.Combustible),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Electricidad",
        data: costos.map((item) => item.Electricidad),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Trasporte",
        data: costos.map((item) => item.Transporte),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Alimentación",
        data: costos.map((item) => item.Alimentacion),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
    ];
    // Definimos las Opciones del grafico
    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Costos Mensuales de Producción",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresados en Pesos",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };
    // creamos el grafico
    grafico = new Chart("grafico", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
      },
      options,
    });
    // Si el grafico se crea correctamente aparece el mensaje de exito
    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

const generarGraficoRecursosHumanosVinculo = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // Consultamos los datos al endpoint
    const response = await fetch("http://matconsapi.test/api/recursos_humanos");
    const recursosHumanos = await response.json();

    // preparamos los datos del grafico
    const data = {
      labels: recursosHumanos.map((item) => item.categoria),
      datasets: [
        {
          label: "Categorias",
          data: recursosHumanos.map((item) => item.cantidad),
          borderWidth: 1,
          borderColor: styles.color.solids.map((color) => color),
          backgroundColor: styles.color.alphas.map((color) => color),
          tension: 0.5,
          fill: true,
          pointBorderWidth: 5,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    };

    const options = {
      plugins: {
        legend: {
          display: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Recursos Humanos del Proyecto",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        scale: {
          gridLines: {
            color: "#fff",
          },
          ticks: {
            display: "false",
          },
        },
      },
    };

    grafico = new Chart("grafico", {
      type: 'bar',
      data,
      options,
    });

    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

const generarGraficoProduccionPorTurnosVinculo = async () => {
  try {
    // manejamos el array para la posicion de la Leyenda en el grafico
    const checkBoxesLeyenda = document.getElementsByClassName('casillas');
    let posicion = null;
    posicion = Array.from(checkBoxesLeyenda).find(item => item.checked)?.value || null;

    // consultamos los datos al endpint
    const response = await fetch(
      "http://matconsapi.test/api/produccion_turnos"
    );
    const produccion = await response.json();

    // preparamos los datos para el grafico
    const labels = produccion.map((item) => `Turno ${item.turno}`);
    const datasets = [
      {
        label: "Cemento",
        data: produccion.map((item) => item.Cemento),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Bloques",
        data: produccion.map((item) => item.Bloques),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Mortero",
        data: produccion.map((item) => item.Mortero),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
      {
        label: "Hormigon",
        data: produccion.map((item) => item.Hormigon),
        borderWidth: 1,
        borderColor: styles.color.solids.map((color) => color),
        backgroundColor: styles.color.alphas.map((color) => color),
        tension: 0.5,
        fill: true,
        pointBorderWidth: 5,
        borderRadius: 5,
        borderSkipped: false,
      },
    ];
    const options = {
      plugins: {
        legend: {
          diplay: leyenda.checked,
          position: posicion,
        },
        title: {
          display: true,
          text: "Producción Diaria por turnos de Trabajo",
          font: {
            family: "Poppins",
            size: 20,
            weight: "bold",
          }
        },
        subtitle: {
          display: true,
          text: "Expresados en Toneladas Métricas",
          color: "black",
          font: {
            size: 12,
            family: "Poppins",
            weight: "normal",
            style: "italic",
          },
          padding: {
            bottom: 10,
          },
        },
      },
      scale: {
        gridLines: {
          color: "#fff",
        },
        ticks: {
          display: "false",
        },
      },
    };
    grafico = new Chart("grafico", {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets,
        options,
      },
    });

    Swal.fire({
      title: "Generación Exitosa",
      text: "El grafico ha sido generado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(
      "No se pudieron obtener los datos del endpoint:",
      error.message
    );
  }
};

vinculoRecursos.addEventListener('click', () => {
  generarGraficoRecursosPorCategoriasVinculo();
});

vinculoCostos.addEventListener('click', () => {
  generarGraficoCostosMensualesVinculo();
});

vinculoRHumanos.addEventListener('click', () => {
  generarGraficoRecursosHumanosVinculo();
});

vinculoProduccion.addEventListener('click', () => {
  generarGraficoProduccionPorTurnosVinculo();
});