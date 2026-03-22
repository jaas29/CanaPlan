-- CreateTable
CREATE TABLE "varieties" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "varieties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "farm_group" TEXT,
    "variety" TEXT,
    "variety_id" INTEGER,
    "area_ha" DOUBLE PRECISION NOT NULL,
    "lifecycle_status" TEXT NOT NULL DEFAULT 'soca',
    "harvest_cycle_count" INTEGER NOT NULL DEFAULT 0,
    "soil_reference_zone" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "n_pct" DOUBLE PRECISION NOT NULL,
    "p2o5_pct" DOUBLE PRECISION NOT NULL,
    "k2o_pct" DOUBLE PRECISION NOT NULL,
    "s_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mgo_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cao_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kg_per_sack" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "cost_per_sack" DOUBLE PRECISION,
    "nitrogen_source" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvest_seasons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "harvest_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fertilization_plans" (
    "id" SERIAL NOT NULL,
    "lot_id" INTEGER NOT NULL,
    "harvest_season_id" INTEGER NOT NULL,
    "target_tch" DOUBLE PRECISION NOT NULL,
    "n_rate_per_tch" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
    "n_required_kg" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fertilization_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_applications" (
    "id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "application_number" INTEGER NOT NULL,
    "formula_id" INTEGER NOT NULL,
    "planned_date" TIMESTAMP(3),
    "sacks_per_ha" DOUBLE PRECISION NOT NULL,
    "total_sacks" DOUBLE PRECISION NOT NULL,
    "dose_kg_per_ha" DOUBLE PRECISION,
    "n_contributed_kg" DOUBLE PRECISION,
    "p2o5_contributed_kg" DOUBLE PRECISION,
    "k2o_contributed_kg" DOUBLE PRECISION,
    "s_contributed_kg" DOUBLE PRECISION,
    "mgo_contributed_kg" DOUBLE PRECISION,
    "cao_contributed_kg" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_records" (
    "id" SERIAL NOT NULL,
    "plan_application_id" INTEGER,
    "lot_id" INTEGER NOT NULL,
    "formula_id" INTEGER NOT NULL,
    "actual_date" TIMESTAMP(3) NOT NULL,
    "actual_sacks" DOUBLE PRECISION NOT NULL,
    "actual_kg_per_ha" DOUBLE PRECISION,
    "operator_name" TEXT,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_results" (
    "id" SERIAL NOT NULL,
    "lot_id" INTEGER NOT NULL,
    "harvest_season_id" INTEGER NOT NULL,
    "harvest_date" TIMESTAMP(3),
    "actual_tch" DOUBLE PRECISION NOT NULL,
    "total_tons" DOUBLE PRECISION,
    "target_tch" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yield_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soil_reference_analyses" (
    "id" SERIAL NOT NULL,
    "source_type" TEXT NOT NULL DEFAULT 'ingenio',
    "source_name" TEXT NOT NULL,
    "source_lot_code" TEXT,
    "analysis_date" TIMESTAMP(3),
    "year" INTEGER,
    "ph" DOUBLE PRECISION,
    "organic_matter_pct" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "calcium" DOUBLE PRECISION,
    "magnesium" DOUBLE PRECISION,
    "acidity" DOUBLE PRECISION,
    "iron" DOUBLE PRECISION,
    "copper" DOUBLE PRECISION,
    "zinc" DOUBLE PRECISION,
    "manganese" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soil_reference_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_soil_references" (
    "id" SERIAL NOT NULL,
    "lot_id" INTEGER NOT NULL,
    "soil_ref_id" INTEGER NOT NULL,
    "mapping_note" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_soil_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "varieties_code_key" ON "varieties"("code");

-- CreateIndex
CREATE UNIQUE INDEX "lots_code_key" ON "lots"("code");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_name_key" ON "formulas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "harvest_seasons_name_key" ON "harvest_seasons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fertilization_plans_lot_id_harvest_season_id_key" ON "fertilization_plans"("lot_id", "harvest_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_applications_plan_id_application_number_key" ON "plan_applications"("plan_id", "application_number");

-- CreateIndex
CREATE UNIQUE INDEX "yield_results_lot_id_harvest_season_id_key" ON "yield_results"("lot_id", "harvest_season_id");

-- CreateIndex
CREATE UNIQUE INDEX "lot_soil_references_lot_id_soil_ref_id_key" ON "lot_soil_references"("lot_id", "soil_ref_id");

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_variety_id_fkey" FOREIGN KEY ("variety_id") REFERENCES "varieties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fertilization_plans" ADD CONSTRAINT "fertilization_plans_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fertilization_plans" ADD CONSTRAINT "fertilization_plans_harvest_season_id_fkey" FOREIGN KEY ("harvest_season_id") REFERENCES "harvest_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_applications" ADD CONSTRAINT "plan_applications_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "fertilization_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_applications" ADD CONSTRAINT "plan_applications_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_records" ADD CONSTRAINT "application_records_plan_application_id_fkey" FOREIGN KEY ("plan_application_id") REFERENCES "plan_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_records" ADD CONSTRAINT "application_records_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_records" ADD CONSTRAINT "application_records_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_results" ADD CONSTRAINT "yield_results_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yield_results" ADD CONSTRAINT "yield_results_harvest_season_id_fkey" FOREIGN KEY ("harvest_season_id") REFERENCES "harvest_seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_soil_references" ADD CONSTRAINT "lot_soil_references_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_soil_references" ADD CONSTRAINT "lot_soil_references_soil_ref_id_fkey" FOREIGN KEY ("soil_ref_id") REFERENCES "soil_reference_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
