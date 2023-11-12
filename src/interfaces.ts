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