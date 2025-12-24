-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "flyway_schema_history" (
	"installed_rank" integer PRIMARY KEY NOT NULL,
	"version" varchar(50),
	"description" varchar(200) NOT NULL,
	"type" varchar(20) NOT NULL,
	"script" varchar(1000) NOT NULL,
	"checksum" integer,
	"installed_by" varchar(100) NOT NULL,
	"installed_on" timestamp DEFAULT now() NOT NULL,
	"execution_time" integer NOT NULL,
	"success" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"user_id" varchar(21),
	"entity_type" varchar(100) NOT NULL,
	"entity_id" bigint,
	"action" varchar(50) NOT NULL,
	"description" text,
	"old_values" json,
	"new_values" json,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "binnacle" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"kilometro" integer NOT NULL,
	"diagnostico" varchar(500) NOT NULL,
	"trabajo_realizado" varchar(1000) NOT NULL,
	"repuestos_utilizados" varchar(1000),
	"observaciones" varchar(1000),
	"tecnico_responsable" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_by" varchar(255) NOT NULL,
	"updated_by" varchar(255),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "work_order_status_history" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"work_order_id" varchar(21) NOT NULL,
	"previous_status_id" varchar(21),
	"new_status_id" varchar(21) NOT NULL,
	"changed_by_id" varchar(21),
	"notes" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"part_id" varchar(21) NOT NULL,
	"movement_type" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2),
	"total_price" numeric(10, 2),
	"stock_before" integer NOT NULL,
	"stock_after" integer NOT NULL,
	"reference_number" varchar(100),
	"notes" varchar(500),
	"work_order_id" varchar(21),
	"user_id" varchar(21),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "inventory_movements_quantity_check" CHECK (quantity > 0),
	CONSTRAINT "inventory_movements_stock_before_check" CHECK (stock_before >= 0),
	CONSTRAINT "inventory_movements_stock_after_check" CHECK (stock_after >= 0),
	CONSTRAINT "inventory_movements_movement_type_check" CHECK ((movement_type)::text = ANY (ARRAY[('IN'::character varying)::text, ('OUT'::character varying)::text, ('ADJUSTMENT'::character varying)::text, ('TRANSFER'::character varying)::text, ('RETURN'::character varying)::text]))
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "roles_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(15),
	"role_id" varchar(21) NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone" varchar(15),
	"email" varchar(100),
	"address" text,
	"dui" varchar(10),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"brand" varchar(50) NOT NULL,
	"model" varchar(50) NOT NULL,
	"year" integer NOT NULL,
	"plate" varchar(10) NOT NULL,
	"color" varchar(30),
	"vin" varchar(17),
	"mileage" integer,
	"engine_type" varchar(50),
	"fuel_type" varchar(50),
	"client_id" varchar(21) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "vehicles_plate_key" UNIQUE("plate"),
	CONSTRAINT "vehicles_vin_key" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"service_number" varchar(20) NOT NULL,
	"description" text NOT NULL,
	"detailed_description" text,
	"entry_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"delivery_date" timestamp,
	"estimated_delivery_date" timestamp,
	"labor_cost" numeric(10, 2) DEFAULT '0.00',
	"total_parts_cost" numeric(10, 2) DEFAULT '0.00',
	"material_cost" numeric(10, 2) DEFAULT '0.00',
	"total_cost" numeric(10, 2) DEFAULT '0.00',
	"notes" text,
	"observations" text,
	"client_id" varchar(21) NOT NULL,
	"vehicle_id" varchar(21) NOT NULL,
	"assigned_mechanic_id" varchar(21),
	"service_type_id" varchar(21) NOT NULL,
	"service_status_id" varchar(21) NOT NULL,
	"created_by" varchar(21) NOT NULL,
	"is_paid" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "work_orders_service_number_key" UNIQUE("service_number")
);
--> statement-breakpoint
CREATE TABLE "service_types" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "service_types_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "service_statuses" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(7),
	"order_number" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "service_statuses_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "service_parts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"service_id" varchar(21) NOT NULL,
	"part_id" varchar(21) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "parts" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"part_code" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" varchar(500),
	"unit_price" numeric(10, 2) NOT NULL,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"max_stock" integer DEFAULT 100 NOT NULL,
	"category" varchar(100),
	"brand" varchar(100),
	"model" varchar(100),
	"location" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "parts_part_code_key" UNIQUE("part_code")
);
--> statement-breakpoint
CREATE TABLE "repair_logs" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"vehicle_id" varchar(21) NOT NULL,
	"service_id" varchar(21),
	"repair_date" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"mileage" integer,
	"diagnosis" text,
	"work_performed" text NOT NULL,
	"parts_used" text,
	"observations" text,
	"technician_name" varchar(150),
	"technician_id" varchar(21),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_previous_status_id_fkey" FOREIGN KEY ("previous_status_id") REFERENCES "public"."service_statuses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_new_status_id_fkey" FOREIGN KEY ("new_status_id") REFERENCES "public"."service_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_status_history" ADD CONSTRAINT "work_order_status_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assigned_mechanic_id_fkey" FOREIGN KEY ("assigned_mechanic_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_service_status_id_fkey" FOREIGN KEY ("service_status_id") REFERENCES "public"."service_statuses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_logs" ADD CONSTRAINT "repair_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_logs" ADD CONSTRAINT "repair_logs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."work_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repair_logs" ADD CONSTRAINT "repair_logs_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "flyway_schema_history_s_idx" ON "flyway_schema_history" USING btree ("success" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_entity_type" ON "audit_logs" USING btree ("entity_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_status_history_created_at" ON "work_order_status_history" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_status_history_new_status_id" ON "work_order_status_history" USING btree ("new_status_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_status_history_work_order_id" ON "work_order_status_history" USING btree ("work_order_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_created_at" ON "inventory_movements" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_movement_type" ON "inventory_movements" USING btree ("movement_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_part_id" ON "inventory_movements" USING btree ("part_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_user_id" ON "inventory_movements" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_inventory_movements_work_order_id" ON "inventory_movements" USING btree ("work_order_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_roles_code" ON "roles" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_users_role_id" ON "users" USING btree ("role_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_clients_dui" ON "clients" USING btree ("dui" text_ops);--> statement-breakpoint
CREATE INDEX "idx_clients_email" ON "clients" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_clients_is_active" ON "clients" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_clients_phone" ON "clients" USING btree ("phone" text_ops);--> statement-breakpoint
CREATE INDEX "idx_vehicles_client_id" ON "vehicles" USING btree ("client_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_vehicles_is_active" ON "vehicles" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_vehicles_plate" ON "vehicles" USING btree ("plate" text_ops);--> statement-breakpoint
CREATE INDEX "idx_vehicles_vin" ON "vehicles" USING btree ("vin" text_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_assigned_mechanic_id" ON "work_orders" USING btree ("assigned_mechanic_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_client_id" ON "work_orders" USING btree ("client_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_entry_date" ON "work_orders" USING btree ("entry_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_is_paid" ON "work_orders" USING btree ("is_paid" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_service_number" ON "work_orders" USING btree ("service_number" text_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_service_status_id" ON "work_orders" USING btree ("service_status_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_service_type_id" ON "work_orders" USING btree ("service_type_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_work_orders_vehicle_id" ON "work_orders" USING btree ("vehicle_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_service_types_code" ON "service_types" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_service_statuses_code" ON "service_statuses" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_service_parts_part_id" ON "service_parts" USING btree ("part_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_service_parts_service_id" ON "service_parts" USING btree ("service_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_service_parts_unique" ON "service_parts" USING btree ("service_id" text_ops,"part_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_parts_brand" ON "parts" USING btree ("brand" text_ops);--> statement-breakpoint
CREATE INDEX "idx_parts_category" ON "parts" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "idx_parts_current_stock" ON "parts" USING btree ("current_stock" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_parts_is_active" ON "parts" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_parts_name" ON "parts" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_parts_part_code" ON "parts" USING btree ("part_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_repair_logs_repair_date" ON "repair_logs" USING btree ("repair_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_repair_logs_service_id" ON "repair_logs" USING btree ("service_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_repair_logs_technician_id" ON "repair_logs" USING btree ("technician_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_repair_logs_vehicle_id" ON "repair_logs" USING btree ("vehicle_id" text_ops);
*/