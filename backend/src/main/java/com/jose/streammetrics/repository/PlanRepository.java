package com.jose.streammetrics.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.jose.streammetrics.dto.ConsumoPlanDto;

@Repository
public class PlanRepository {

    private final JdbcTemplate jdbcTemplate;

    public PlanRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ConsumoPlanDto> obtenerConsumoPorPlanes() {
        String sql = """
                SELECT
                    nombre_plan AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                WHERE nombre_plan IS NOT NULL
                  AND nombre_plan <> ''
                GROUP BY nombre_plan
                ORDER BY visualizaciones DESC
                """;

        return jdbcTemplate.query(sql, (resultado, numeroFila) -> new ConsumoPlanDto(
                resultado.getString("nombre"),
                resultado.getLong("visualizaciones"),
                resultado.getBigDecimal("horas_vistas")
        ));
    }
}