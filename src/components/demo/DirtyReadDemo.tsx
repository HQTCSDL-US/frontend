import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionState, LogEntry, DemoScenario } from '@/types/concurrency';
import TransactionPanel from './TransactionPanel';
import TransactionLog from './TransactionLog';
import DatabaseState from './DatabaseState';
//import SolutionHint from './SolutionHint';

interface DirtyReadDemoProps {
  scenario: DemoScenario;
}

const DirtyReadDemo = ({ scenario }: DirtyReadDemoProps) => {
  const isTripStatusScenario = scenario.id === 'dirty-read-trip-status';

  // Trip status scenario
  const [tripStatus, setTripStatus] = useState<'scheduled' | 'completed'>('scheduled');
  const [tripStatusTemp, setTripStatusTemp] = useState<'scheduled' | 'completed'>('scheduled');
  
  // Cancel-book scenario  
  const [ticketStatus, setTicketStatus] = useState<'paid' | 'cancelled'>('paid');
  const [ticketStatusTemp, setTicketStatusTemp] = useState<'paid' | 'cancelled'>('paid');
  const [newTicketCreated, setNewTicketCreated] = useState(false);

  const [t1, setT1] = useState<TransactionState>({
    step: 'idle', readValue: null, writeValue: null, committed: false, rolledBack: false,
  });
  const [t2, setT2] = useState<TransactionState>({
    step: 'idle', readValue: null, writeValue: null, committed: false,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [dbLock, setDbLock] = useState<{ by: 'T1' | 'T2' | null; type: 'S' | 'X' | null }>({ by: null, type: null });

  const addLog = useCallback((actor: LogEntry['actor'], message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, actor, message, type }]);
  }, []);

  const resetDemo = useCallback(() => {
    setTripStatus('scheduled');
    setTripStatusTemp('scheduled');
    setTicketStatus('paid');
    setTicketStatusTemp('paid');
    setNewTicketCreated(false);
    setT1({ step: 'idle', readValue: null, writeValue: null, committed: false, rolledBack: false });
    setT2({ step: 'idle', readValue: null, writeValue: null, committed: false });
    setLogs([]);
    setIsAutoRunning(false);
    setDbLock({ by: null, type: null });
  }, []);

  const runAutoDemo = useCallback(async () => {
    resetDemo();
    setIsAutoRunning(true);
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(300);

    if (isTripStatusScenario) {
      // Trip status scenario – conductor marks trip completed but later rolls back
      addLog('T1', 'BEGIN TRANSACTION', 'sql');
      addLog('T1', 'SET ISOLATION LEVEL READ UNCOMMITTED (T2)', 'sql');
      setT1(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T1', "UPDATE trips SET status = 'completed' WHERE id = 1", 'sql');
      addLog('T1', 'Marked trip as completed (uncommitted)', 'info');
      setDbLock({ by: 'T1', type: 'X' });
      setTripStatusTemp('completed');
      setT1(p => ({ ...p, step: 'write' }));
      await delay(800);

      addLog('T2', 'BEGIN TRANSACTION', 'sql');
      setT2(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T2', 'SELECT status FROM trips WHERE id = 1', 'sql');
      addLog('T2', "⚠️ DIRTY READ: Read status = 'completed' (uncommitted!)", 'warning');
      setT2(p => ({ ...p, step: 'read', readValue: 'completed' }));
      await delay(1000);

      addLog('T1', 'Validation: arrival station not updated yet...', 'info');
      addLog('T1', 'ROLLBACK – cannot mark as completed!', 'error');
      setTripStatusTemp('scheduled');
      setDbLock({ by: null, type: null });
      setT1(p => ({ ...p, step: 'rollback', rolledBack: true }));
      await delay(800);

      addLog('T2', 'UI shows: "Trip completed"', 'info');
      addLog('T2', 'COMMIT', 'sql');
      setT2(p => ({ ...p, step: 'committed', committed: true }));
      await delay(500);

      addLog('system', '🚨 RESULT: User sees trip as "completed"', 'error');
      addLog('system', '💔 Real state: trip is still running (scheduled)!', 'error');
      toast.error('Dirty Read occurred! User read invalid state.');
    } else {
      // Cancel-book scenario
      addLog('T1', 'BEGIN TRANSACTION', 'sql');
      setT1(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T1', 'SELECT ticket_price FROM train_tickets WHERE id = 1', 'sql');
      addLog('T1', 'Ticket price: 500,000 VND', 'info');
      setT1(p => ({ ...p, step: 'read', readValue: '500,000' }));
      await delay(600);

      addLog('T1', "DELETE FROM seat_tickets WHERE id = 1", 'sql');
      addLog('T1', "UPDATE train_tickets SET status = 'cancelled'", 'sql');
      addLog('T1', 'Delete seat ticket & update status (uncommitted)', 'info');
      setDbLock({ by: 'T1', type: 'X' });
      setTicketStatusTemp('cancelled');
      setT1(p => ({ ...p, step: 'write' }));
      await delay(800);

      addLog('T2', 'BEGIN TRANSACTION', 'sql');
      setT2(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T2', 'SELECT * FROM seat_tickets WHERE seat_id = 5 AND trip_id = 1', 'sql');
      addLog('T2', "⚠️ DIRTY READ: Seat appears free (uncommitted delete!)", 'warning');
      setT2(p => ({ ...p, step: 'read', readValue: 'Seat available' }));
      await delay(800);

      addLog('T1', 'Customer balance check: INSUFFICIENT!', 'info');
      addLog('T1', 'ROLLBACK – cancellation failed due to lack of funds!', 'error');
      setTicketStatusTemp('paid');
      setDbLock({ by: null, type: null });
      setT1(p => ({ ...p, step: 'rollback', rolledBack: true }));
      await delay(800);

      addLog('T2', 'INSERT INTO train_tickets (...) – create new ticket', 'sql');
      addLog('T2', 'INSERT INTO seat_tickets (...) – assign seat 5', 'sql');
      setNewTicketCreated(true);
      setT2(p => ({ ...p, step: 'write' }));
      await delay(600);

      addLog('T2', 'COMMIT', 'sql');
      setT2(p => ({ ...p, step: 'committed', committed: true }));
      await delay(500);

      addLog('system', '🚨 RESULT: Seat 5 sold to TWO customers!', 'error');
      addLog('system', '💔 Customer A keeps ticket (rollback), Customer B gets a new one!', 'error');
      toast.error('Dirty Read occurred! Seat conflict.');
    }

    setIsAutoRunning(false);
  }, [isTripStatusScenario, resetDemo, addLog]);

  const getCurrentStatus = () => {
    if (isTripStatusScenario) {
      return t1.rolledBack ? tripStatus : tripStatusTemp;
    }
    return t1.rolledBack ? ticketStatus : ticketStatusTemp;
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-500/50 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            {scenario.name}
          </CardTitle>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-orange-500/10 rounded-lg text-sm">
            <span className="font-medium text-orange-600">Consequence:</span> {scenario.consequence}
          </div>
          <div className="flex gap-3">
            <Button onClick={runAutoDemo} disabled={isAutoRunning} className="bg-orange-600 hover:bg-orange-700">
              <Play className="w-4 h-4 mr-2" />
              {isAutoRunning ? 'Running...' : 'Run Demo'}
            </Button>
            <Button variant="outline" onClick={resetDemo}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TransactionPanel
          title="🔵 Transaction T1"
          role={scenario.actors.t1.role}
          action={scenario.actors.t1.action}
          state={t1}
          steps={[
            { label: 'BEGIN TRANSACTION', enabledWhen: 'idle', onClick: () => {} },
            { label: isTripStatusScenario ? 'UPDATE status' : 'DELETE/UPDATE ticket', enabledWhen: 'begin', onClick: () => {} },
            { label: 'ROLLBACK (failure)', enabledWhen: 'write', onClick: () => {} },
          ]}
          isAutoRunning={isAutoRunning}
          colorScheme="blue"
        />

        <DatabaseState
          tableName={isTripStatusScenario ? 'trips' : 'train_tickets'}
          description={isTripStatusScenario ? 'Train SE1' : 'Seat #5 ticket'}
          data={{
            columns: isTripStatusScenario 
              ? ['id', 'name', 'status', '(uncommitted)']
              : ['id', 'seat_id', 'status', 'conflict'],
            rows: isTripStatusScenario 
              ? [{ id: 1, name: 'SE1', status: getCurrentStatus(), '(uncommitted)': t1.step === 'write' ? '⚠️' : '-' }]
              : [
                  { id: 1, seat_id: 5, status: getCurrentStatus(), conflict: newTicketCreated && !t1.rolledBack ? '⚠️' : '-' },
                  ...(newTicketCreated ? [{ id: 2, seat_id: 5, status: 'paid', conflict: '⚠️ DUPLICATE!' }] : []),
                ],
            highlightedColumn: 'status',
            lockedBy: dbLock.by,
            lockType: dbLock.type || undefined,
          }}
        />

        <TransactionPanel
          title="🟣 Transaction T2"
          role={scenario.actors.t2.role}
          action={scenario.actors.t2.action}
          state={t2}
          steps={[
            { label: 'BEGIN TRANSACTION', enabledWhen: 'idle', onClick: () => {} },
            { label: 'SELECT (Dirty Read)', enabledWhen: 'begin', onClick: () => {} },
            { label: 'COMMIT', enabledWhen: 'read', onClick: () => {} },
          ]}
          isAutoRunning={isAutoRunning}
          colorScheme="purple"
        />
      </div>

      <TransactionLog logs={logs} />
      
    </div>
  );
};

export default DirtyReadDemo;
