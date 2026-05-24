package com.jose.streammetrics.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.jose.streammetrics.dto.ConsumoMercadoDto;

@Repository
public class MercadoRepository {

    private final JdbcTemplate jdbcTemplate;

    public MercadoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ConsumoMercadoDto> obtenerTopPaisesPorConsumo() {
        String sql = """
                SELECT
                    pais_usuario AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                WHERE pais_usuario IS NOT NULL
                  AND pais_usuario <> ''
                GROUP BY pais_usuario
                ORDER BY visualizaciones DESC
                """;

        return jdbcTemplate.query(sql, (resultado, numeroFila) -> new ConsumoMercadoDto(
                resultado.getString("nombre"),
                resultado.getLong("visualizaciones"),
                resultado.getBigDecimal("horas_vistas")
        ));
    }

    public List<ConsumoMercadoDto> obtenerTopContinentesPorConsumo() {
        String sql = """
                SELECT
                    continente_usuario AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                WHERE continente_usuario IS NOT NULL
                  AND continente_usuario <> ''
                GROUP BY continente_usuario
                ORDER BY visualizaciones DESC
                """;

        return jdbcTemplate.query(sql, (resultado, numeroFila) -> new ConsumoMercadoDto(
                resultado.getString("nombre"),
                resultado.getLong("visualizaciones"),
                resultado.getBigDecimal("horas_vistas")
        ));
    }
}