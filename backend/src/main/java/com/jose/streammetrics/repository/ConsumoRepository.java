package com.jose.streammetrics.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.jose.streammetrics.dto.ConsumoGeneroDto;
import com.jose.streammetrics.dto.FiltroKpiRequest;

@Repository
public class ConsumoRepository {

    private final JdbcTemplate jdbcTemplate;

    public ConsumoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ConsumoGeneroDto> obtenerGenerosPorVisualizaciones(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

        String sql = """
                SELECT
                    genero_contenido AS nombre,
                    SUM(COALESCE(visualizacion_real, 1)) AS visualizaciones,
                    SUM(COALESCE(horas_vistas, 0)) AS horas_vistas
                FROM analisis_streaming_kpis
                %s
                GROUP BY genero_contenido
                ORDER BY visualizaciones DESC
                """.formatted(consulta.where());

        return jdbcTemplate.query(
                sql,
                consulta.parametros().toArray(),
                (rs, rowNum) -> new ConsumoGeneroDto(
                        rs.getString("nombre"),
                        rs.getLong("visualizaciones"),
                        rs.getBigDecimal("horas_vistas")
                )
        );
    }

    public List<ConsumoGeneroDto> obtenerGenerosPorHorasVistas(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

        String sql = """
                SELECT
                    genero_contenido AS nombre,
                    SUM(COALESCE(visualizacion_real, 1)) AS visualizaciones,
                    SUM(COALESCE(horas_vistas, 0)) AS horas_vistas
                FROM analisis_streaming_kpis
                %s
                GROUP BY genero_contenido
                ORDER BY horas_vistas DESC
                """.formatted(consulta.where());

        return jdbcTemplate.query(
                sql,
                consulta.parametros().toArray(),
                (rs, rowNum) -> new ConsumoGeneroDto(
                        rs.getString("nombre"),
                        rs.getLong("visualizaciones"),
                        rs.getBigDecimal("horas_vistas")
                )
        );
    }

    private ConsultaFiltrada construirConsultaBase(FiltroKpiRequest filtros) {
        StringBuilder where = new StringBuilder("""
                WHERE genero_contenido IS NOT NULL
                  AND genero_contenido <> ''
                """);

        List<Object> parametros = new ArrayList<>();

        if (filtros != null && filtros.anio() != null) {
            where.append("""
                    
                      AND CAST(SUBSTRING(periodo_anio_mes, 1, 4) AS UNSIGNED) = ?
                    """);
            parametros.add(filtros.anio());
        }

        if (filtros != null && StringUtils.hasText(filtros.pais())) {
            where.append("""
                    
                      AND pais_usuario = ?
                    """);
            parametros.add(filtros.pais().trim());
        }

        if (filtros != null && StringUtils.hasText(filtros.continente())) {
            where.append("""
                    
                      AND continente_usuario = ?
                    """);
            parametros.add(filtros.continente().trim());
        }

        if (filtros != null && StringUtils.hasText(filtros.plan())) {
            where.append("""
                    
                      AND nombre_plan = ?
                    """);
            parametros.add(filtros.plan().trim());
        }

        if (filtros != null && StringUtils.hasText(filtros.tipoContenido())) {
            where.append("""
                    
                      AND tipo_contenido = ?
                    """);
            parametros.add(filtros.tipoContenido().trim());
        }

        return new ConsultaFiltrada(where.toString(), parametros);
    }

    private record ConsultaFiltrada(
            String where,
            List<Object> parametros
    ) {
    }
}