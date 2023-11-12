-- CreateTable
CREATE TABLE `niveles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nivel` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` TEXT NULL,
    `apellidos` TEXT NULL,
    `usuario` TEXT NULL,
    `contraseña` TEXT NULL,
    `id_nivel` INTEGER UNSIGNED NOT NULL,

    INDEX `userlevelFK`(`id_nivel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `userlevelFK` FOREIGN KEY (`id_nivel`) REFERENCES `niveles`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
