import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiService } from "./api.service";
import { cotizaciones } from "@prisma/client";
import { Request_SearchCotizacion, Request_SearchMaquina, Request_SearchParamIndustria } from "src/interfaces";

@Controller()
export class ApiController{

    constructor(private apiService:ApiService){}

    @Get('clientes')
    async getAllClientes(){
        return this.apiService.getClientes();
    }
    @Get('vendedores')
    async getAllVendedores(){
        return this.apiService.getVendedores();
    }
    @Get('partes')
    async getAllPartes(){
        return this.apiService.getPartes();
    }

    @Get('materiales')
    async getAllMateriales(){
        return this.apiService.getMateriales();
    }

    @Post('buscarCotizaciones')
    async buscarCotizaciones(@Body() data:Request_SearchCotizacion){
        return this.apiService.getCotizaciones(data);
    }

    @Post('buscarParamIndustria')
    async buscarParamIndustria(@Body() data:Request_SearchParamIndustria){
        return this.apiService.getParamIndustria(data);
    }

    @Post('buscarMaquinas')
    async buscarMaquinas(@Body() data:Request_SearchMaquina){
        return this.apiService.getMaquinas(data);
    }


    @Post('guardarCotizacion')
    async guardarCotizacion(@Body() data:any){
        return this.apiService.saveCotizacion(data);
    }

    @Get('')
    async getHello(){
        return "<h1>Ruta principal de API CAMCA</h1>"
    }

}