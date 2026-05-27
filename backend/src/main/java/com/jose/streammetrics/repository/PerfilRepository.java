package com.jose.streammetrics.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.jose.streammetrics.dto.ActividadPerfilDto;
import com.jose.streammetrics.dto.FiltroKpiRequest;

@Repository
public class PerfilRepository {

    private final JdbcTemplate jdbcTemplate;

    public PerfilRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ActividadPerfilDto> obtenerActividadPerfiles(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

        String sql = """
                WITH perfiles_unicos AS (
                    SELECT
                        id_perfil,
                        MAX(nivel_actividad_perfil) AS nivel_actividad,
                        MAX(dias_sin_actividad) AS dias_sin_actividad,
                        MAX(accion_sugerida) AS accion_sugerida
                    FROM analisis_streaming_kpis
                    %s
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
                """.formatted(consulta.where());

        return jdbcTemplate.query(
                sql,
                consulta.parametros().toArray(),
                (resultado, numeroFila) -> new ActividadPerfilDto(
                        resultado.getString("nivel_actividad"),
                        resultado.getLong("total_perfiles"),
                        resultado.getBigDecimal("promedio_dias_sin_actividad"),
                        resultado.getString("accion_sugerida")
                )
        );
    }

    private ConsultaFiltrada construirConsultaBase(FiltroKpiRequest filtros) {
        StringBuilder where = new StringBuilder("""
                WHERE id_perfil IS NOT NULL
                  AND nivel_actividad_perfil IS NOT NULL
                  AND nivel_actividad_perfil <> ''
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

        if (StringUtils.hasText(filtros.nivelActividad())) {
            where.append("""
                    
                      AND nivel_actividad_perfil = ?
                    """);
            parametros.add(filtros.nivelActividad().trim());
        }

        return new ConsultaFiltrada(where.toString(), parametros);
    }

    private record ConsultaFiltrada(
            String where,
            List<Object> parametros
    ) {
    }
}