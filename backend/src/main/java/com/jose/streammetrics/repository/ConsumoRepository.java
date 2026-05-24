package com.jose.streammetrics.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.jose.streammetrics.dto.ConsumoGeneroDto;

@Repository
public class ConsumoRepository {

    private final JdbcTemplate jdbcTemplate;

    public ConsumoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ConsumoGeneroDto> obtenerTopGenerosPorVisualizaciones() {
        String sql = """
                SELECT
                    genero_contenido AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                WHERE genero_contenido IS NOT NULL
                  AND genero_contenido <> ''
                GROUP BY genero_contenido
                ORDER BY visualizaciones DESC
                """;

        return jdbcTemplate.query(sql, (resultado, numeroFila) -> new ConsumoGeneroDto(
                resultado.getString("nombre"),
                resultado.getLong("visualizaciones"),
                resultado.getBigDecimal("horas_vistas")
        ));
    }

    public List<ConsumoGeneroDto> obtenerTopGenerosPorHorasVistas() {
        String sql = """
                SELECT
                    genero_contenido AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                WHERE genero_contenido IS NOT NULL
                  AND genero_contenido <> ''
                GROUP BY genero_contenido
                ORDER BY horas_vistas DESC
                """;

        return jdbcTemplate.query(sql, (resultado, numeroFila) -> new ConsumoGeneroDto(
                resultado.getString("nombre"),
                resultado.getLong("visualizaciones"),
                resultado.getBigDecimal("horas_vistas")
        ));
    }
}