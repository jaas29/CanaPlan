-- CreateTable
CREATE TABLE "lots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "farm_group" TEXT,
    "variety" TEXT,
    "area_ha" REAL NOT NULL,
    "lifecycle_status" TEXT NOT NULL DEFAULT 'soca',
    "harvest_cycle_count" INTEGER NOT NULL DEFAULT 0,
    "soil_reference_zone" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "n_pct" REAL NOT NULL,
    "p2o5_pct" REAL NOT NULL,
    "k2o_pct" REAL NOT NULL,
    "s_pct" REAL NOT NULL DEFAULT 0,
    "mgo_pct" REAL NOT NULL DEFAULT 0,
    "cao_pct" REAL NOT NULL DEFAULT 0,
    "kg_per_sack" REAL NOT NULL DEFAULT 50,
    "nitrogen_source" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "harvest_seasons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "fertilization_plans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lot_id" INTEGER NOT NULL,
    "harvest_season_id" INTEGER NOT NULL,
    "target_tch" REAL NOT NULL,
    "n_rate_per_tch" REAL NOT NULL DEFAULT 1.2,
    "n_required_kg" REAL,
    "status" TEXT NOT NULL DEFAULT 'borrador',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "fertilization_plans_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fertilization_plans_harvest_season_id_fkey" FOREIGN KEY ("harvest_season_id") REFERENCES "harvest_seasons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plan_applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan_id" INTEGER NOT NULL,
    "application_number" INTEGER NOT NULL,
    "formula_id" INTEGER NOT NULL,
    "planned_date" DATETIME,
    "sacks_per_ha" REAL NOT NULL,
    "total_sacks" REAL NOT NULL,
    "dose_kg_per_ha" REAL,
    "n_contributed_kg" REAL,
    "p2o5_contributed_kg" REAL,
    "k2o_contributed_kg" REAL,
    "s_contributed_kg" REAL,
    "mgo_contributed_kg" REAL,
    "cao_contributed_kg" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plan_applications_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "fertilization_plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plan_applications_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "application_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan_application_id" INTEGER,
    "lot_id" INTEGER NOT NULL,
    "formula_id" INTEGER NOT NULL,
    "actual_date" DATETIME NOT NULL,
    "actual_sacks" REAL NOT NULL,
    "actual_kg_per_ha" REAL,
    "operator_name" TEXT,
    "observations" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "application_records_plan_application_id_fkey" FOREIGN KEY ("plan_application_id") REFERENCES "plan_applications" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "application_records_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "application_records_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "yield_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lot_id" INTEGER NOT NULL,
    "harvest_season_id" INTEGER NOT NULL,
    "harvest_date" DATETIME,
    "actual_tch" REAL NOT NULL,
    "total_tons" REAL,
    "target_tch" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "yield_results_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "yield_results_harvest_season_id_fkey" FOREIGN KEY ("harvest_season_id") REFERENCES "harvest_seasons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
