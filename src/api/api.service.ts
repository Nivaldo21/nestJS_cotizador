import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma, cotizacion_detalle, cotizacion_materiales, cotizaciones, maquina, material, param_industria, parte, prospecto, vendedor } from "@prisma/client";
import { Detalle_cotizacion_response, Request_SearchCotizacion, Request_SearchMaquina, Request_SearchParamIndustria, Request_saveCotizacion, WhereConditions, clientesProspectos } from "src/interfaces";
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
        return filteredCotizaciones;
    }

    async getEstadoResultado(code_cotizacion:any):Promise<any>{
        const cotizacion_detalle = await this.prisma.cotizacion_detalle.findMany({where:{
            folio_cotizacion: Number(code_cotizacion)
        }})

        for (let i = 0; i < cotizacion_detalle.length; i++) {
            const detalle = cotizacion_detalle[i];
            const codigoParte = detalle.codigo_parte;
            // Realizar la consulta para encontrar la parte con el código correspondiente
            const parteEncontrada = await this.prisma.parte.findUnique({
                where: {
                    codigo_parte: codigoParte // Usar el código de parte del objeto actual
                }
            });

            const detalleConParte = { ...detalle, parteEncontrada };
            cotizacion_detalle[i] = detalleConParte;
        }

        await this.prisma.parte.findUnique({where: {codigo_parte: ''}})

        const cotizacion = await this.prisma.cotizaciones.findUnique({where:{ folio_cotizacion: Number(code_cotizacion)}})

        let data_cliente_prospecto = null;
        if (cotizacion.clase_cliente == 'P') {
            data_cliente_prospecto = await this.prisma.prospecto.findUnique({where: {codigo_prospecto: Number(cotizacion.codigo_cliente_prospecto)}})
        }else{
            data_cliente_prospecto = await this.prisma.cLIENTES.findUnique({where: {CLI_CLAVE : cotizacion.codigo_cliente_prospecto}})
        }

        const data_vendedor = await this.prisma.vendedor.findUnique({where:{codigo_vendedor: cotizacion.codigo_vendedor}});

        return {data: {
            cotizacion_data: cotizacion,
            vendedor: data_vendedor,
            cliente_prospecto: data_cliente_prospecto,
            cotizacion_detalle_array: cotizacion_detalle
        }, status: 200}
    }

    async saveCotizacion(data:Request_saveCotizacion): Promise<any>{
        const transaction = await this.prisma.$transaction(async (prisma) => {
            //VALIDAR SI EL "CLIENTE" EXISTE, SI NO EXISTE PONERLO EN PROSPECTO Y POSTERIORIMENTE PONER LA VANDERA SI ES CLIENTE O PROPSECTO
            let flagEsPropspecto:boolean = false;
            let resp_cliente:any = null;
            if (data.cliente_prospecto.codigo_prospecto) {
                flagEsPropspecto = true;
                resp_cliente = await prisma.prospecto.findFirst({ where: {codigo_prospecto:  data.cliente_prospecto.codigo_prospecto} });
            }else{
                if (data.cliente_prospecto.CLI_CLAVE) {
                    resp_cliente = await prisma.cLIENTES.findFirst({ where: {CLI_CLAVE:  data.cliente_prospecto.CLI_CLAVE} });
                }else{
                    flagEsPropspecto = true;
                    resp_cliente = await prisma.prospecto.create({ data:{nombre_prospecto: data.cliente_prospecto.CLI_NOMBRE} });
                }
            }        
            //VALIDAR SI EL "VENDEDOR" EXISTE, SI NO EXISTE PONERLO en tabla de vendedor
            let flagNuevoVendedor:boolean = false;
            let nuevoVendedor:vendedor = null;
            if (!data.vendedor.codigo_vendedor) {
                flagNuevoVendedor = true;
                nuevoVendedor = await prisma.vendedor.create({data: { nombre_vendedor: data.vendedor.nombre_vendedor } })
            }

            //CREAR LA COTIZACION
            const today = new Date().toISOString();
            let cotizacion_insert = {
                fecha_generacion: today,
                clase_cliente: flagEsPropspecto ? 'P' : 'C', //C - Cliente, P - Próspecto
                codigo_cliente_prospecto: flagEsPropspecto ? resp_cliente.codigo_prospecto : resp_cliente.CLI_CLAVE,
                tipo_cliente: data.tipo_cliente,
                tipo_proceso: data.tipo_proceso,
                tipo_precio: data.precios,
                total: data.total,
                estatus: 'G',
                codigo_vendedor: flagNuevoVendedor ?  nuevoVendedor.codigo_vendedor : data.vendedor.codigo_vendedor,
            }
            const cotizacion_created:cotizaciones = await prisma.cotizaciones.create({ data: cotizacion_insert });

            //COTIZACION DETALLE
            for (const element of data.cotizacion_array) {        
                let parte_serached = await prisma.parte.findFirst({where: {codigo_parte: element.codigo_parte}});
                let parte_insert_detalle:parte;
                if (!parte_serached) { //REVISAR SI LA PARTE QUE SE REGISTRO EXISTE, SI NO REGISTRARLA
                    parte_insert_detalle = await prisma.parte.create({data: {codigo_parte: element.codigo_parte, nombre_parte: element.descripcion_parte}});
                }else{ parte_insert_detalle = parte_serached; }

                 // ESTADO DE RESULTADOS -  CALCULADOS ++++++++
                const ingresos_result = (Number(element.unit_price)+Number(element.margin_total))*Number(element.eau);
                const costo_materia_prima_result = (element.total_materia_prima+element.total_materia_prima_gk + element.total_materia_prima_margin_2 + element.total_materia_prima_margen_seguridad)*Number(element.eau);
                const costo_mano_obra_resut = (Number(element.production)+Number(element.margin_4))*Number(element.eau);
                const gastos_fabricacion_result = (Number(element.packing_and_outside_service)*Number(element.eau))+(Number(element.tooling_mantiance)*Number(element.eau));
                const utilidad_antes_ebitda_result = (ingresos_result - (costo_materia_prima_result + costo_mano_obra_resut + gastos_fabricacion_result)) - ((Number(element.overhead )+ Number(element.margin_overhead))*Number(element.eau))
                
                const utilidad_neta_toFixed = utilidad_antes_ebitda_result - ( utilidad_antes_ebitda_result * 0.3) - (utilidad_antes_ebitda_result * 0.1);
                const margen_neto_tofixed = (utilidad_antes_ebitda_result -  ( utilidad_antes_ebitda_result * 0.3) - (utilidad_antes_ebitda_result * 0.1)) / ingresos_result;

                const margen_antes_ebitda_result = utilidad_antes_ebitda_result / ingresos_result;
                let obj_estadoResultados:any = {
                    ingresos: ingresos_result.toFixed(4),
                    costo_materia_prima: costo_materia_prima_result,
                    costo_mano_obra: costo_mano_obra_resut,
                    gastos_fabricacion: gastos_fabricacion_result,
                    costo_ventas: costo_materia_prima_result + costo_mano_obra_resut + gastos_fabricacion_result,
                    utilidad_bruta: ingresos_result - (costo_materia_prima_result + costo_mano_obra_resut + gastos_fabricacion_result),
                    gastos_fijos: (Number(element.overhead) + Number(element.margin_overhead))*Number(element.eau),
                    egresos: (Number(element.overhead) + Number(element.margin_overhead))*Number(element.eau),
                    utilidad_antes_ebitda: utilidad_antes_ebitda_result,
                    margen_antes_ebitda: margen_antes_ebitda_result.toFixed(4),
                    isr: utilidad_antes_ebitda_result * 0.3,
                    ptu: utilidad_antes_ebitda_result * 0.1,
                    utilidad_neta: utilidad_neta_toFixed.toFixed(4),
                    margen_neto: margen_neto_tofixed.toFixed(4)
                }

                const regex_11_4 = /^\d{1,7}(\.\d{1,4})?$/;
                const regex_6_4 = /^\d{1,2}(\.\d{1,4})?$/;
                if (!regex_11_4.test(obj_estadoResultados.ingresos) || !regex_6_4.test(obj_estadoResultados.margen_neto) || !regex_11_4.test(obj_estadoResultados.utilidad_neta) || !regex_6_4.test(obj_estadoResultados.margen_antes_ebitda)) {
                    throw new HttpException('Un valor que se calcula para el estado de resultados no cumple con el formato de decimal(11,4) o decimal(6,4)', HttpStatus.BAD_REQUEST);
                }
                
                let cotizacion_detalle_created:cotizacion_detalle = await prisma.cotizacion_detalle.create({
                    data: {
                        folio_cotizacion: cotizacion_created.folio_cotizacion,
                        codigo_parte: parte_insert_detalle.codigo_parte,
                        cav: Number(element.cav),

                        machine_type: element.tipo_maquina,
                        costo_hora_maquina: element.costo_hora_maquina,
                        ciclos: Number(element.cyclus),
                        pcs_hora: Number(element.pcs_hr),
                        production: element.production,
                        porc_ineficiencia: Number(element.ineficiencia_porcentaje),
                        margin4: Number(element.margin_4),

                        packing_cost: Number(element.packing_cost),
                        pcs_packing: Number(element.pcs_packing),
                        packing: Number(element.packing),
                        pcs_entrega: Number(element.pcs_entrega),
                        flete_cost: Number(element.costo_flete),
                        logistic_cost: Number(element.costo_logistico),
                        packing_outside_service: Number(element.packing_and_outside_service),

                        hr_mantto: Number(element.hr_mtto),
                        cost_hr_mtto: Number(element.cost_hr),
                        pcs_mtto: Number(element.pcs_mantto),
                        tooling_maintance: Number(element.tooling_mantiance),

                        ovh_ind_porc: Number(element.percent_overhead),
                        overhead: Number(element.overhead),
                        overhead_margin: Number(element.margin_overhead),
                        profit_porc: Number(element.percent_proffit),
                        profit : Number(element.proffit),
                        margin_profit: Number(element.margin_profit),
                        unit_price: Number(element.unit_price),
                        margin_total: Number(element.margin_total),

                        total_materias_primas: Number(element.total_materia_prima),
                        materias_primas_porc: element.total_materia_prima/Number(element.unit_price),
                        total_produccion: element.tabla_total_produccion,
                        produccion_porc:  element.tabla_produccion_porc,
                        total_empaque_logistica:  element.tabla_total_empaque_logistica,
                        empaque_logistica_porc:  element.tabla_empaque_logistica_porc,
                        total_mantenimiento:  element.tabla_total_mantenimiento,
                        mantenimiento_porc:  element.tabla_mantenimiento_porc,

                        kg_material: Number(element.kg_material),
                        moq: Number(element.moq),
                        eau: Number(element.eau),
                        total: Number(element.total),

                        //PARA EL ESTADO DE RESULTADOS - SON CALCULADOS AQUI EN EL BACK ++++++++
                        ingresos: parseFloat(obj_estadoResultados.ingresos),
                        costo_ventas: obj_estadoResultados.costo_ventas,
                        costo_materia_prima: obj_estadoResultados.costo_materia_prima,
                        costo_mano_obra: obj_estadoResultados.costo_mano_obra,
                        gastos_fabricacion: obj_estadoResultados.gastos_fabricacion,
                        utilidad_bruta: obj_estadoResultados.utilidad_bruta,
                        egresos: obj_estadoResultados.egresos,
                        gastos_fijos: obj_estadoResultados.gastos_fijos,
                        utilidad_antes_ebitda: obj_estadoResultados.utilidad_antes_ebitda,
                        margen_antes_ebitda: obj_estadoResultados.margen_antes_ebitda,
                        isr: obj_estadoResultados.isr,
                        ptu: obj_estadoResultados.ptu,
                        utilidad_neta: parseFloat(obj_estadoResultados.utilidad_neta),
                        margen_neto: parseFloat(obj_estadoResultados.margen_neto),

                    }
                })

                //DETALLE COTIZACION MATERIALES == COTIZACION MATERIAL
                const materiasPrimas = element.materias_primas;
                for (let i = 0; i < materiasPrimas.length; i++) {
                    const materiaPrima = materiasPrimas[i];
                    const materiaPrima_searched =await prisma.material.findFirst({where: {codigo_material: materiaPrima.codigo_materia_prima}});
                    let material_insert_detalle:material;
                    if (!materiaPrima_searched) {
                        material_insert_detalle = await prisma.material.create({
                            data:{
                                codigo_material: materiaPrima.codigo_materia_prima, 
                                nombre_material: materiaPrima.descripcion_materia_prima,
                                resin_basis: Number(materiaPrima.resin_basis),
                                fecha_ult_cotiz: new Date().toISOString()
                            }
                        });
                    }else{material_insert_detalle = materiaPrima_searched; }

                    let cotizacion_materia_inserted:cotizacion_materiales = await prisma.cotizacion_materiales.create({
                        data: {
                            folio_cotizacion: cotizacion_created.folio_cotizacion,
                            id_parte: cotizacion_detalle_created.id_parte,
                            codigo_material: materiaPrima.codigo_materia_prima,
                            supplier_resin: materiaPrima.SUPPLIER_RESIN,
                            part_g: Number(materiaPrima.parte_g),
                            runner_porc: Number(materiaPrima.RUNNER_percent),
                            runner_g: Number(materiaPrima.RUNNER_g),
                            loss_porc: Number(materiaPrima.loss_percent),
                            weigth: Number(materiaPrima.weigth),
                            resin_basis: Number(materiaPrima.resin_basis),
                            ovh_cost_porc: Number(materiaPrima.overhead_cost),
                            resin_cot: Number(materiaPrima.resin_cot),
                            total_mat: Number(materiaPrima.total_mat),
                            gk_porc: Number(materiaPrima.GK_percent),
                            gk: Number(materiaPrima.GK),
                            scrap_porc: Number(materiaPrima.scrap_percent),
                            margin_scrap: Number(materiaPrima.margin_scrap),
                            margin2: Number(materiaPrima.margin_2),
                            porc_margin_seguridad: Number(materiaPrima.margen_seguridad_percent),
                            margin_seguridad: Number(materiaPrima.margen_seguridad),
                            total_mat_prima: Number(element.total_materia_prima),
                        }
                    });
                }
            }
        });
        return { status: 200 };
    }

    async getCotizacionByCode(code_cotizacion:any):Promise<any>{
        const cotizacion = await this.prisma.cotizaciones.findFirst({where:{folio_cotizacion : Number(code_cotizacion)}});
        const cotizacion_detalle = await this.prisma.cotizacion_detalle.findMany({where: {folio_cotizacion:  Number(code_cotizacion)}})

        let promises: Promise<any>[] = []; // Almacenar las promesas de cotizacion_materiales

        const aux: Detalle_cotizacion_response[] = await Promise.all(cotizacion_detalle.map(async (item) => {
            const cotizacion_materiales = this.prisma.cotizacion_materiales.findMany({
                where: { folio_cotizacion: Number(code_cotizacion), id_parte: item.id_parte }
            });
            promises.push(cotizacion_materiales);

            return {
                cotizacion_detalle_item: item,
                cotizacion_mteriales_items: await cotizacion_materiales
            };
        }));

        // Esperar a que todas las promesas de cotizacion_materiales se resuelvan
        await Promise.all(promises);

        let obj_respone:any={
            cotizacion: cotizacion,
            cotizacion_items: aux
        };
        return obj_respone;
    }

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

        return result;
    }

    /* TABLA PARAM_INDUSTRIA */
    async getParamIndustria(data:Request_SearchParamIndustria):Promise<param_industria>{
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