import {
  pgTable,
  index,
  integer,
  varchar,
  timestamp,
  boolean,
  foreignKey,
  bigint,
  text,
  json,
  check,
  numeric,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
// eslint-disable-next-line prettier/prettier
import { sql } from 'drizzle-orm';

export const flywaySchemaHistory = pgTable(
  'flyway_schema_history',
  {
    installedRank: integer('installed_rank').primaryKey().notNull(),
    version: varchar({ length: 50 }),
    description: varchar({ length: 200 }).notNull(),
    type: varchar({ length: 20 }).notNull(),
    script: varchar({ length: 1000 }).notNull(),
    checksum: integer(),
    installedBy: varchar('installed_by', { length: 100 }).notNull(),
    installedOn: timestamp('installed_on', { mode: 'string' })
      .defaultNow()
      .notNull(),
    executionTime: integer('execution_time').notNull(),
    success: boolean().notNull(),
  },
  (table) => [
    index('flyway_schema_history_s_idx').using(
      'btree',
      table.success.asc().nullsLast().op('bool_ops'),
    ),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    userId: varchar('user_id', { length: 21 }),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    entityId: bigint('entity_id', { mode: 'number' }),
    action: varchar({ length: 50 }).notNull(),
    description: text(),
    oldValues: json('old_values'),
    newValues: json('new_values'),
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_audit_logs_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops'),
    ),
    index('idx_audit_logs_entity_type').using(
      'btree',
      table.entityType.asc().nullsLast().op('text_ops'),
    ),
    index('idx_audit_logs_user_id').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'audit_logs_user_id_fkey',
    }).onDelete('set null'),
  ],
);

export const binnacle = pgTable('binnacle', {
  id: varchar({ length: 21 }).primaryKey().notNull(),
  kilometro: integer().notNull(),
  diagnostico: varchar({ length: 500 }).notNull(),
  trabajoRealizado: varchar('trabajo_realizado', { length: 1000 }).notNull(),
  repuestosUtilizados: varchar('repuestos_utilizados', { length: 1000 }),
  observaciones: varchar({ length: 1000 }),
  tecnicoResponsable: varchar('tecnico_responsable', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  updatedBy: varchar('updated_by', { length: 255 }),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const workOrderStatusHistory = pgTable(
  'work_order_status_history',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    workOrderId: varchar('work_order_id', { length: 21 }).notNull(),
    previousStatusId: varchar('previous_status_id', { length: 21 }),
    newStatusId: varchar('new_status_id', { length: 21 }).notNull(),
    changedById: varchar('changed_by_id', { length: 21 }),
    notes: text(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_status_history_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops'),
    ),
    index('idx_status_history_new_status_id').using(
      'btree',
      table.newStatusId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_status_history_work_order_id').using(
      'btree',
      table.workOrderId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.workOrderId],
      foreignColumns: [workOrders.id],
      name: 'work_order_status_history_work_order_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.previousStatusId],
      foreignColumns: [serviceStatuses.id],
      name: 'work_order_status_history_previous_status_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.newStatusId],
      foreignColumns: [serviceStatuses.id],
      name: 'work_order_status_history_new_status_id_fkey',
    }),
    foreignKey({
      columns: [table.changedById],
      foreignColumns: [users.id],
      name: 'work_order_status_history_changed_by_id_fkey',
    }).onDelete('set null'),
  ],
);

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    partId: varchar('part_id', { length: 21 }).notNull(),
    movementType: varchar('movement_type', { length: 255 }).notNull(),
    quantity: integer().notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }),
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }),
    stockBefore: integer('stock_before').notNull(),
    stockAfter: integer('stock_after').notNull(),
    referenceNumber: varchar('reference_number', { length: 100 }),
    notes: varchar({ length: 500 }),
    workOrderId: varchar('work_order_id', { length: 21 }),
    userId: varchar('user_id', { length: 21 }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('idx_inventory_movements_created_at').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops'),
    ),
    index('idx_inventory_movements_movement_type').using(
      'btree',
      table.movementType.asc().nullsLast().op('text_ops'),
    ),
    index('idx_inventory_movements_part_id').using(
      'btree',
      table.partId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_inventory_movements_user_id').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_inventory_movements_work_order_id').using(
      'btree',
      table.workOrderId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.partId],
      foreignColumns: [parts.id],
      name: 'inventory_movements_part_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.workOrderId],
      foreignColumns: [workOrders.id],
      name: 'inventory_movements_work_order_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'inventory_movements_user_id_fkey',
    }).onDelete('set null'),
    check('inventory_movements_quantity_check', sql`quantity > 0`),
    check('inventory_movements_stock_before_check', sql`stock_before >= 0`),
    check('inventory_movements_stock_after_check', sql`stock_after >= 0`),
    check(
      'inventory_movements_movement_type_check',
      sql`(movement_type)::text = ANY (ARRAY[('IN'::character varying)::text, ('OUT'::character varying)::text, ('ADJUSTMENT'::character varying)::text, ('TRANSFER'::character varying)::text, ('RETURN'::character varying)::text])`,
    ),
  ],
);

export const roles = pgTable(
  'roles',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    code: varchar({ length: 50 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_roles_code').using(
      'btree',
      table.code.asc().nullsLast().op('text_ops'),
    ),
    unique('roles_code_key').on(table.code),
  ],
);

export const users = pgTable(
  'users',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    username: varchar({ length: 100 }).notNull(),
    email: varchar({ length: 100 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    phone: varchar({ length: 15 }),
    roleId: varchar('role_id', { length: 21 }).notNull(),
    isActive: boolean('is_active').default(true),
    lastLogin: timestamp('last_login', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_users_email').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops'),
    ),
    index('idx_users_is_active').using(
      'btree',
      table.isActive.asc().nullsLast().op('bool_ops'),
    ),
    index('idx_users_role_id').using(
      'btree',
      table.roleId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: 'users_role_id_fkey',
    }).onDelete('restrict'),
    unique('users_username_key').on(table.username),
    unique('users_email_key').on(table.email),
  ],
);

export const clients = pgTable(
  'clients',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar({ length: 15 }),
    email: varchar({ length: 100 }),
    address: text(),
    dui: varchar({ length: 10 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_clients_dui').using(
      'btree',
      table.dui.asc().nullsLast().op('text_ops'),
    ),
    index('idx_clients_email').using(
      'btree',
      table.email.asc().nullsLast().op('text_ops'),
    ),
    index('idx_clients_is_active').using(
      'btree',
      table.isActive.asc().nullsLast().op('bool_ops'),
    ),
    index('idx_clients_phone').using(
      'btree',
      table.phone.asc().nullsLast().op('text_ops'),
    ),
  ],
);

export const vehicles = pgTable(
  'vehicles',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    brand: varchar({ length: 50 }).notNull(),
    model: varchar({ length: 50 }).notNull(),
    year: integer().notNull(),
    plate: varchar({ length: 10 }).notNull(),
    color: varchar({ length: 30 }),
    vin: varchar({ length: 17 }),
    mileage: integer(),
    engineType: varchar('engine_type', { length: 50 }),
    fuelType: varchar('fuel_type', { length: 50 }),
    clientId: varchar('client_id', { length: 21 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_vehicles_client_id').using(
      'btree',
      table.clientId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_vehicles_is_active').using(
      'btree',
      table.isActive.asc().nullsLast().op('bool_ops'),
    ),
    index('idx_vehicles_plate').using(
      'btree',
      table.plate.asc().nullsLast().op('text_ops'),
    ),
    index('idx_vehicles_vin').using(
      'btree',
      table.vin.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: 'vehicles_client_id_fkey',
    }).onDelete('cascade'),
    unique('vehicles_plate_key').on(table.plate),
    unique('vehicles_vin_key').on(table.vin),
  ],
);

export const workOrders = pgTable(
  'work_orders',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    serviceNumber: varchar('service_number', { length: 20 }).notNull(),
    description: text().notNull(),
    detailedDescription: text('detailed_description'),
    entryDate: timestamp('entry_date', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    deliveryDate: timestamp('delivery_date', { mode: 'string' }),
    estimatedDeliveryDate: timestamp('estimated_delivery_date', {
      mode: 'string',
    }),
    laborCost: numeric('labor_cost', { precision: 10, scale: 2 }).default(
      '0.00',
    ),
    totalPartsCost: numeric('total_parts_cost', {
      precision: 10,
      scale: 2,
    }).default('0.00'),
    materialCost: numeric('material_cost', { precision: 10, scale: 2 }).default(
      '0.00',
    ),
    totalCost: numeric('total_cost', { precision: 10, scale: 2 }).default(
      '0.00',
    ),
    notes: text(),
    observations: text(),
    clientId: varchar('client_id', { length: 21 }).notNull(),
    vehicleId: varchar('vehicle_id', { length: 21 }).notNull(),
    assignedMechanicId: varchar('assigned_mechanic_id', { length: 21 }),
    serviceTypeId: varchar('service_type_id', { length: 21 }).notNull(),
    serviceStatusId: varchar('service_status_id', { length: 21 }).notNull(),
    createdBy: varchar('created_by', { length: 21 }).notNull(),
    isPaid: boolean('is_paid').default(false),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_work_orders_assigned_mechanic_id').using(
      'btree',
      table.assignedMechanicId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_work_orders_client_id').using(
      'btree',
      table.clientId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_work_orders_entry_date').using(
      'btree',
      table.entryDate.asc().nullsLast().op('timestamp_ops'),
    ),
    index('idx_work_orders_is_paid').using(
      'btree',
      table.isPaid.asc().nullsLast().op('bool_ops'),
    ),
    index('idx_work_orders_service_number').using(
      'btree',
      table.serviceNumber.asc().nullsLast().op('text_ops'),
    ),
    index('idx_work_orders_service_status_id').using(
      'btree',
      table.serviceStatusId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_work_orders_service_type_id').using(
      'btree',
      table.serviceTypeId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_work_orders_vehicle_id').using(
      'btree',
      table.vehicleId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.clientId],
      foreignColumns: [clients.id],
      name: 'work_orders_client_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.vehicleId],
      foreignColumns: [vehicles.id],
      name: 'work_orders_vehicle_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.assignedMechanicId],
      foreignColumns: [users.id],
      name: 'work_orders_assigned_mechanic_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.serviceTypeId],
      foreignColumns: [serviceTypes.id],
      name: 'work_orders_service_type_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.serviceStatusId],
      foreignColumns: [serviceStatuses.id],
      name: 'work_orders_service_status_id_fkey',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: 'work_orders_created_by_fkey',
    }).onDelete('restrict'),
    unique('work_orders_service_number_key').on(table.serviceNumber),
  ],
);

export const serviceTypes = pgTable(
  'service_types',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    code: varchar({ length: 50 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    basePrice: numeric('base_price', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_service_types_code').using(
      'btree',
      table.code.asc().nullsLast().op('text_ops'),
    ),
    unique('service_types_code_key').on(table.code),
  ],
);

export const serviceStatuses = pgTable(
  'service_statuses',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    code: varchar({ length: 50 }).notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    color: varchar({ length: 7 }),
    orderNumber: integer('order_number'),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_service_statuses_code').using(
      'btree',
      table.code.asc().nullsLast().op('text_ops'),
    ),
    unique('service_statuses_code_key').on(table.code),
  ],
);

export const serviceParts = pgTable(
  'service_parts',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    serviceId: varchar('service_id', { length: 21 }).notNull(),
    partId: varchar('part_id', { length: 21 }).notNull(),
    quantity: integer().notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric({ precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_service_parts_part_id').using(
      'btree',
      table.partId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_service_parts_service_id').using(
      'btree',
      table.serviceId.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('idx_service_parts_unique').using(
      'btree',
      table.serviceId.asc().nullsLast().op('text_ops'),
      table.partId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.serviceId],
      foreignColumns: [workOrders.id],
      name: 'service_parts_service_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.partId],
      foreignColumns: [parts.id],
      name: 'service_parts_part_id_fkey',
    }).onDelete('restrict'),
  ],
);

export const parts = pgTable(
  'parts',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    partCode: varchar('part_code', { length: 50 }).notNull(),
    name: varchar({ length: 200 }).notNull(),
    description: varchar({ length: 500 }),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    currentStock: integer('current_stock').default(0).notNull(),
    minStock: integer('min_stock').default(0).notNull(),
    maxStock: integer('max_stock').default(100).notNull(),
    category: varchar({ length: 100 }),
    brand: varchar({ length: 100 }),
    model: varchar({ length: 100 }),
    location: varchar({ length: 50 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_parts_brand').using(
      'btree',
      table.brand.asc().nullsLast().op('text_ops'),
    ),
    index('idx_parts_category').using(
      'btree',
      table.category.asc().nullsLast().op('text_ops'),
    ),
    index('idx_parts_current_stock').using(
      'btree',
      table.currentStock.asc().nullsLast().op('int4_ops'),
    ),
    index('idx_parts_is_active').using(
      'btree',
      table.isActive.asc().nullsLast().op('bool_ops'),
    ),
    index('idx_parts_name').using(
      'btree',
      table.name.asc().nullsLast().op('text_ops'),
    ),
    index('idx_parts_part_code').using(
      'btree',
      table.partCode.asc().nullsLast().op('text_ops'),
    ),
    unique('parts_part_code_key').on(table.partCode),
  ],
);

export const repairLogs = pgTable(
  'repair_logs',
  {
    id: varchar({ length: 21 }).primaryKey().notNull(),
    vehicleId: varchar('vehicle_id', { length: 21 }).notNull(),
    serviceId: varchar('service_id', { length: 21 }),
    repairDate: timestamp('repair_date', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    mileage: integer(),
    diagnosis: text(),
    workPerformed: text('work_performed').notNull(),
    partsUsed: text('parts_used'),
    observations: text(),
    technicianName: varchar('technician_name', { length: 150 }),
    technicianId: varchar('technician_id', { length: 21 }),
    createdAt: timestamp('created_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp('updated_at', { mode: 'string' }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    index('idx_repair_logs_repair_date').using(
      'btree',
      table.repairDate.asc().nullsLast().op('timestamp_ops'),
    ),
    index('idx_repair_logs_service_id').using(
      'btree',
      table.serviceId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_repair_logs_technician_id').using(
      'btree',
      table.technicianId.asc().nullsLast().op('text_ops'),
    ),
    index('idx_repair_logs_vehicle_id').using(
      'btree',
      table.vehicleId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.vehicleId],
      foreignColumns: [vehicles.id],
      name: 'repair_logs_vehicle_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.serviceId],
      foreignColumns: [workOrders.id],
      name: 'repair_logs_service_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.technicianId],
      foreignColumns: [users.id],
      name: 'repair_logs_technician_id_fkey',
    }).onDelete('set null'),
  ],
);
