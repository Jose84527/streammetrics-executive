package com.jose.streammetrics.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import com.jose.streammetrics.dto.ConsumoPlanDto;
import com.jose.streammetrics.dto.FiltroKpiRequest;

@Repository
public class PlanRepository {

    private final JdbcTemplate jdbcTemplate;

    public PlanRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ConsumoPlanDto> obtenerConsumoPorPlanes(FiltroKpiRequest filtros) {
        ConsultaFiltrada consulta = construirConsultaBase(filtros);

        String sql = """
                SELECT
                    nombre_plan AS nombre,
                    COALESCE(SUM(visualizacion_real), 0) AS visualizaciones,
                    COALESCE(SUM(horas_vistas), 0) AS horas_vistas
                FROM analisis_streaming_kpis
                %s
                GROUP BY nombre_plan
                ORDER BY visualizaciones DESC
                """.formatted(consulta.where());

        return jdbcTemplate.query(
                sql,
                consulta.parametros().toArray(),
                (resultado, numeroFila) -> new ConsumoPlanDto(
                        resultado.getString("nombre"),
                        resultado.getLong("visualizaciones"),
                        resultado.getBigDecimal("horas_vistas")
                )
        );
    }

    private ConsultaFiltrada construirConsultaBase(FiltroKpiRequest filtros) {
        StringBuilder where = new StringBuilder("""
                WHERE nombre_plan IS NOT NULL
                  AND nombre_plan <> ''
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

    private record ConsultaFiltrada(
            String where,
            List<Object> parametros
    ) {
    }
}