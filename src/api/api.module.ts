import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from "src/filters/http-exception.filter";

@Module({
    controllers: [ApiController],
    providers: [ApiService, {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter,
      },],
    imports: [PrismaModule],
})
export class ApiModule {}