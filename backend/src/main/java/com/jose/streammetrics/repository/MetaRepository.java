package com.jose.streammetrics.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.jose.streammetrics.dto.CumplimientoMetaDto;
import com.jose.streammetrics.dto.FiltroKpiRequest;

@Repository
public class MetaRepository {

    private final JdbcTemplate jdbcTemplate;

    public MetaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CumplimientoMetaDto> obtenerCumplimientoPorPais(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

        String sql = """
                WITH reales AS (
                    SELECT
                        pais_usuario AS pais,
                        COALESCE(SUM(visualizacion_real), 0) AS visualizaciones_reales,
                        COALESCE(SUM(horas_vistas), 0) AS horas_reales
                    FROM analisis_streaming_kpis
                    %s
                    GROUP BY pais_usuario
                ),
                metas_unicas AS (
                    SELECT DISTINCT
                        pais_usuario AS pais,
                        id_meta,
                        meta_visualizaciones,
                        meta_horas_vistas
                    FROM analisis_streaming_kpis
                    %s
                      AND id_meta IS NOT NULL
                ),
                metas AS (
                    SELECT
                        pais,
                        COALESCE(SUM(meta_visualizaciones), 0) AS meta_visualizaciones,
                        COALESCE(SUM(meta_horas_vistas), 0) AS meta_horas
                    FROM metas_unicas
                    GROUP BY pais
                ),
                datos AS (
                    SELECT
                        r.pais,
                        r.visualizaciones_reales,
                        COALESCE(m.meta_visualizaciones, 0) AS meta_visualizaciones,
                        CASE
                            WHEN COALESCE(m.meta_visualizaciones, 0) = 0 THEN 0
                            ELSE ROUND((r.visualizaciones_reales / m.meta_visualizaciones) * 100, 2)
                        END AS porcentaje_cumplimiento_visualizaciones,
                        r.horas_reales,
                        COALESCE(m.meta_horas, 0) AS meta_horas,
                        CASE
                            WHEN COALESCE(m.meta_horas, 0) = 0 THEN 0
                            ELSE ROUND((r.horas_reales / m.meta_horas) * 100, 2)
                        END AS porcentaje_cumplimiento_horas
                    FROM reales r
                    LEFT JOIN metas m ON m.pais = r.pais
                )
                SELECT
                    pais,
                    visualizaciones_reales,
                    meta_visualizaciones,
                    porcentaje_cumplimiento_visualizaciones,
                    horas_reales,
                    meta_horas,
                    porcentaje_cumplimiento_horas,
                    CASE
                        WHEN meta_visualizaciones = 0 AND meta_horas = 0 THEN 'SIN_META'
                        WHEN porcentaje_cumplimiento_visualizaciones >= 90
                             AND porcentaje_cumplimiento_horas >= 90 THEN 'ALTO'
                        WHEN porcentaje_cumplimiento_visualizaciones >= 70
                             AND porcentaje_cumplimiento_horas >= 70 THEN 'MEDIO'
                        ELSE 'BAJO'
                    END AS estado
                FROM datos
                WHERE meta_visualizaciones > 0
                   OR meta_horas > 0
                ORDER BY porcentaje_cumplimiento_visualizaciones ASC,
                         porcentaje_cumplimiento_horas ASC
                """.formatted(consulta.where(), consulta.where());

        List<Object> parametros = new ArrayList<>();
        parametros.addAll(consulta.parametros());
        parametros.addAll(consulta.parametros());

        return jdbcTemplate.query(
                sql,
                parametros.toArray(),
                (resultado, numeroFila) -> new CumplimientoMetaDto(
                        resultado.getString("pais"),
                        resultado.getLong("visualizaciones_reales"),
                        resultado.getLong("meta_visualizaciones"),
                        resultado.getBigDecimal("porcentaje_cumplimiento_visualizaciones"),
                        resultado.getBigDecimal("horas_reales"),
                        resultado.getBigDecimal("meta_horas"),
                        resultado.getBigDecimal("porcentaje_cumplimiento_horas"),
                        resultado.getString("estado")
                )
        );
    }

    private ConsultaFiltrada construirConsultaBase(FiltroKpiRequest filtros) {
        StringBuilder where = new StringBuilder("""
                WHERE pais_usuario IS NOT NULL
                  AND pais_usuario <> ''
                """);

        List<Object> parametros = new ArrayList<>();

        if (filtros == null) {
            return new ConsultaFiltrada(where.toString(), parametros);
        }

        if (filtros.anio() != null) {
            where.append("""
                    
                      AND anio = ?
                    """);
            parametros.add(filtros.anio());
        }

        if (StringUtils.hasText(filtros.pais())) {
            where.append("""
                    
                      AND pais_usuario = ?
                    """);
            parametros.add(filtros.pais().trim());
        }

        if (StringUtils.hasText(filtros.continente())) {
            where.append("""
                    
                      AND continente_usuario = ?
                    """);
            parametros.add(filtros.continente().trim());
        }

        if (StringUtils.hasText(filtros.plan())) {
            where.append("""
                    
                      AND nombre_plan = ?
                    """);
            parametros.add(filtros.plan().trim());
        }

        if (StringUtils.hasText(filtros.tipoContenido())) {
            where.append("""
                    
                      AND tipo_contenido = ?
                    """);
            parametros.add(filtros.tipoContenido().trim());
        }

        if (StringUtils.hasText(filtros.prioridadMercado())) {
            where.append("""
                    
                      AND prioridad_mercado = ?
                    """);
            parametros.add(filtros.prioridadMercado().trim());
        }

        return new ConsultaFiltrada(where.toString(), parametros);
    }

    private record ConsultaFiltrada(
            String where,
            List<Object> parametros
    ) {
    }
}