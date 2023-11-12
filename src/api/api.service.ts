import { Injectable } from "@nestjs/common";
import { CLIENTES, cotizaciones, maquina, material, param_industria, parte, prospecto, vendedor } from "@prisma/client";
import { Request_SearchCotizacion, Request_SearchMaquina, Request_SearchParamIndustria, WhereConditions, clientesProspectos } from "src/interfaces";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ApiService{
    constructor(private prisma:PrismaService){}

    async getCotizaciones(data:Request_SearchCotizacion): Promise<cotizaciones[]>{
        let filters: {
            folio_cotizacion?: number;
            fecha_generacion?: {
              gte?: Date;
              lte?: Date;
            };
        } = {};

        // Filtrar por número de folio si se proporciona
        if (data.folio_cotizacion) {
            filters.folio_cotizacion = Number(data.folio_cotizacion);
        }
        // Filtrar por rango de fechas si se proporcionan ambas fechas
        if (data.fecha_generacion_desde && data.fecha_generacion_hasta) {
            filters.fecha_generacion = {
                gte: new Date(data.fecha_generacion_desde),
                lte: new Date(data.fecha_generacion_hasta),
            };
        }

        let cotizaciones;
        cotizaciones = await this.prisma.cotizaciones.findMany({
            where: filters,
        });
        
        //ADJUNTAR DETALLE CLIENTE 
         //ADJUNTAR DETALLE VENDEDOR
        const _cotizaciones = await Promise.all(
            cotizaciones.map(async (cotizacion) => {
                const result = { ...cotizacion }; // Clonamos la cotización original    
                //CLIENTE
                if (cotizacion.codigo_cliente_prospecto) {
                    const whereConditions:WhereConditions = {
                        CLI_CLAVE: cotizacion.codigo_cliente_prospecto,
                    };
            
                    if (data.cliente !== "") { //APLICO EL FILTRO DE BUSQUEDA
                        whereConditions.CLI_NOMBRE = { contains: data.cliente,};
                    }
                
                    const cliente = await this.prisma.cLIENTES.findFirst({
                        where: whereConditions
                    });
                    
                    if (cliente) {// Combina la información del cliente con la cotización
                        result.cliente = cliente; // Agregamos información del cliente al resultado
                    } else { // No se encontró coincidencia con el nombre, rompemos la iteración y no devolvemos este registro
                        return;
                    }
                }
                //VENDEDOR
                if (cotizacion.codigo_vendedor) {
                    const vendedor = await this.prisma.vendedor.findFirst({
                        where: { codigo_vendedor: cotizacion.codigo_vendedor}
                    });
                    if (vendedor) {// Combina la información del cliente con la cotización
                        result.vendedor = vendedor; // Agregamos información del vendedor al resultado
                    }
                }

                return result; // Devolvemos el resultado actualizado
            })
        );

        const filteredCotizaciones = _cotizaciones.filter((result) => result && (result.cliente || result.vendedor)); //FILTRADO POR SI NO ENCEUNTRA LOS DATOS DEL CLIENTE 
        console.log("Respuesta servicio getCotizaciones: ", filteredCotizaciones);
        return filteredCotizaciones;
    }

    /* async getCotizacionById(folio_cotizacion: number): Promise<cotizaciones>{
        return this.prisma.cotizaciones.findUnique({
            where: {folio_cotizacion}
        });
    }

    async createCotizacion(data: cotizaciones): Promise<cotizaciones>{
        return this.prisma.cotizaciones.create({
            data
        })
    }

    async updateCotizacion(folio_cotizacion: number, data: cotizaciones): Promise<cotizaciones>{
        return this.prisma.cotizaciones.update({
            where: {folio_cotizacion},
            data
        })
    }

    async deleteCotizacion(folio_cotizacion: number): Promise<cotizaciones>{
        return this.prisma.cotizaciones.delete({
            where:{folio_cotizacion}
        })
    } */

    /* TABLA CLIENTES / PROSPECTOS */
    async getClientes(): Promise<clientesProspectos>{
        let arrayProspectos = await this.prisma.prospecto.findMany();
        let arrayClientes = await this.prisma.cLIENTES.findMany({
            where: {CLI_ESTATUS : "Activo"}
        });
        return {PROSPECTOS: arrayProspectos, CLIENTES:arrayClientes}
    }

    /* TABLA Vendedor */
    async getVendedores(): Promise<vendedor[]>{
        return this.prisma.vendedor.findMany();
    }

    /* TABLA PARTES */
    async getPartes(): Promise<parte[]>{
        return this.prisma.parte.findMany();
    }

    /* TABLA MATERIALES */
    async getMateriales(): Promise<material[]>{
        const fechaHoy = new Date();
        const fechaLimite = new Date();
        fechaLimite.setMonth(fechaHoy.getMonth() - 1); // Restar un mes
        const result = await this.prisma.material.findMany({
            where: { 
                fecha_ult_cotiz: {
                    gte: fechaLimite,
                    lte: fechaHoy,
                },
             }
        });

        console.log("resultado getMateriales",result);
        return result;
    }

    /* TABLA PARAM_INDUSTRIA */
    async getParamIndustria(data:Request_SearchParamIndustria):Promise<param_industria>{
        console.log("params",data);
        //console.log("todos",result1);
        const result = await this.prisma.param_industria.findFirst({
            where: {
                tipo_cliente:  data.tipo_cliente,
                tipo_precio: data.tipo_precio
              },
        });
        if (result && result.tipo_cliente === data.tipo_cliente && result.tipo_precio === data.tipo_precio) return result;
        
        return null;
    }

    /* Tabla Maquinas */
    async getMaquinas(data:Request_SearchMaquina):Promise<maquina[]>{
        const result = await this.prisma.maquina.findMany({
            where:{
                tipo_proceso: data.tipo_proceso
            }
        })
        return result
    }
}