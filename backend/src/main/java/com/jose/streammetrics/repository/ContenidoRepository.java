package com.jose.streammetrics.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.jose.streammetrics.dto.DesempenoContenidoDto;
import com.jose.streammetrics.dto.FiltroKpiRequest;

@Repository
public class ContenidoRepository {

    private final JdbcTemplate jdbcTemplate;

    public ContenidoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DesempenoContenidoDto> obtenerContenidosMasVistos(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

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
                %s
                GROUP BY titulo_contenido, tipo_contenido
                ORDER BY visualizaciones DESC
                LIMIT 5
                """.formatted(consulta.where());

        return consultarRankingContenidos(sql, consulta.parametros());
    }

    public List<DesempenoContenidoDto> obtenerContenidosMejorCalificados(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

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
                %s
                  AND calificacion_promedio_contenido IS NOT NULL
                GROUP BY titulo_contenido, tipo_contenido
                HAVING visualizaciones >= 100
                ORDER BY calificacion_promedio DESC, total_valoraciones DESC
                LIMIT 5
                """.formatted(consulta.where());

        return consultarRankingContenidos(sql, consulta.parametros());
    }

    public List<DesempenoContenidoDto> obtenerContenidosMayorFinalizacion(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

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
                %s
                GROUP BY titulo_contenido, tipo_contenido
                HAVING visualizaciones >= 100
                ORDER BY tasa_finalizacion DESC, visualizaciones DESC
                LIMIT 5
                """.formatted(consulta.where());

        return consultarRankingContenidos(sql, consulta.parametros());
    }

    private ConsultaFiltrada construirConsultaBase(FiltroKpiRequest filtros) {
        StringBuilder where = new StringBuilder("""
                WHERE titulo_contenido IS NOT NULL
                  AND titulo_contenido <> ''
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

        if (StringUtils.hasText(filtros.genero())) {
            where.append("""
                    
                      AND genero_contenido = ?
                    """);
            parametros.add(filtros.genero().trim());
        }

        return new ConsultaFiltrada(where.toString(), parametros);
    }

    private List<DesempenoContenidoDto> consultarRankingContenidos(
            String sql,
            List<Object> parametros
    ) {
        return jdbcTemplate.query(
                sql,
                parametros.toArray(),
                (resultado, numeroFila) -> new DesempenoContenidoDto(
                        resultado.getString("titulo"),
                        resultado.getString("tipo_contenido"),
                        resultado.getLong("visualizaciones"),
                        resultado.getBigDecimal("horas_vistas"),
                        resultado.getBigDecimal("calificacion_promedio"),
                        resultado.getInt("total_valoraciones"),
                        resultado.getBigDecimal("tasa_finalizacion")
                )
        );
    }

    private record ConsultaFiltrada(
            String where,
            List<Object> parametros
    ) {
    }
}