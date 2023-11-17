import { CLIENTES,prospecto } from "@prisma/client";

export interface Request_SearchCotizacion{
    folio_cotizacion?: string;
    fecha_generacion_desde?: string;
    fecha_generacion_hasta?: string;
    cliente?: string;
    estatus?: string;
}

export interface WhereConditions {
    CLI_CLAVE: any;
    CLI_NOMBRE?: {};
  }

export interface clientesProspectos{
    PROSPECTOS: prospecto[];
    CLIENTES: CLIENTES[];
}

export interface Request_SearchParamIndustria{
    tipo_cliente:any;
    tipo_precio:string;
}

export interface Request_SearchMaquina{
    tipo_proceso: string;
}

export interface Requets_Cliente_Prospecto{
    CLI_CLAVE: string;
    CLI_ESTATUS: string;
    CLI_NOMBRE: string;
    CLI_REG_FISCAL: any;
    CLI_EST_TIMBRADO: any;
}

export interface Requets_Vendedor{
    codigo_vendedor: number;
    nombre_vendedor: string;
}

export interface Request_saveCotizacion{
    cliente_prospecto: Requets_Cliente_Prospecto;
    tipo_cliente: string;
    tipo_proceso: string;
    precios: string;
    vendedor: Requets_Vendedor;
    cotizacion_array: Item_Cotizacion[];
    total: number;
    impuestos: number;
    gran_total: number;
}

export interface Materia_Prima {
    codigo_materia_prima: any,
    descripcion_materia_prima: any,
    SUPPLIER_RESIN: any,
    parte_g: any,
    RUNNER_percent: any,
    RUNNER_g: any,
    loss_percent: any,
    weigth: any,
    resin_basis: any,
    overhead_cost: any,
    resin_cot: any,
    total_mat: any,
    GK_percent: any,
    GK: any,
    scrap_percent: any,
    margin_scrap: any,
    margin_2: any,
    margen_seguridad_percent: any,
    margen_seguridad: any
}

export interface Item_Cotizacion{
    materias_primas: Materia_Prima[];
    codigo_parte: string,
    descripcion_parte: string,
    flag_nueva_parte: boolean,
    cav: string,
    total_materia_prima: number,
    tipo_maquina: string,
    costo_hora_maquina: number,
    cyclus: string,
    pcs_hr: string,
    ineficiencia_porcentaje: string,
    production: string,
    margin_4: string,
    packing_cost: string,
    pcs_packing: string,
    packing: string,
    pcs_entrega: string,
    costo_flete: string,
    costo_logistico: string,
    packing_and_outside_service: string,
    hr_mtto: string,
    cost_hr: string,
    pcs_mantto: string,
    tooling_mantiance: string,
    percent_overhead: string,
    overhead: number,
    margin_overhead: string,
    percent_proffit: string,
    proffit: string,
    margin_profit: string,
    unit_price: string,
    margin_total: string,
    kg_material: string,
    moq: string,
    eau: string,
    total: string
}