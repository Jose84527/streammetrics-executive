package com.jose.streammetrics.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class FiltroRepository {

    private final JdbcTemplate jdbcTemplate;

    public FiltroRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Integer> obtenerAnios() {
        String sql = """
                SELECT DISTINCT CAST(SUBSTRING(periodo_anio_mes, 1, 4) AS UNSIGNED) AS anio
                FROM analisis_streaming_kpis
                WHERE periodo_anio_mes IS NOT NULL
                  AND periodo_anio_mes <> ''
                ORDER BY anio DESC
                """;

        return jdbcTemplate.queryForList(sql, Integer.class);
    }

    public List<String> obtenerPaises() {
        return obtenerValoresTexto("pais_usuario");
    }

    public List<String> obtenerContinentes() {
        return obtenerValoresTexto("continente_usuario");
    }

    public List<String> obtenerPlanes() {
        return obtenerValoresTexto("nombre_plan");
    }

    public List<String> obtenerTiposContenido() {
        return obtenerValoresTexto("tipo_contenido");
    }

    public List<String> obtenerGeneros() {
        return obtenerValoresTexto("genero_contenido");
    }

    public List<String> obtenerPrioridadesMercado() {
        return obtenerValoresTexto("prioridad_mercado");
    }

    public List<String> obtenerNivelesActividad() {
        return obtenerValoresTexto("nivel_actividad_perfil");
    }

    private List<String> obtenerValoresTexto(String columna) {
        String sql = """
                SELECT DISTINCT %s
                FROM analisis_streaming_kpis
                WHERE %s IS NOT NULL
                  AND %s <> ''
                ORDER BY %s
                """.formatted(columna, columna, columna, columna);

        return jdbcTemplate.queryForList(sql, String.class);
    }
}