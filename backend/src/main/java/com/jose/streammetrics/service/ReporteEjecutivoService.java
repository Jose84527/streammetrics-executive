package com.jose.streammetrics.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ActividadPerfilDto;
import com.jose.streammetrics.dto.ConsumoGeneroDto;
import com.jose.streammetrics.dto.ConsumoMercadoDto;
import com.jose.streammetrics.dto.ConsumoPlanDto;
import com.jose.streammetrics.dto.CumplimientoMetaDto;
import com.jose.streammetrics.dto.DesempenoContenidoDto;
import com.jose.streammetrics.dto.FiltroKpiRequest;
import com.jose.streammetrics.dto.ItemEjecutivoDto;
import com.jose.streammetrics.dto.ResumenActividadPerfilesDto;
import com.jose.streammetrics.dto.ResumenConsumoGenerosDto;
import com.jose.streammetrics.dto.ResumenCumplimientoMetasDto;
import com.jose.streammetrics.dto.ResumenDashboardDto;
import com.jose.streammetrics.dto.ResumenDesempenoContenidosDto;
import com.jose.streammetrics.dto.ResumenMercadosDto;
import com.jose.streammetrics.dto.ResumenPlanesDto;
import com.jose.streammetrics.dto.ResumenReporteEjecutivoDto;

@Service
public class ReporteEjecutivoService {

    private final DashboardService dashboardService;
    private final ConsumoService consumoService;
    private final MercadoService mercadoService;
    private final PlanService planService;
    private final MetaService metaService;
    private final PerfilService perfilService;
    private final ContenidoService contenidoService;

    public ReporteEjecutivoService(
            DashboardService dashboardService,
            ConsumoService consumoService,
            MercadoService mercadoService,
            PlanService planService,
            MetaService metaService,
            PerfilService perfilService,
            ContenidoService contenidoService
    ) {
        this.dashboardService = dashboardService;
        this.consumoService = consumoService;
        this.mercadoService = mercadoService;
        this.planService = planService;
        this.metaService = metaService;
        this.perfilService = perfilService;
        this.contenidoService = contenidoService;
    }

    @Cacheable("reporteEjecutivoResumen")
    public ResumenReporteEjecutivoDto obtenerResumenReporteEjecutivo() {
        FiltroKpiRequest filtrosGenerales = new FiltroKpiRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );

        ResumenDashboardDto resumenDashboard = dashboardService.obtenerResumenDashboard();

        ResumenConsumoGenerosDto resumenConsumo =
                consumoService.obtenerResumenGeneros(filtrosGenerales);

        ResumenMercadosDto resumenMercados =
                mercadoService.obtenerResumenMercados(filtrosGenerales);

        ResumenPlanesDto resumenPlanes =
                planService.obtenerConsumoPorPlanes(filtrosGenerales);

        ResumenCumplimientoMetasDto resumenMetas =
                metaService.obtenerCumplimientoMetas(filtrosGenerales);

        ResumenActividadPerfilesDto resumenPerfiles =
                perfilService.obtenerActividadPerfiles(filtrosGenerales);

        ResumenDesempenoContenidosDto resumenContenidos =
                contenidoService.obtenerDesempenoContenidos(filtrosGenerales);

        List<ItemEjecutivoDto> hallazgos = construirHallazgos(
                resumenDashboard,
                resumenConsumo,
                resumenMercados,
                resumenPlanes,
                resumenContenidos
        );

        List<ItemEjecutivoDto> debilidades = construirDebilidades(
                resumenMetas,
                resumenPerfiles,
                resumenContenidos
        );

        List<ItemEjecutivoDto> recomendaciones = construirRecomendaciones(
                resumenDashboard,
                resumenConsumo,
                resumenMercados,
                resumenPlanes,
                resumenMetas,
                resumenPerfiles
        );

        return new ResumenReporteEjecutivoDto(
                "Reporte ejecutivo de StreamMetrics - Panorama general",
                LocalDateTime.now(),
                resumenDashboard,
                hallazgos,
                debilidades,
                recomendaciones
        );
    }

    private List<ItemEjecutivoDto> construirHallazgos(
            ResumenDashboardDto resumenDashboard,
            ResumenConsumoGenerosDto resumenConsumo,
            ResumenMercadosDto resumenMercados,
            ResumenPlanesDto resumenPlanes,
            ResumenDesempenoContenidosDto resumenContenidos
    ) {
        List<ItemEjecutivoDto> hallazgos = new ArrayList<>();

        hallazgos.add(new ItemEjecutivoDto(
                "Alcance del análisis",
                "El reporte fue generado como panorama general del sistema, integrando KPIs de consumo, mercados, planes, metas, perfiles y contenidos.",
                "INFORMATIVO"
        ));

        if (!resumenConsumo.generosPorVisualizaciones().isEmpty()) {
            ConsumoGeneroDto generoLider = resumenConsumo.generosPorVisualizaciones().get(0);

            hallazgos.add(new ItemEjecutivoDto(
                    "Género dominante",
                    "El género con mayor consumo general es "
                            + generoLider.nombre()
                            + ", con " + generoLider.visualizaciones()
                            + " visualizaciones.",
                    "INFORMATIVO"
            ));
        } else {
            hallazgos.add(new ItemEjecutivoDto(
                    "Género dominante",
                    "El género con mayor consumo general es "
                            + resumenDashboard.generoMasVisto() + ".",
                    "INFORMATIVO"
            ));
        }

        if (!resumenMercados.paisesMayorConsumo().isEmpty()) {
            ConsumoMercadoDto paisLider = resumenMercados.paisesMayorConsumo().get(0);

            hallazgos.add(new ItemEjecutivoDto(
                    "Mercado principal",
                    "El país con mayor consumo general es "
                            + paisLider.nombre()
                            + ", con " + paisLider.visualizaciones()
                            + " visualizaciones.",
                    "INFORMATIVO"
            ));
        }

        if (!resumenPlanes.planes().isEmpty()) {
            ConsumoPlanDto planLider = resumenPlanes.planes().get(0);

            hallazgos.add(new ItemEjecutivoDto(
                    "Plan con mayor consumo",
                    "El plan con mayor actividad es "
                            + planLider.nombre()
                            + ", con " + planLider.visualizaciones()
                            + " visualizaciones.",
                    "INFORMATIVO"
            ));
        }

        if (!resumenContenidos.contenidosMasVistos().isEmpty()) {
            DesempenoContenidoDto contenidoPrincipal = resumenContenidos.contenidosMasVistos().get(0);

            hallazgos.add(new ItemEjecutivoDto(
                    "Contenido con mayor visualización",
                    "El contenido más visto es \""
                            + contenidoPrincipal.titulo()
                            + "\" con " + contenidoPrincipal.visualizaciones()
                            + " visualizaciones.",
                    "INFORMATIVO"
            ));
        }

        if (!resumenContenidos.contenidosMejorCalificados().isEmpty()) {
            DesempenoContenidoDto contenidoMejorCalificado =
                    resumenContenidos.contenidosMejorCalificados().get(0);

            hallazgos.add(new ItemEjecutivoDto(
                    "Contenido mejor calificado",
                    "El contenido con mejor calificación promedio es \""
                            + contenidoMejorCalificado.titulo()
                            + "\" con una calificación de "
                            + contenidoMejorCalificado.calificacionPromedio() + ".",
                    "INFORMATIVO"
            ));
        }

        return hallazgos;
    }

    private List<ItemEjecutivoDto> construirDebilidades(
            ResumenCumplimientoMetasDto resumenMetas,
            ResumenActividadPerfilesDto resumenPerfiles,
            ResumenDesempenoContenidosDto resumenContenidos
    ) {
        List<ItemEjecutivoDto> debilidades = new ArrayList<>();

        if (!resumenMetas.cumplimientoPorPais().isEmpty()) {
            CumplimientoMetaDto mercadoCritico = resumenMetas.cumplimientoPorPais().get(0);

            debilidades.add(new ItemEjecutivoDto(
                    "Brecha frente a metas",
                    "El mercado con menor cumplimiento es "
                            + mercadoCritico.pais()
                            + ", con "
                            + mercadoCritico.porcentajeCumplimientoVisualizaciones()
                            + "% de cumplimiento en visualizaciones y "
                            + mercadoCritico.porcentajeCumplimientoHoras()
                            + "% en horas vistas.",
                    "ALTO"
            ));
        }

        resumenPerfiles.actividadPerfiles().stream()
                .filter(perfil -> contieneTextoCritico(perfil.nivelActividad()))
                .findFirst()
                .ifPresent(perfil -> debilidades.add(new ItemEjecutivoDto(
                        "Riesgo de inactividad",
                        "Se detectan "
                                + perfil.totalPerfiles()
                                + " perfiles en el grupo \""
                                + perfil.nivelActividad()
                                + "\", con un promedio de "
                                + perfil.promedioDiasSinActividad()
                                + " días sin actividad.",
                        "ALTO"
                )));

        resumenContenidos.contenidosMasVistos().stream()
                .filter(contenido -> contenido.tasaFinalizacion() != null)
                .filter(contenido -> contenido.tasaFinalizacion().doubleValue() < 70)
                .findFirst()
                .ifPresent(contenido -> debilidades.add(new ItemEjecutivoDto(
                        "Finalización baja en contenido destacado",
                        "El contenido \""
                                + contenido.titulo()
                                + "\" tiene buen volumen de visualizaciones, pero una tasa de finalización de "
                                + contenido.tasaFinalizacion()
                                + "%.",
                        "MEDIO"
                )));

        if (debilidades.isEmpty()) {
            debilidades.add(new ItemEjecutivoDto(
                    "Sin alertas críticas principales",
                    "No se detectaron debilidades críticas en los indicadores principales del panorama general.",
                    "INFORMATIVO"
            ));
        }

        return debilidades;
    }

    private List<ItemEjecutivoDto> construirRecomendaciones(
            ResumenDashboardDto resumenDashboard,
            ResumenConsumoGenerosDto resumenConsumo,
            ResumenMercadosDto resumenMercados,
            ResumenPlanesDto resumenPlanes,
            ResumenCumplimientoMetasDto resumenMetas,
            ResumenActividadPerfilesDto resumenPerfiles
    ) {
        List<ItemEjecutivoDto> recomendaciones = new ArrayList<>();

        if (!resumenConsumo.generosPorVisualizaciones().isEmpty()) {
            ConsumoGeneroDto generoLider = resumenConsumo.generosPorVisualizaciones().get(0);

            recomendaciones.add(new ItemEjecutivoDto(
                    "Impulsar contenido dominante",
                    "Reforzar recomendaciones, campañas y posicionamiento de contenidos relacionados con el género "
                            + generoLider.nombre()
                            + ", ya que concentra alto consumo general.",
                    "MEDIA"
            ));
        } else {
            recomendaciones.add(new ItemEjecutivoDto(
                    "Impulsar contenido dominante",
                    "Reforzar recomendaciones y campañas relacionadas con el género "
                            + resumenDashboard.generoMasVisto()
                            + ", ya que concentra alto consumo general.",
                    "MEDIA"
            ));
        }

        if (!resumenMetas.cumplimientoPorPais().isEmpty()) {
            CumplimientoMetaDto mercadoCritico = resumenMetas.cumplimientoPorPais().get(0);

            recomendaciones.add(new ItemEjecutivoDto(
                    "Revisar estrategia regional",
                    "Analizar campañas, catálogo, metas y presupuesto del mercado "
                            + mercadoCritico.pais()
                            + " para reducir la brecha frente a los objetivos.",
                    "ALTA"
            ));
        }

        resumenPerfiles.actividadPerfiles().stream()
                .filter(perfil -> contieneTextoCritico(perfil.nivelActividad()))
                .findFirst()
                .map(ActividadPerfilDto::accionSugerida)
                .ifPresent(accion -> recomendaciones.add(new ItemEjecutivoDto(
                        "Reactivar perfiles en riesgo",
                        accion,
                        "ALTA"
                )));

        if (!resumenPlanes.planes().isEmpty()) {
            ConsumoPlanDto planLider = resumenPlanes.planes().get(0);

            recomendaciones.add(new ItemEjecutivoDto(
                    "Aprovechar el plan con mejor desempeño",
                    "Diseñar campañas y beneficios asociados al plan "
                            + planLider.nombre()
                            + ", debido a su alto nivel de consumo general.",
                    "MEDIA"
            ));
        }

        if (!resumenMercados.paisesMayorConsumo().isEmpty()) {
            ConsumoMercadoDto mercadoLider = resumenMercados.paisesMayorConsumo().get(0);

            recomendaciones.add(new ItemEjecutivoDto(
                    "Priorizar mercado con mayor consumo",
                    "Mantener estrategias de retención y personalización en "
                            + mercadoLider.nombre()
                            + ", ya que concentra el mayor volumen de consumo.",
                    "MEDIA"
            ));
        }

        recomendaciones.add(new ItemEjecutivoDto(
                "Aprovechar franja horaria clave",
                "Programar campañas, estrenos o recomendaciones en la franja de mayor actividad: "
                        + resumenDashboard.franjaHorariaMayorActividad() + ".",
                "MEDIA"
        ));

        return recomendaciones;
    }

    private boolean contieneTextoCritico(String texto) {
        if (texto == null) {
            return false;
        }

        String textoNormalizado = texto.toLowerCase();

        return textoNormalizado.contains("riesgo")
                || textoNormalizado.contains("inactivo")
                || textoNormalizado.contains("abandono");
    }
}