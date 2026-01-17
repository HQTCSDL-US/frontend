import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LogEntry, DemoScenario } from '@/types/concurrency';
import TransactionLog from './TransactionLog';
import SolutionHint from './SolutionHint';

interface LostUpdateDemoProps {
  scenario: DemoScenario;
}

interface TicketInfo {
  ticketId: number;
  customerId: number;
  customerName: string;
  ticketType: string;
}

interface BookingResponse {
  success: boolean;
  message: string;
  demoCase: 'ERROR' | 'SUCCESS';
  employeeId: number;
  tripId: number;
  ticketsBooked: number;
  totalTickets: number;
  tickets: TicketInfo[];
  timestamp: string;
}

interface DemoResult {
  employee1: BookingResponse | null;
  employee2: BookingResponse | null;
  initialTickets: number;
  expectedFinal: number;
  actualFinal: number;
  isCorrect: boolean;
}

const API_BASE = 'http://localhost:9000/api/employee/booking';

const EMPLOYEE_1_REQUEST = {
  tripId: 1,
  employeeId: 1,
  departureStationId: 1,
  arrivalStationId: 2,
  tickets: [
    {
      fullName: "Nguyen Van A",
      idCard: "123456789",
      customerTypeId: 1,
      phoneNumber: "0901234567",
      studentId: null,
      studentCardNumber: null,
      carriageId: 1,
      ticketType: "Seat",
      seatTicketId: 1,
      roomTicketId: null
    },
    {
      fullName: "Tran Thi B",
      idCard: "123456790",
      customerTypeId: 1,
      phoneNumber: "0901234568",
      studentId: null,
      studentCardNumber: null,
      carriageId: 1,
      ticketType: "Seat",
      seatTicketId: 2,
      roomTicketId: null
    }
  ]
};

const EMPLOYEE_2_REQUEST = {
  tripId: 1,
  employeeId: 2,
  departureStationId: 1,
  arrivalStationId: 2,
  tickets: [
    {
      fullName: "Le Van C",
      idCard: "987654321",
      customerTypeId: 1,
      phoneNumber: "0909876543",
      studentId: null,
      studentCardNumber: null,
      carriageId: 1,
      ticketType: "Seat",
      seatTicketId: 3,
      roomTicketId: null
    },
    {
      fullName: "Pham Thi D",
      idCard: "987654322",
      customerTypeId: 1,
      phoneNumber: "0909876544",
      studentId: null,
      studentCardNumber: null,
      carriageId: 1,
      ticketType: "Seat",
      seatTicketId: 4,
      roomTicketId: null
    },
    {
      fullName: "Hoang Van E",
      idCard: "987654323",
      customerTypeId: 1,
      phoneNumber: "0909876545",
      studentId: null,
      studentCardNumber: null,
      carriageId: 1,
      ticketType: "Seat",
      seatTicketId: 5,
      roomTicketId: null
    }
  ]
};

const LostUpdateDemo = ({ scenario }: LostUpdateDemoProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorResult, setErrorResult] = useState<DemoResult | null>(null);
  const [successResult, setSuccessResult] = useState<DemoResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((actor: LogEntry['actor'], message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, actor, message, type }]);
  }, []);

  const resetDemo = useCallback(() => {
    setErrorResult(null);
    setSuccessResult(null);
    setLogs([]);
  }, []);

  const runDemo = useCallback(async (caseType: 'error-case' | 'success-case') => {
    setIsLoading(true);
    setLogs([]);
    
    const endpoint = `${API_BASE}/${caseType}`;
    const isError = caseType === 'error-case';
    
    addLog('system', `Starting ${isError ? 'ERROR' : 'SUCCESS'} case demo...`, 'info');
    addLog('system', `Endpoint: ${endpoint}`, 'info');
    
    try {
      // Run both requests concurrently to simulate race condition
      addLog('T1', `POST - Employee 1 booking 2 tickets`, 'sql');
      addLog('T2', `POST - Employee 2 booking 3 tickets`, 'sql');
      
      const [response1, response2] = await Promise.all([
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(EMPLOYEE_1_REQUEST)
        }),
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(EMPLOYEE_2_REQUEST)
        })
      ]);

      const data1: BookingResponse = await response1.json();
      const data2: BookingResponse = await response2.json();

      addLog('T1', `Response: ${data1.message}`, data1.success ? 'success' : 'error');
      addLog('T2', `Response: ${data2.message}`, data2.success ? 'success' : 'error');

      // Calculate expected vs actual
      const totalSold = data1.ticketsBooked + data2.ticketsBooked;
      const initialTickets = 500; // Assumed initial value
      const expectedFinal = initialTickets - totalSold;
      const actualFinal = data2.totalTickets; // Last response has final value
      const isCorrect = expectedFinal === actualFinal;

      const result: DemoResult = {
        employee1: data1,
        employee2: data2,
        initialTickets,
        expectedFinal,
        actualFinal,
        isCorrect
      };

      if (isError) {
        setErrorResult(result);
        if (!isCorrect) {
          addLog('system', `LOST UPDATE DETECTED!`, 'error');
          addLog('system', `Expected: ${expectedFinal}, Actual: ${actualFinal}`, 'error');
          addLog('system', `Lost ${actualFinal - expectedFinal} tickets in the update!`, 'error');
          toast.error('Lost Update occurred! Ticket count is incorrect.');
        }
      } else {
        setSuccessResult(result);
        if (isCorrect) {
          addLog('system', `Transaction handled correctly!`, 'success');
          addLog('system', `Final total_tickets: ${actualFinal} (correct)`, 'success');
          toast.success('Success! No lost update occurred.');
        }
      }
    } catch (error) {
      addLog('system', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      toast.error('Failed to execute demo. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  const renderResultCard = (result: DemoResult, isError: boolean) => {
    const { employee1, employee2, expectedFinal, actualFinal, isCorrect } = result;
    
    return (
      <Card className={`border-2 ${isError ? 'border-destructive/50 bg-destructive/5' : 'border-green-500/50 bg-green-500/5'}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 text-lg ${isError ? 'text-destructive' : 'text-green-600'}`}>
            {isError ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
            {isError ? 'ERROR CASE Result' : 'SUCCESS CASE Result'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Initial Tickets</div>
              <div className="text-2xl font-bold">{result.initialTickets}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Expected Final</div>
              <div className="text-2xl font-bold text-blue-600">{expectedFinal}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Actual Final</div>
              <div className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                {actualFinal}
              </div>
            </div>
          </div>

          {/* Calculation */}
          <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <div className="font-mono text-sm">
              <div>Employee 1 sold: {employee1?.ticketsBooked || 0} tickets</div>
              <div>Employee 2 sold: {employee2?.ticketsBooked || 0} tickets</div>
              <div className="border-t border-current/20 mt-2 pt-2">
                Total sold: {(employee1?.ticketsBooked || 0) + (employee2?.ticketsBooked || 0)} tickets
              </div>
              <div className="font-bold mt-2">
                {isCorrect 
                  ? '✓ Calculation is CORRECT' 
                  : `✗ Lost ${actualFinal - expectedFinal} tickets (Lost Update!)`
                }
              </div>
            </div>
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-2 gap-4">
            {/* Employee 1 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Employee 1 (ID: {employee1?.employeeId})</h4>
              <div className="text-sm space-y-1">
                <div>Tickets booked: {employee1?.ticketsBooked}</div>
                <div>Final count seen: {employee1?.totalTickets}</div>
                <div className="text-xs text-muted-foreground">
                  {employee1?.timestamp ? new Date(employee1.timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
              <div className="space-y-1">
                {employee1?.tickets.map(t => (
                  <div key={t.ticketId} className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                    #{t.ticketId} - {t.customerName} ({t.ticketType})
                  </div>
                ))}
              </div>
            </div>

            {/* Employee 2 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Employee 2 (ID: {employee2?.employeeId})</h4>
              <div className="text-sm space-y-1">
                <div>Tickets booked: {employee2?.ticketsBooked}</div>
                <div>Final count seen: {employee2?.totalTickets}</div>
                <div className="text-xs text-muted-foreground">
                  {employee2?.timestamp ? new Date(employee2.timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
              <div className="space-y-1">
                {employee2?.tickets.map(t => (
                  <div key={t.ticketId} className="text-xs bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                    #{t.ticketId} - {t.customerName} ({t.ticketType})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Demo Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            {scenario.name}
          </CardTitle>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            <strong>Consequence:</strong> {scenario.consequence}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={() => runDemo('error-case')} 
              disabled={isLoading}
              variant="destructive"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Running...' : 'Run Error Case'}
            </Button>
            <Button 
              onClick={() => runDemo('success-case')} 
              disabled={isLoading}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {isLoading ? 'Running...' : 'Run Success Case'}
            </Button>
            <Button onClick={resetDemo} variant="outline" disabled={isLoading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {errorResult && renderResultCard(errorResult, true)}
        {successResult && renderResultCard(successResult, false)}
      </div>

      {/* Comparison Table */}
      {errorResult && successResult && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison: Error vs Success Case</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-center py-2 text-destructive">Error Case</th>
                  <th className="text-center py-2 text-green-600">Success Case</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Final total_tickets</td>
                  <td className="text-center font-mono">{errorResult.actualFinal}</td>
                  <td className="text-center font-mono">{successResult.actualFinal}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Expected</td>
                  <td className="text-center font-mono">{errorResult.expectedFinal}</td>
                  <td className="text-center font-mono">{successResult.expectedFinal}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Difference</td>
                  <td className="text-center font-mono text-destructive">
                    {errorResult.actualFinal - errorResult.expectedFinal !== 0 
                      ? `+${errorResult.actualFinal - errorResult.expectedFinal} (LOST!)` 
                      : '0'}
                  </td>
                  <td className="text-center font-mono text-green-600">
                    {successResult.actualFinal - successResult.expectedFinal !== 0 
                      ? successResult.actualFinal - successResult.expectedFinal 
                      : '0 ✓'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Status</td>
                  <td className="text-center">
                    <span className={`px-2 py-1 rounded text-xs ${errorResult.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {errorResult.isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`px-2 py-1 rounded text-xs ${successResult.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {successResult.isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Transaction Log */}
      {logs.length > 0 && <TransactionLog logs={logs} />}
      
      {/* <SolutionHint errorType="lost-update" /> */}
    </div>
  );
};

export default LostUpdateDemo;
