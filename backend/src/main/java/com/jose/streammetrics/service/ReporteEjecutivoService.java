package com.jose.streammetrics.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.jose.streammetrics.dto.ActividadPerfilDto;
import com.jose.streammetrics.dto.CumplimientoMetaDto;
import com.jose.streammetrics.dto.DesempenoContenidoDto;
import com.jose.streammetrics.dto.ItemEjecutivoDto;
import com.jose.streammetrics.dto.ResumenActividadPerfilesDto;
import com.jose.streammetrics.dto.ResumenCumplimientoMetasDto;
import com.jose.streammetrics.dto.ResumenDashboardDto;
import com.jose.streammetrics.dto.ResumenDesempenoContenidosDto;
import com.jose.streammetrics.dto.ResumenReporteEjecutivoDto;

@Service
public class ReporteEjecutivoService {

    private final DashboardService dashboardService;
    private final MetaService metaService;
    private final PerfilService perfilService;
    private final ContenidoService contenidoService;

    public ReporteEjecutivoService(
            DashboardService dashboardService,
            MetaService metaService,
            PerfilService perfilService,
            ContenidoService contenidoService
    ) {
        this.dashboardService = dashboardService;
        this.metaService = metaService;
        this.perfilService = perfilService;
        this.contenidoService = contenidoService;
    }

    @Cacheable("reporteEjecutivoResumen")
    public ResumenReporteEjecutivoDto obtenerResumenReporteEjecutivo() {
        ResumenDashboardDto resumenDashboard = dashboardService.obtenerResumenDashboard();
        ResumenCumplimientoMetasDto resumenMetas = metaService.obtenerCumplimientoMetas();
        ResumenActividadPerfilesDto resumenPerfiles = perfilService.obtenerActividadPerfiles();
        ResumenDesempenoContenidosDto resumenContenidos = contenidoService.obtenerDesempenoContenidos();

        List<ItemEjecutivoDto> hallazgos = construirHallazgos(resumenDashboard, resumenContenidos);
        List<ItemEjecutivoDto> debilidades = construirDebilidades(resumenMetas, resumenPerfiles);
        List<ItemEjecutivoDto> recomendaciones = construirRecomendaciones(resumenDashboard, resumenMetas, resumenPerfiles);

        return new ResumenReporteEjecutivoDto(
                "Reporte ejecutivo de StreamMetrics",
                LocalDateTime.now(),
                resumenDashboard,
                hallazgos,
                debilidades,
                recomendaciones
        );
    }

    private List<ItemEjecutivoDto> construirHallazgos(
            ResumenDashboardDto resumenDashboard,
            ResumenDesempenoContenidosDto resumenContenidos
    ) {
        List<ItemEjecutivoDto> hallazgos = new ArrayList<>();

        hallazgos.add(new ItemEjecutivoDto(
                "Género dominante",
                "El género con mayor consumo general es " + resumenDashboard.generoMasVisto() + ".",
                "INFORMATIVO"
        ));

        hallazgos.add(new ItemEjecutivoDto(
                "Mercado principal",
                "El país con mayor consumo es " + resumenDashboard.paisMayorConsumo() + ".",
                "INFORMATIVO"
        ));

        hallazgos.add(new ItemEjecutivoDto(
                "Plan con mayor consumo",
                "El plan con mayor consumo registrado es " + resumenDashboard.planMayorConsumo() + ".",
                "INFORMATIVO"
        ));

        if (!resumenContenidos.contenidosMasVistos().isEmpty()) {
            DesempenoContenidoDto contenidoPrincipal = resumenContenidos.contenidosMasVistos().get(0);

            hallazgos.add(new ItemEjecutivoDto(
                    "Contenido con mayor visualización",
                    "El contenido más visto es \"" + contenidoPrincipal.titulo()
                            + "\" con " + contenidoPrincipal.visualizaciones() + " visualizaciones.",
                    "INFORMATIVO"
            ));
        }

        return hallazgos;
    }

    private List<ItemEjecutivoDto> construirDebilidades(
            ResumenCumplimientoMetasDto resumenMetas,
            ResumenActividadPerfilesDto resumenPerfiles
    ) {
        List<ItemEjecutivoDto> debilidades = new ArrayList<>();

        if (!resumenMetas.cumplimientoPorPais().isEmpty()) {
            CumplimientoMetaDto mercadoCritico = resumenMetas.cumplimientoPorPais().get(0);

            debilidades.add(new ItemEjecutivoDto(
                    "Brecha frente a metas",
                    "El mercado con menor cumplimiento es " + mercadoCritico.pais()
                            + ", con " + mercadoCritico.porcentajeCumplimientoVisualizaciones()
                            + "% de cumplimiento en visualizaciones.",
                    "ALTO"
            ));
        }

        resumenPerfiles.actividadPerfiles().stream()
                .filter(perfil -> contieneTextoCritico(perfil.nivelActividad()))
                .findFirst()
                .ifPresent(perfil -> debilidades.add(new ItemEjecutivoDto(
                        "Riesgo de inactividad",
                        "Se detectan " + perfil.totalPerfiles()
                                + " perfiles en el grupo \"" + perfil.nivelActividad()
                                + "\", con un promedio de " + perfil.promedioDiasSinActividad()
                                + " días sin actividad.",
                        "ALTO"
                )));

        return debilidades;
    }

    private List<ItemEjecutivoDto> construirRecomendaciones(
            ResumenDashboardDto resumenDashboard,
            ResumenCumplimientoMetasDto resumenMetas,
            ResumenActividadPerfilesDto resumenPerfiles
    ) {
        List<ItemEjecutivoDto> recomendaciones = new ArrayList<>();

        recomendaciones.add(new ItemEjecutivoDto(
                "Impulsar contenido dominante",
                "Reforzar recomendaciones y campañas relacionadas con el género "
                        + resumenDashboard.generoMasVisto()
                        + ", ya que concentra alto consumo.",
                "MEDIA"
        ));

        if (!resumenMetas.cumplimientoPorPais().isEmpty()) {
            CumplimientoMetaDto mercadoCritico = resumenMetas.cumplimientoPorPais().get(0);

            recomendaciones.add(new ItemEjecutivoDto(
                    "Revisar estrategia regional",
                    "Analizar campañas, catálogo y metas del mercado "
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

        recomendaciones.add(new ItemEjecutivoDto(
                "Aprovechar franja horaria clave",
                "Programar campañas y estrenos en la franja de mayor actividad: "
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