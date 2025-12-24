import { relations } from 'drizzle-orm/relations';
import {
  users,
  auditLogs,
  workOrders,
  workOrderStatusHistory,
  serviceStatuses,
  parts,
  inventoryMovements,
  roles,
  clients,
  vehicles,
  serviceTypes,
  serviceParts,
  repairLogs,
} from './schema';

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  auditLogs: many(auditLogs),
  workOrderStatusHistories: many(workOrderStatusHistory),
  inventoryMovements: many(inventoryMovements),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  workOrders_assignedMechanicId: many(workOrders, {
    relationName: 'workOrders_assignedMechanicId_users_id',
  }),
  workOrders_createdBy: many(workOrders, {
    relationName: 'workOrders_createdBy_users_id',
  }),
  repairLogs: many(repairLogs),
}));

export const workOrderStatusHistoryRelations = relations(
  workOrderStatusHistory,
  ({ one }) => ({
    workOrder: one(workOrders, {
      fields: [workOrderStatusHistory.workOrderId],
      references: [workOrders.id],
    }),
    serviceStatus_previousStatusId: one(serviceStatuses, {
      fields: [workOrderStatusHistory.previousStatusId],
      references: [serviceStatuses.id],
      relationName:
        'workOrderStatusHistory_previousStatusId_serviceStatuses_id',
    }),
    serviceStatus_newStatusId: one(serviceStatuses, {
      fields: [workOrderStatusHistory.newStatusId],
      references: [serviceStatuses.id],
      relationName: 'workOrderStatusHistory_newStatusId_serviceStatuses_id',
    }),
    user: one(users, {
      fields: [workOrderStatusHistory.changedById],
      references: [users.id],
    }),
  }),
);

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  workOrderStatusHistories: many(workOrderStatusHistory),
  inventoryMovements: many(inventoryMovements),
  client: one(clients, {
    fields: [workOrders.clientId],
    references: [clients.id],
  }),
  vehicle: one(vehicles, {
    fields: [workOrders.vehicleId],
    references: [vehicles.id],
  }),
  user_assignedMechanicId: one(users, {
    fields: [workOrders.assignedMechanicId],
    references: [users.id],
    relationName: 'workOrders_assignedMechanicId_users_id',
  }),
  serviceType: one(serviceTypes, {
    fields: [workOrders.serviceTypeId],
    references: [serviceTypes.id],
  }),
  serviceStatus: one(serviceStatuses, {
    fields: [workOrders.serviceStatusId],
    references: [serviceStatuses.id],
  }),
  user_createdBy: one(users, {
    fields: [workOrders.createdBy],
    references: [users.id],
    relationName: 'workOrders_createdBy_users_id',
  }),
  serviceParts: many(serviceParts),
  repairLogs: many(repairLogs),
}));

export const serviceStatusesRelations = relations(
  serviceStatuses,
  ({ many }) => ({
    workOrderStatusHistories_previousStatusId: many(workOrderStatusHistory, {
      relationName:
        'workOrderStatusHistory_previousStatusId_serviceStatuses_id',
    }),
    workOrderStatusHistories_newStatusId: many(workOrderStatusHistory, {
      relationName: 'workOrderStatusHistory_newStatusId_serviceStatuses_id',
    }),
    workOrders: many(workOrders),
  }),
);

export const inventoryMovementsRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    part: one(parts, {
      fields: [inventoryMovements.partId],
      references: [parts.id],
    }),
    workOrder: one(workOrders, {
      fields: [inventoryMovements.workOrderId],
      references: [workOrders.id],
    }),
    user: one(users, {
      fields: [inventoryMovements.userId],
      references: [users.id],
    }),
  }),
);

export const partsRelations = relations(parts, ({ many }) => ({
  inventoryMovements: many(inventoryMovements),
  serviceParts: many(serviceParts),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  client: one(clients, {
    fields: [vehicles.clientId],
    references: [clients.id],
  }),
  workOrders: many(workOrders),
  repairLogs: many(repairLogs),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  vehicles: many(vehicles),
  workOrders: many(workOrders),
}));

export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  workOrders: many(workOrders),
}));

export const servicePartsRelations = relations(serviceParts, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [serviceParts.serviceId],
    references: [workOrders.id],
  }),
  part: one(parts, {
    fields: [serviceParts.partId],
    references: [parts.id],
  }),
}));

export const repairLogsRelations = relations(repairLogs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [repairLogs.vehicleId],
    references: [vehicles.id],
  }),
  workOrder: one(workOrders, {
    fields: [repairLogs.serviceId],
    references: [workOrders.id],
  }),
  user: one(users, {
    fields: [repairLogs.technicianId],
    references: [users.id],
  }),
}));
