-- CreateEnum
CREATE TYPE "PapelVinculo" AS ENUM ('TUTOR', 'MONITOR', 'APOIO');

-- CreateTable
CREATE TABLE "oficinas" (
    "id" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "descricao" TEXT,
    "data" DATE NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL,
    "local" TEXT NOT NULL,
    "professor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oficinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vinculos" (
    "id" TEXT NOT NULL,
    "oficinaId" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "papel" "PapelVinculo" NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vinculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos" (
    "id" TEXT NOT NULL,
    "oficinaId" TEXT NOT NULL,
    "instituicao" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atendimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vinculos_voluntarioId_idx" ON "vinculos"("voluntarioId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculos_oficinaId_voluntarioId_key" ON "vinculos"("oficinaId", "voluntarioId");

-- CreateIndex
CREATE INDEX "atendimentos_oficinaId_idx" ON "atendimentos"("oficinaId");

-- AddForeignKey
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_oficinaId_fkey" FOREIGN KEY ("oficinaId") REFERENCES "oficinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculos" ADD CONSTRAINT "vinculos_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "voluntarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_oficinaId_fkey" FOREIGN KEY ("oficinaId") REFERENCES "oficinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
