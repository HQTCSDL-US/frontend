import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionState, LogEntry, DemoScenario } from '@/types/concurrency';
import TransactionPanel from './TransactionPanel';
import TransactionLog from './TransactionLog';
import DatabaseState from './DatabaseState';

interface UnrepeatableReadDemoProps {
  scenario: DemoScenario;
}

const UnrepeatableReadDemo = ({ scenario }: UnrepeatableReadDemoProps) => {
  const isLeaveRequestScenario = scenario.id === 'unrepeatable-leave-request';

  // Leave request scenario
  const [leaveStatus, setLeaveStatus] = useState<'pending' | 'approved' | 'cancelled'>('pending');
  
  // Price change scenario
  const [pricePerKm, setPricePerKm] = useState<number>(1500);
  const [ticketPrice, setTicketPrice] = useState<number | null>(null);

  const [t1, setT1] = useState<TransactionState>({
    step: 'idle', readValue: null, readValue2: null, writeValue: null, committed: false,
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
    setLeaveStatus('pending');
    setPricePerKm(1500);
    setTicketPrice(null);
    setT1({ step: 'idle', readValue: null, readValue2: null, writeValue: null, committed: false });
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

    if (isLeaveRequestScenario) {
      // Leave request scenario
      addLog('T1', 'BEGIN TRANSACTION (Manager Review)', 'sql');
      setT1(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T1', 'SELECT status FROM leave_requests WHERE id = 1', 'sql');
      addLog('T1', "First Read: status = 'pending' ✓", 'info');
      setT1(p => ({ ...p, step: 'read', readValue: 'pending' }));
      await delay(800);

      addLog('T1', 'Searching for a replacement employee... (taking time)', 'info');
      await delay(600);

      addLog('T2', 'BEGIN TRANSACTION (Employee Cancels Request)', 'sql');
      setT2(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T2', "UPDATE leave_requests SET status = 'cancelled' WHERE id = 1", 'sql');
      setDbLock({ by: 'T2', type: 'X' });
      setLeaveStatus('cancelled');
      setT2(p => ({ ...p, step: 'write' }));
      await delay(600);

      addLog('T2', 'COMMIT', 'sql');
      addLog('T2', '✅ Request cancelled successfully!', 'success');
      setT2(p => ({ ...p, step: 'committed', committed: true }));
      setDbLock({ by: null, type: null });
      await delay(800);

      addLog('T1', 'Found replacement, proceeding to approve...', 'info');
      addLog('T1', "⚠️ Using stale status ('pending') from first read!", 'warning');
      await delay(600);

      addLog('T1', "UPDATE leave_requests SET status = 'approved' WHERE id = 1", 'sql');
      setDbLock({ by: 'T1', type: 'X' });
      setLeaveStatus('approved');
      setT1(p => ({ ...p, step: 'write' }));
      await delay(600);

      addLog('T1', 'COMMIT', 'sql');
      setT1(p => ({ ...p, step: 'committed', committed: true }));
      setDbLock({ by: null, type: null });
      await delay(500);

      addLog('system', '🚨 RESULT: Leave request approved AFTER it was cancelled!', 'error');
      addLog('system', '💔 Employee thinks it is cancelled, but system shows approved!', 'error');
      toast.error('Unrepeatable Read! Inconsistent request status.');
    } else {
      // Price change scenario
      const distance = 500; // km
      addLog('T1', 'BEGIN TRANSACTION (Customer Booking)', 'sql');
      addLog('T1', 'SET ISOLATION LEVEL READ COMMITTED', 'sql');
      setT1(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T1', 'SELECT price_per_kilometer FROM pricing_rules', 'sql');
      addLog('T1', 'First Read: price = 1,500 VND/km', 'info');
      setT1(p => ({ ...p, step: 'read', readValue: 1500 }));
      await delay(800);

      addLog('T1', `Calculating price: ${distance} km × 1,500 = 750,000 VND`, 'info');
      setTicketPrice(750000);
      await delay(600);

      addLog('T2', 'BEGIN TRANSACTION (Admin Price Change)', 'sql');
      setT2(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T2', 'UPDATE pricing_rules SET price_per_kilometer = 2000', 'sql');
      addLog('T2', 'Price increased to 2,000 VND/km', 'info');
      setDbLock({ by: 'T2', type: 'X' });
      setPricePerKm(2000);
      setT2(p => ({ ...p, step: 'write', writeValue: 2000 }));
      await delay(600);

      addLog('T2', 'COMMIT', 'sql');
      addLog('T2', '✅ Price updated successfully!', 'success');
      setT2(p => ({ ...p, step: 'committed', committed: true }));
      setDbLock({ by: null, type: null });
      await delay(800);

      addLog('T1', 'INSERT INTO train_tickets (..., ticket_price = 750,000)', 'sql');
      addLog('T1', "⚠️ Saving ticket with OLD price (1,500 VND/km)!", 'warning');
      setT1(p => ({ ...p, step: 'write' }));
      await delay(600);

      addLog('T1', 'COMMIT', 'sql');
      setT1(p => ({ ...p, step: 'committed', committed: true }));
      await delay(500);

      addLog('system', '🚨 RESULT: Ticket sold for 750,000 instead of 1,000,000!', 'error');
      addLog('system', '💔 Lost 250,000 VND due to inconsistent pricing read!', 'error');
      toast.error('Unrepeatable Read! Inconsistent ticket price.');
    }

    setIsAutoRunning(false);
  }, [isLeaveRequestScenario, resetDemo, addLog]);

  return (
    <div className="space-y-6">
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-5 h-5" />
            {scenario.name}
          </CardTitle>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg text-sm">
            <span className="font-medium text-yellow-600">Consequence:</span> {scenario.consequence}
          </div>
          <div className="flex gap-3">
            <Button onClick={runAutoDemo} disabled={isAutoRunning} className="bg-yellow-600 hover:bg-yellow-700">
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
            { label: 'SELECT (Read Data)', enabledWhen: 'begin', onClick: () => {} },
            { label: isLeaveRequestScenario ? 'UPDATE (Approve)' : 'INSERT (Create Ticket)', enabledWhen: 'read', onClick: () => {} },
            { label: 'COMMIT', enabledWhen: 'write', onClick: () => {} },
          ]}
          isAutoRunning={isAutoRunning}
          colorScheme="blue"
        />

        <DatabaseState
          tableName={isLeaveRequestScenario ? 'leave_requests' : 'pricing_rules'}
          description={isLeaveRequestScenario ? 'Leave Request Records' : 'Current Pricing Table'}
          data={{
            columns: isLeaveRequestScenario 
              ? ['id', 'employee', 'status']
              : ['id', 'price_per_km', 'effective_date'],
            rows: isLeaveRequestScenario 
              ? [{ id: 1, employee: 'John Doe', status: leaveStatus }]
              : [{ id: 1, price_per_km: `${pricePerKm.toLocaleString()} VND`, effective_date: '2024-01-01' }],
            highlightedColumn: isLeaveRequestScenario ? 'status' : 'price_per_km',
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
            { label: isLeaveRequestScenario ? 'UPDATE (Cancel)' : 'UPDATE (Change Price)', enabledWhen: 'begin', onClick: () => {} },
            { label: 'COMMIT', enabledWhen: 'write', onClick: () => {} },
          ]}
          isAutoRunning={isAutoRunning}
          colorScheme="purple"
        />
      </div>

      {!isLeaveRequestScenario && ticketPrice && (
        <Card className="border-amber-500/50">
          <CardHeader className="py-3">
            <CardTitle className="text-base">💰 Price Calculation (500 km)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>Read Price: <strong>1,500 VND/km</strong></p>
            <p>Calculated Total: <strong>{ticketPrice.toLocaleString()} VND</strong></p>
            <p className="text-destructive">Correct Total should be: <strong>1,000,000 VND</strong> (2,000 × 500)</p>
          </CardContent>
        </Card>
      )}

      <TransactionLog logs={logs} />
      
    </div>
  );
};

export default UnrepeatableReadDemo;