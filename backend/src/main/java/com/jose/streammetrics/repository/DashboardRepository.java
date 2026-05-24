package com.jose.streammetrics.repository;

import java.math.BigDecimal;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public DashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Long obtenerTotalVisualizaciones() {
        String sql = """
                SELECT COALESCE(SUM(visualizacion_real), 0)
                FROM analisis_streaming_kpis
                """;

        Number resultado = jdbcTemplate.queryForObject(sql, Number.class);
        return resultado != null ? resultado.longValue() : 0L;
    }

    public BigDecimal obtenerTotalHorasVistas() {
        String sql = """
                SELECT COALESCE(SUM(horas_vistas), 0)
                FROM analisis_streaming_kpis
                """;

        BigDecimal resultado = jdbcTemplate.queryForObject(sql, BigDecimal.class);
        return resultado != null ? resultado : BigDecimal.ZERO;
    }

    public Long obtenerTotalPerfilesAnalizados() {
        String sql = """
                SELECT COUNT(DISTINCT id_perfil)
                FROM analisis_streaming_kpis
                WHERE id_perfil IS NOT NULL
                """;

        Number resultado = jdbcTemplate.queryForObject(sql, Number.class);
        return resultado != null ? resultado.longValue() : 0L;
    }

    public String obtenerGeneroMasVisto() {
        String sql = """
                SELECT genero_contenido
                FROM analisis_streaming_kpis
                WHERE genero_contenido IS NOT NULL
                  AND genero_contenido <> ''
                GROUP BY genero_contenido
                ORDER BY SUM(COALESCE(visualizacion_real, 0)) DESC
                LIMIT 1
                """;

        return jdbcTemplate.queryForObject(sql, String.class);
    }

    public String obtenerPaisMayorConsumo() {
        String sql = """
                SELECT pais_usuario
                FROM analisis_streaming_kpis
                WHERE pais_usuario IS NOT NULL
                  AND pais_usuario <> ''
                GROUP BY pais_usuario
                ORDER BY SUM(COALESCE(visualizacion_real, 0)) DESC
                LIMIT 1
                """;

        return jdbcTemplate.queryForObject(sql, String.class);
    }

    public String obtenerPlanMayorConsumo() {
        String sql = """
                SELECT nombre_plan
                FROM analisis_streaming_kpis
                WHERE nombre_plan IS NOT NULL
                  AND nombre_plan <> ''
                GROUP BY nombre_plan
                ORDER BY SUM(COALESCE(visualizacion_real, 0)) DESC
                LIMIT 1
                """;

        return jdbcTemplate.queryForObject(sql, String.class);
    }

    public String obtenerFranjaHorariaMayorActividad() {
        String sql = """
                SELECT franja_horaria
                FROM analisis_streaming_kpis
                WHERE franja_horaria IS NOT NULL
                  AND franja_horaria <> ''
                GROUP BY franja_horaria
                ORDER BY SUM(COALESCE(visualizacion_real, 0)) DESC
                LIMIT 1
                """;

        return jdbcTemplate.queryForObject(sql, String.class);
    }
}