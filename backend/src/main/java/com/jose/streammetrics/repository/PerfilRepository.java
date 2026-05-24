package com.jose.streammetrics.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.jose.streammetrics.dto.ActividadPerfilDto;

@Repository
public class PerfilRepository {

    private final JdbcTemplate jdbcTemplate;

    public PerfilRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ActividadPerfilDto> obtenerActividadPerfiles() {
        String sql = """
                WITH perfiles_unicos AS (
                    SELECT
                        id_perfil,
                        MAX(nivel_actividad_perfil) AS nivel_actividad,
                        MAX(dias_sin_actividad) AS dias_sin_actividad,
                        MAX(accion_sugerida) AS accion_sugerida
                    FROM analisis_streaming_kpis
                    WHERE id_perfil IS NOT NULL
                      AND nivel_actividad_perfil IS NOT NULL
                      AND nivel_actividad_perfil <> ''
                    GROUP BY id_perfil
                )
                SELECT
                    nivel_actividad,
                    COUNT(*) AS total_perfiles,
                    ROUND(AVG(COALESCE(dias_sin_actividad, 0)), 2) AS promedio_dias_sin_actividad,
                    COALESCE(accion_sugerida, 'Sin accion sugerida') AS accion_sugerida
                FROM perfiles_unicos
                GROUP BY nivel_actividad, accion_sugerida
                ORDER BY total_perfiles DESC
                """;

        return jdbcTemplate.query(sql, (resultado, numeroFila) -> new ActividadPerfilDto(
                resultado.getString("nivel_actividad"),
                resultado.getLong("total_perfiles"),
                resultado.getBigDecimal("promedio_dias_sin_actividad"),
                resultado.getString("accion_sugerida")
        ));
    }
}