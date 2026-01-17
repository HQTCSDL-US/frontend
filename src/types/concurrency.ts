// Concurrency Demo Types

export type TransactionStep = 
  | 'idle' 
  | 'begin' 
  | 'read' 
  | 'read2' 
  | 'modify' 
  | 'write' 
  | 'committed' 
  | 'rollback' 
  | 'waiting' 
  | 'error';

export interface TransactionState {
  step: TransactionStep;
  readValue: string | number | null;
  readValue2?: string | number | null;
  writeValue: string | number | null;
  committed: boolean;
  rolledBack?: boolean;
}

export interface LogEntry {
  timestamp: string;
  actor: 'T1' | 'T2' | 'system' | 'db';
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'sql';
}

export interface DemoScenario {
  id: string;
  name: string;
  errorType: 'lost-update' | 'dirty-read' | 'unrepeatable-read' | 'phantom';
  description: string;
  consequence: string;
  actors: {
    t1: { role: string; action: string };
    t2: { role: string; action: string };
  };
}

// Demo Scenarios translated to English
export const DEMO_SCENARIOS: DemoScenario[] = [
  // Lost Update Scenarios
  // {
  //   id: 'lost-update-seat',
  //   name: 'Same Seat Booking',
  //   errorType: 'lost-update',
  //   description: 'Two customers book the same ticket',
  //   consequence: 'Both customers successfully book the same seat → Overbooking/Double-sold seat',
  //   actors: {
  //     t1: { role: 'Customer A', action: 'Book seat' },
  //     t2: { role: 'Customer B', action: 'Book seat' },
  //   },
  // },
  {
    id: 'lost-update-tickets',
    name: 'Ticket Counter Update',
    errorType: 'lost-update',
    description: 'Two staff members update total_tickets after selling tickets',
    consequence: 'Incorrect total_tickets count, potentially selling more tickets than capacity',
    actors: {
      t1: { role: 'Staff A', action: 'Sell 2 tickets' },
      t2: { role: 'Staff B', action: 'Sell 3 tickets' },
    },
  },
  // Dirty Read Scenarios
  {
    id: 'dirty-read-trip-status',
    name: 'Trip Status View',
    errorType: 'dirty-read',
    description: 'Conductor marks trip as completed but rolls back; user reads uncommitted data',
    consequence: 'User sees trip as completed when it actually hasn\'t finished',
    actors: {
      t1: { role: 'Conductor', action: 'Mark trip as completed' },
      t2: { role: 'User', action: 'Check trip status' },
    },
  },
  {
    id: 'dirty-read-cancel-book',
    name: 'Cancellation - Re-booking',
    errorType: 'dirty-read',
    description: 'Customer A cancels but rolls back due to payment error; Customer B books that spot',
    consequence: 'Customer B books a "dirty" cancelled seat that actually remains taken by A',
    actors: {
      t1: { role: 'Customer A', action: 'Cancel ticket' },
      t2: { role: 'Customer B', action: 'Book recently cancelled seat' },
    },
  },
  // Unrepeatable Read Scenarios
  {
    id: 'unrepeatable-leave-request',
    name: 'Leave Request Approval',
    errorType: 'unrepeatable-read',
    description: 'Manager approves a request while the employee is simultaneously cancelling it',
    consequence: 'Manager approves a cancelled request, resulting in inconsistent state',
    actors: {
      t1: { role: 'Manager', action: 'Approve leave request' },
      t2: { role: 'Employee', action: 'Cancel leave request' },
    },
  },
  {
    id: 'unrepeatable-price-change',
    name: 'Booking during Price Change',
    errorType: 'unrepeatable-read',
    description: 'Customer books while management updates the pricing policy',
    consequence: 'Inconsistent pricing; customer pays old price while system enforces new price',
    actors: {
      t1: { role: 'Customer', action: 'Book train ticket' },
      t2: { role: 'Manager', action: 'Update pricing policy' },
    },
  },
  // Phantom Read Scenarios
  {
    id: 'phantom-revenue-report',
    name: 'Revenue Report',
    errorType: 'phantom',
    description: 'Manager exports revenue report while staff sells a new ticket',
    consequence: 'Report misses the newly sold ticket; total revenue is inaccurate',
    actors: {
      t1: { role: 'Manager', action: 'View revenue report' },
      t2: { role: 'Sales Staff', action: 'Sell new ticket' },
    },
  },
  {
    id: 'phantom-seat-display',
    name: 'Available Seat Display',
    errorType: 'phantom',
    description: 'System displays available seats while a booking is occurring',
    consequence: 'LED display shows inaccurate empty seat list',
    actors: {
      t1: { role: 'LED System', action: 'Read available seats list' },
      t2: { role: 'Sales Staff', action: 'Counter booking' },
    },
  },
];

export const ERROR_TYPE_INFO = {
  'lost-update': {
    name: 'Lost Update',
    description: 'Occurs when two transactions read the same data, and then both update it based on the original value. The first transaction\'s update is overwritten.',
    solution: [
      'Optimistic Locking: Use version numbers, check version before UPDATE',
      'Pessimistic Locking: SELECT ... FOR UPDATE to lock rows during reading',
      'Serializable Isolation: Set highest transaction isolation level',
      'Stored Procedures: Implement proper transaction logic in SQL Server',
    ],
    isolationLevel: 'READ COMMITTED or higher with proper locking',
  },
  'dirty-read': {
    name: 'Dirty Read',
    description: 'Occurs when a transaction reads uncommitted data from another transaction. If the other transaction rolls back, the read data is invalid.',
    solution: [
      'READ COMMITTED: Disallow reading uncommitted data',
      'Snapshot Isolation: Read the committed version of the data',
      'Transaction Boundaries: Ensure correct commit/rollback timing',
    ],
    isolationLevel: 'READ COMMITTED (Default in SQL Server)',
  },
  'unrepeatable-read': {
    name: 'Unrepeatable Read',
    description: 'Occurs when a transaction reads the same row twice and receives different values because another transaction updated that row.',
    solution: [
      'REPEATABLE READ: Hold shared locks on all read rows',
      'Snapshot Isolation: Read a consistent version of the data',
      'Optimistic Concurrency: Check version before committing',
    ],
    isolationLevel: 'REPEATABLE READ',
  },
  'phantom': {
    name: 'Phantom Read',
    description: 'Occurs when a transaction reads a set of rows matching a condition, and another transaction INSERTs/DELETEs rows matching that condition.',
    solution: [
      'SERIALIZABLE: Use key-range locks to prevent INSERT/DELETE',
      'Table Lock: Lock the entire table (reduces concurrency)',
      'Snapshot Isolation: Read a consistent data snapshot',
    ],
    isolationLevel: 'SERIALIZABLE',
  },
};