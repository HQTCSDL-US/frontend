import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionState, LogEntry, DemoScenario } from '@/types/concurrency';
import TransactionPanel from './TransactionPanel';
import TransactionLog from './TransactionLog';
import DatabaseState from './DatabaseState';


interface PhantomReadDemoProps {
  scenario: DemoScenario;
}

interface TicketRecord {
  id: number;
  trip_id: number;
  ticket_price: number;
  status: string;
  isNew?: boolean;
}

interface SeatRecord {
  id: number;
  seat_number: string;
  status: string;
  isNew?: boolean;
}

const PhantomReadDemo = ({ scenario }: PhantomReadDemoProps) => {
  const isRevenueScenario = scenario.id === 'phantom-revenue-report';

  // Revenue scenario
  const [tickets, setTickets] = useState<TicketRecord[]>([
    { id: 1, trip_id: 1, ticket_price: 500000, status: 'paid' },
    { id: 2, trip_id: 1, ticket_price: 600000, status: 'paid' },
    { id: 3, trip_id: 1, ticket_price: 450000, status: 'paid' },
  ]);
  const [reportedRevenue, setReportedRevenue] = useState<number | null>(null);
  const [reportedCount, setReportedCount] = useState<number | null>(null);

  // Seat display scenario
  const [seats, setSeats] = useState<SeatRecord[]>([
    { id: 1, seat_number: 'A1', status: 'available' },
    { id: 2, seat_number: 'A2', status: 'available' },
    { id: 3, seat_number: 'A3', status: 'booked' },
    { id: 4, seat_number: 'A4', status: 'available' },
  ]);
  const [displayedSeats, setDisplayedSeats] = useState<string[]>([]);

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
    setTickets([
      { id: 1, trip_id: 1, ticket_price: 500000, status: 'paid' },
      { id: 2, trip_id: 1, ticket_price: 600000, status: 'paid' },
      { id: 3, trip_id: 1, ticket_price: 450000, status: 'paid' },
    ]);
    setSeats([
      { id: 1, seat_number: 'A1', status: 'available' },
      { id: 2, seat_number: 'A2', status: 'available' },
      { id: 3, seat_number: 'A3', status: 'booked' },
      { id: 4, seat_number: 'A4', status: 'available' },
    ]);
    setReportedRevenue(null);
    setReportedCount(null);
    setDisplayedSeats([]);
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

    if (isRevenueScenario) {
      // Revenue report scenario
      addLog('T1', 'BEGIN TRANSACTION (Export revenue report)', 'sql');
      addLog('T1', 'SET ISOLATION LEVEL READ COMMITTED', 'sql');
      setT1(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T1', "SELECT * FROM train_tickets WHERE trip_id = 1 AND status = 'paid'", 'sql');
      addLog('T1', 'Read 3 tickets, total: 1,550,000 VND', 'info');
      setReportedCount(3);
      setReportedRevenue(1550000);
      setT1(p => ({ ...p, step: 'read', readValue: '3 tickets - 1,550,000' }));
      await delay(800);

      addLog('T1', 'Processing report... (iterating via cursor)', 'info');
      await delay(600);

      addLog('T2', 'BEGIN TRANSACTION (Sell new ticket)', 'sql');
      setT2(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T2', 'INSERT INTO train_tickets (trip_id, ticket_price, status)', 'sql');
      addLog('T2', "VALUES (1, 700000, 'paid')", 'sql');
      const newTicket: TicketRecord = { id: 4, trip_id: 1, ticket_price: 700000, status: 'paid', isNew: true };
      setTickets(prev => [...prev, newTicket]);
      setT2(p => ({ ...p, step: 'write' }));
      await delay(600);

      addLog('T2', 'COMMIT', 'sql');
      addLog('T2', '✅ Ticket sold successfully!', 'success');
      setT2(p => ({ ...p, step: 'committed', committed: true }));
      await delay(800);

      addLog('T1', '⚠️ PHANTOM: New ticket added during report generation!', 'warning');
      addLog('T1', 'Continuing process with stale data...', 'info');
      setT1(p => ({ ...p, step: 'read2' }));
      await delay(600);

      addLog('T1', 'COMMIT - Export report: 3 tickets, 1,550,000 VND', 'sql');
      setT1(p => ({ ...p, step: 'committed', committed: true }));
      await delay(500);

      addLog('system', '🚨 RESULT: Report missing 1 ticket and 700,000 VND!', 'error');
      addLog('system', '💔 Reality: 4 tickets, 2,250,000 VND. Report: 3 tickets, 1,550,000 VND', 'error');
      toast.error('Phantom Read! Revenue report is inaccurate.');
    } else {
      // Seat display scenario
      addLog('T1', 'BEGIN TRANSACTION (Update LED display)', 'sql');
      addLog('T1', 'SET ISOLATION LEVEL READ COMMITTED', 'sql');
      setT1(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T1', "SELECT seat_number FROM seats WHERE status = 'available'", 'sql');
      addLog('T1', 'Read: A1, A2, A4 (3 available seats)', 'info');
      setDisplayedSeats(['A1', 'A2', 'A4']);
      setT1(p => ({ ...p, step: 'read', readValue: 'A1, A2, A4' }));
      await delay(800);

      addLog('T1', 'Formatting data for display...', 'info');
      await delay(600);

      addLog('T2', 'BEGIN TRANSACTION (Counter booking)', 'sql');
      setT2(p => ({ ...p, step: 'begin' }));
      await delay(600);

      addLog('T2', "UPDATE seats SET status = 'booked' WHERE seat_number = 'A2'", 'sql');
      setSeats(prev => prev.map(s => s.seat_number === 'A2' ? { ...s, status: 'booked' } : s));
      setT2(p => ({ ...p, step: 'write' }));
      await delay(600);

      addLog('T2', 'COMMIT', 'sql');
      addLog('T2', '✅ Seat A2 booked successfully!', 'success');
      setT2(p => ({ ...p, step: 'committed', committed: true }));
      await delay(800);

      addLog('T1', '⚠️ PHANTOM: Seat A2 was booked during processing!', 'warning');
      addLog('T1', 'Displaying: A1, A2, A4 (includes sold-out A2)', 'info');
      setT1(p => ({ ...p, step: 'read2' }));
      await delay(600);

      addLog('T1', 'COMMIT - Update LED display', 'sql');
      setT1(p => ({ ...p, step: 'committed', committed: true }));
      await delay(500);

      addLog('system', '🚨 RESULT: Screen shows Seat A2 as available!', 'error');
      addLog('system', '💔 Customer selects A2 from screen but it is already booked!', 'error');
      toast.error('Phantom Read! Incorrect seat status displayed.');
    }

    setIsAutoRunning(false);
  }, [isRevenueScenario, resetDemo, addLog]);

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/50 bg-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <AlertTriangle className="w-5 h-5" />
            {scenario.name}
          </CardTitle>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            {scenario.name}
          </CardTitle>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-purple-500/10 rounded-lg text-sm">
            <span className="font-medium text-purple-600">Consequence:</span> {scenario.consequence}
          </div>
          <div className="flex gap-3">
            <Button onClick={runAutoDemo} disabled={isAutoRunning} className="bg-purple-600 hover:bg-purple-700">
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
            { label: 'SELECT (Read list)', enabledWhen: 'begin', onClick: () => {} },
            { label: 'Process data...', enabledWhen: 'read', onClick: () => {} },
            { label: 'COMMIT', enabledWhen: 'read2', onClick: () => {} },
          ]}
          isAutoRunning={isAutoRunning}
          colorScheme="blue"
        />

        <DatabaseState
          tableName={isRevenueScenario ? 'train_tickets' : 'seats'}
          description={isRevenueScenario ? 'Paid Tickets - Trip SE1' : 'Coach 1 Seats'}
          data={{
            columns: isRevenueScenario 
              ? ['id', 'trip_id', 'ticket_price', 'phantom']
              : ['id', 'seat_number', 'status', 'phantom'],
            rows: isRevenueScenario 
              ? tickets.map(t => ({ 
                  id: t.id, 
                  trip_id: t.trip_id, 
                  ticket_price: t.ticket_price.toLocaleString(),
                  phantom: t.isNew ? '👻 NEW!' : '-'
                }))
              : seats.map(s => ({ 
                  id: s.id, 
                  seat_number: s.seat_number, 
                  status: s.status,
                  phantom: s.status === 'booked' && displayedSeats.includes(s.seat_number) ? '👻 JUST CHANGED!' : '-'
                })),
            highlightedColumn: 'phantom',
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
            { label: isRevenueScenario ? 'INSERT (Add new ticket)' : 'UPDATE (Book seat)', enabledWhen: 'begin', onClick: () => {} },
            { label: 'COMMIT', enabledWhen: 'write', onClick: () => {} },
          ]}
          isAutoRunning={isAutoRunning}
          colorScheme="purple"
        />
      </div>

      {/* Report comparison */}
      {isRevenueScenario && reportedRevenue && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-blue-500/50">
            <CardHeader className="py-3">
              <CardTitle className="text-base">📊 T1 Report (Inaccurate)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{reportedCount} tickets</p>
              <p className="text-lg">{reportedRevenue?.toLocaleString()} VND</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/50">
            <CardHeader className="py-3">
              <CardTitle className="text-base">✅ Reality (Correct)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{tickets.length} tickets</p>
              <p className="text-lg">{tickets.reduce((sum, t) => sum + t.ticket_price, 0).toLocaleString()} VND</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isRevenueScenario && displayedSeats.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-blue-500/50">
            <CardHeader className="py-3">
              <CardTitle className="text-base">📺 LED Display (Wrong)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">Empty seats: <span className="font-bold text-blue-600">{displayedSeats.join(', ')}</span></p>
              <p className="text-sm text-muted-foreground">Includes A2 which has been booked!</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/50">
            <CardHeader className="py-3">
              <CardTitle className="text-base">✅ Reality (Correct)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">Empty seats: <span className="font-bold text-green-600">
                {seats.filter(s => s.status === 'available').map(s => s.seat_number).join(', ')}
              </span></p>
            </CardContent>
          </Card>
        </div>
      )}

      <TransactionLog logs={logs} />
      
    </div>
  );
};

export default PhantomReadDemo;