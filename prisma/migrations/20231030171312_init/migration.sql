/*
  Warnings:

  - You are about to drop the `niveles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `userlevelFK`;

-- DropTable
DROP TABLE `niveles`;

-- DropTable
DROP TABLE `usuarios`;

-- CreateTable
CREATE TABLE `CLIENTES` (
    `CLI_CLAVE` VARCHAR(10) NOT NULL,
    `CLI_ESTATUS` VARCHAR(15) NULL,
    `CLI_NOMBRE` VARCHAR(100) NULL,
    `CLI_REG_FISCAL` VARCHAR(3) NULL,
    `CLI_EST_TIMBRADO` VARCHAR(5) NULL,

    UNIQUE INDEX `CLI_CLAVE_UNIQUE`(`CLI_CLAVE`),
    PRIMARY KEY (`CLI_CLAVE`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizacion_detalle` (
    `folio_cotizacion` INTEGER NOT NULL,
    `id_parte` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_parte` VARCHAR(30) NULL,
    `cav` INTEGER NULL,
    `machine_type` VARCHAR(10) NULL,
    `costo_hora_maquina` DECIMAL(11, 4) NULL,
    `ciclos` INTEGER NULL,
    `pcs_hora` DECIMAL(11, 4) NULL,
    `porc_ineficiencia` DECIMAL(6, 4) NULL,
    `production` DECIMAL(11, 4) NULL,
    `margin4` DECIMAL(11, 4) NULL,
    `packing_cost` DECIMAL(11, 4) NULL,
    `pcs_packing` INTEGER NULL,
    `packing` DECIMAL(11, 4) NULL,
    `pcs_entrega` INTEGER NULL,
    `flete_cost` DECIMAL(11, 4) NULL,
    `logistic_cost` DECIMAL(11, 4) NULL,
    `packing_outside_service` DECIMAL(11, 4) NULL,
    `hr_mantto` INTEGER NULL,
    `cost_hr_mtto` DECIMAL(11, 4) NULL,
    `pcs_mtto` INTEGER NULL,
    `tooling_maintance` DECIMAL(11, 4) NULL,
    `ovh_ind_porc` DECIMAL(6, 4) NULL,
    `overhead` DECIMAL(11, 4) NULL,
    `overhead_margin` DECIMAL(11, 4) NULL,
    `profit_porc` DECIMAL(6, 4) NULL,
    `profit` DECIMAL(11, 4) NULL,
    `margin_profit` DECIMAL(11, 4) NULL,
    `unit_price` DECIMAL(11, 4) NULL,
    `margin_total` DECIMAL(11, 4) NULL,
    `total_materias_primas` DECIMAL(11, 4) NULL,
    `materias_primas_porc` DECIMAL(6, 4) NULL,
    `total_produccion` DECIMAL(11, 4) NULL,
    `produccion_porc` DECIMAL(6, 4) NULL,
    `total_empaque_logistica` DECIMAL(11, 4) NULL,
    `empaque_logistica_porc` DECIMAL(6, 4) NULL,
    `total_mantenimiento` DECIMAL(11, 4) NULL,
    `mantenimiento_porc` DECIMAL(6, 4) NULL,
    `kg_material` DECIMAL(11, 4) NULL,
    `moq` INTEGER NULL,
    `eau` INTEGER NULL,
    `total` DECIMAL(11, 4) NULL,
    `ingresos` DECIMAL(11, 4) NULL,
    `costo_ventas` DECIMAL(11, 4) NULL,
    `costo_materia_prima` DECIMAL(11, 4) NULL,
    `costo_mano_obra` DECIMAL(11, 4) NULL,
    `gastos_fabricacion` DECIMAL(11, 4) NULL,
    `utilidad_bruta` DECIMAL(11, 4) NULL,
    `egresos` DECIMAL(11, 4) NULL,
    `gastos_fijos` DECIMAL(11, 4) NULL,
    `utilidad_antes_ebitda` DECIMAL(11, 4) NULL,
    `isr` DECIMAL(11, 4) NULL,
    `ptu` DECIMAL(11, 4) NULL,
    `utilidad_neta` DECIMAL(11, 4) NULL,
    `margen_neto` DECIMAL(6, 4) NULL,

    UNIQUE INDEX `folio_cotizacion_UNIQUE`(`folio_cotizacion`),
    UNIQUE INDEX `id_parte_UNIQUE`(`id_parte`),
    PRIMARY KEY (`folio_cotizacion`, `id_parte`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizacion_materiales` (
    `folio_cotizacion` INTEGER NOT NULL,
    `id_parte` INTEGER NOT NULL,
    `id_material` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_material` VARCHAR(30) NULL,
    `supplier_resin` DECIMAL(11, 4) NULL,
    `part_g` DECIMAL(11, 4) NULL,
    `runner_porc` DECIMAL(6, 4) NULL,
    `runner_g` DECIMAL(11, 4) NULL,
    `loss_porc` DECIMAL(6, 4) NULL,
    `weigth` DECIMAL(11, 4) NULL,
    `resin_basis` DECIMAL(11, 4) NULL,
    `ovh_cost_porc` DECIMAL(6, 4) NULL,
    `resin_cot` DECIMAL(11, 4) NULL,
    `total_mat` DECIMAL(11, 4) NULL,
    `gk_porc` DECIMAL(6, 4) NULL,
    `gk` DECIMAL(11, 4) NULL,
    `scrap_porc` DECIMAL(6, 4) NULL,
    `margin_scrap` DECIMAL(11, 4) NULL,
    `margin2` DECIMAL(11, 4) NULL,
    `porc_margin_seguridad` DECIMAL(6, 4) NULL,
    `margin_seguridad` DECIMAL(11, 4) NULL,
    `total_mat_prima` DECIMAL(11, 4) NULL,

    PRIMARY KEY (`id_material`, `folio_cotizacion`, `id_parte`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cotizaciones` (
    `folio_cotizacion` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_generacion` DATE NULL,
    `clase_cliente` VARCHAR(1) NULL,
    `codigo_cliente_prospecto` VARCHAR(10) NULL,
    `tipo_cliente` VARCHAR(40) NULL,
    `tipo_proceso` VARCHAR(40) NULL,
    `tipo_precio` VARCHAR(40) NULL,
    `total` DECIMAL(15, 2) NULL,
    `estatus` VARCHAR(1) NULL,
    `codigo_vendedor` INTEGER NULL,

    UNIQUE INDEX `folio_cotizacion_UNIQUE`(`folio_cotizacion`),
    PRIMARY KEY (`folio_cotizacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `maquina` (
    `tipo_proceso` VARCHAR(40) NOT NULL,
    `machine_type` VARCHAR(10) NOT NULL,
    `costo_hora` DECIMAL(11, 2) NULL,

    UNIQUE INDEX `tipo_proceso_UNIQUE`(`tipo_proceso`),
    UNIQUE INDEX `machine_type_UNIQUE`(`machine_type`),
    PRIMARY KEY (`machine_type`, `tipo_proceso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `material` (
    `codigo_material` VARCHAR(30) NOT NULL,
    `nombre_material` VARCHAR(200) NULL,
    `resin_basis` DECIMAL(11, 4) NULL,
    `fecha_ult_cotiz` DATE NULL,

    UNIQUE INDEX `codigo_material_UNIQUE`(`codigo_material`),
    PRIMARY KEY (`codigo_material`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `param_industria` (
    `tipo_cliente` VARCHAR(40) NOT NULL,
    `tipo_precio` VARCHAR(20) NOT NULL,
    `overhead_cost_porc` DECIMAL(6, 4) NULL,
    `loss_porc` DECIMAL(6, 4) NULL,
    `gk_porc` DECIMAL(6, 4) NULL,
    `scrap_porc` DECIMAL(6, 4) NULL,
    `ineficiencia_porc` DECIMAL(6, 4) NULL,
    `mtto_cost_hr` DECIMAL(11, 4) NULL,
    `overhead_porc` DECIMAL(6, 4) NULL,
    `profit_porc` DECIMAL(6, 4) NULL,

    UNIQUE INDEX `tipo_cliente_UNIQUE`(`tipo_cliente`),
    UNIQUE INDEX `tipo_precio_UNIQUE`(`tipo_precio`),
    PRIMARY KEY (`tipo_cliente`, `tipo_precio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parte` (
    `codigo_parte` VARCHAR(30) NOT NULL,
    `nombre_parte` VARCHAR(200) NULL,

    UNIQUE INDEX `codigo_parte_UNIQUE`(`codigo_parte`),
    PRIMARY KEY (`codigo_parte`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prospecto` (
    `codigo_prospecto` VARCHAR(10) NOT NULL,
    `nombre_prospecto` VARCHAR(100) NULL,

    UNIQUE INDEX `codigo_prospecto_UNIQUE`(`codigo_prospecto`),
    PRIMARY KEY (`codigo_prospecto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendedor` (
    `codigo_vendedor` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_vendedor` VARCHAR(100) NULL,

    UNIQUE INDEX `codigo_vendedor_UNIQUE`(`codigo_vendedor`),
    PRIMARY KEY (`codigo_vendedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
