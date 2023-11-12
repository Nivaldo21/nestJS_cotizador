import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";

@Module({
    controllers: [ApiController],
    providers: [ApiService],
    imports: [PrismaModule]
})
export class ApiModule {}