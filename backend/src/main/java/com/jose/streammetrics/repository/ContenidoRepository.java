package com.jose.streammetrics.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.jose.streammetrics.dto.DesempenoContenidoDto;

@Repository
public class ContenidoRepository {

    private final JdbcTemplate jdbcTemplate;

    public ContenidoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DesempenoContenidoDto> obtenerContenidosMasVistos() {
        String sql = """
                SELECT
                    titulo_contenido AS titulo,
                    tipo_contenido AS tipo_contenido,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas,
                    ROUND(COALESCE(AVG(calificacion_promedio_contenido), 0), 2) AS calificacion_promedio,
                    COALESCE(MAX(total_valoraciones_contenido), 0) AS total_valoraciones,
                    ROUND(
                        (
                            SUM(
                                CASE
                                    WHEN LOWER(TRIM(completado)) IN ('si', 'sí', 'true', '1', 'completado')
                                    THEN 1
                                    ELSE 0
                                END
                            ) / COUNT(*)
                        ) * 100,
                        2
                    ) AS tasa_finalizacion
                FROM analisis_streaming_kpis
                WHERE titulo_contenido IS NOT NULL
                  AND titulo_contenido <> ''
                GROUP BY titulo_contenido, tipo_contenido
                ORDER BY visualizaciones DESC
                LIMIT 5
                """;

        return consultarRankingContenidos(sql);
    }

    public List<DesempenoContenidoDto> obtenerContenidosMejorCalificados() {
        String sql = """
                SELECT
                    titulo_contenido AS titulo,
                    tipo_contenido AS tipo_contenido,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas,
                    ROUND(COALESCE(AVG(calificacion_promedio_contenido), 0), 2) AS calificacion_promedio,
                    COALESCE(MAX(total_valoraciones_contenido), 0) AS total_valoraciones,
                    ROUND(
                        (
                            SUM(
                                CASE
                                    WHEN LOWER(TRIM(completado)) IN ('si', 'sí', 'true', '1', 'completado')
                                    THEN 1
                                    ELSE 0
                                END
                            ) / COUNT(*)
                        ) * 100,
                        2
                    ) AS tasa_finalizacion
                FROM analisis_streaming_kpis
                WHERE titulo_contenido IS NOT NULL
                  AND titulo_contenido <> ''
                  AND calificacion_promedio_contenido IS NOT NULL
                GROUP BY titulo_contenido, tipo_contenido
                HAVING visualizaciones >= 100
                ORDER BY calificacion_promedio DESC, total_valoraciones DESC
                LIMIT 5
                """;

        return consultarRankingContenidos(sql);
    }

    public List<DesempenoContenidoDto> obtenerContenidosMayorFinalizacion() {
        String sql = """
                SELECT
                    titulo_contenido AS titulo,
                    tipo_contenido AS tipo_contenido,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas,
                    ROUND(COALESCE(AVG(calificacion_promedio_contenido), 0), 2) AS calificacion_promedio,
                    COALESCE(MAX(total_valoraciones_contenido), 0) AS total_valoraciones,
                    ROUND(
                        (
                            SUM(
                                CASE
                                    WHEN LOWER(TRIM(completado)) IN ('si', 'sí', 'true', '1', 'completado')
                                    THEN 1
                                    ELSE 0
                                END
                            ) / COUNT(*)
                        ) * 100,
                        2
                    ) AS tasa_finalizacion
                FROM analisis_streaming_kpis
                WHERE titulo_contenido IS NOT NULL
                  AND titulo_contenido <> ''
                GROUP BY titulo_contenido, tipo_contenido
                HAVING visualizaciones >= 100
                ORDER BY tasa_finalizacion DESC, visualizaciones DESC
                LIMIT 5
                """;

        return consultarRankingContenidos(sql);
    }

    private List<DesempenoContenidoDto> consultarRankingContenidos(String sql) {
        return jdbcTemplate.query(sql, (resultado, numeroFila) -> new DesempenoContenidoDto(
                resultado.getString("titulo"),
                resultado.getString("tipo_contenido"),
                resultado.getLong("visualizaciones"),
                resultado.getBigDecimal("horas_vistas"),
                resultado.getBigDecimal("calificacion_promedio"),
                resultado.getInt("total_valoraciones"),
                resultado.getBigDecimal("tasa_finalizacion")
        ));
    }
}