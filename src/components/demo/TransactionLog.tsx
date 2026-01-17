import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogEntry } from '@/types/concurrency';

interface TransactionLogProps {
  logs: LogEntry[];
  maxHeight?: string;
}

const TransactionLog = ({ logs, maxHeight = '320px' }: TransactionLogProps) => {
  const getLogColor = (entry: LogEntry) => {
    if (entry.type === 'error' || entry.message.includes('⚠️') || entry.message.includes('🚨')) {
      return 'text-red-400 font-bold';
    }
    if (entry.type === 'success' || entry.message.includes('✅')) {
      return 'text-green-400';
    }
    if (entry.type === 'warning') {
      return 'text-yellow-400';
    }
    if (entry.actor === 'T1') {
      return 'text-blue-400';
    }
    if (entry.actor === 'T2') {
      return 'text-purple-400';
    }
    if (entry.actor === 'db') {
      return 'text-orange-400';
    }
    return 'text-slate-300';
  };

  const getActorPrefix = (actor: LogEntry['actor']) => {
    switch (actor) {
      case 'T1':
        return '🔵 T1';
      case 'T2':
        return '🟣 T2';
      case 'db':
        return '🗃️ DB';
      case 'system':
        return '⚙️ SYS';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Transaction Log</CardTitle>
        <CardDescription>
          SQL statements and events in chronological order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-slate-500">Click "Run Demo" to start simulation...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`py-1 ${getLogColor(log)}`}>
                  <span className="text-slate-500 text-xs mr-2">[{log.timestamp}]</span>
                  <span className="mr-2">{getActorPrefix(log.actor)}:</span>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TransactionLog;