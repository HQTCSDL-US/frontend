import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertTriangle, Database, FileWarning, RefreshCw, Ghost } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '@/types/concurrency';
import ScenarioSelector from '@/components/demo/ScenarioSelector';
import LostUpdateDemo from '@/components/demo/LostUpdateDemo';
import DirtyReadDemo from '@/components/demo/DirtyReadDemo';
import UnrepeatableReadDemo from '@/components/demo/UnrepeatableReadDemo';
import PhantomReadDemo from '@/components/demo/PhantomReadDemo';

const ConcurrencyDemoPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('lost-update');
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(
    DEMO_SCENARIOS.find(s => s.errorType === 'lost-update') || null
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const firstScenario = DEMO_SCENARIOS.find(s => s.errorType === tab);
    setSelectedScenario(firstScenario || null);
  };

  const renderDemo = () => {
    if (!selectedScenario) return null;

    switch (selectedScenario.errorType) {
      case 'lost-update':
        return <LostUpdateDemo scenario={selectedScenario} />;
      case 'dirty-read':
        return <DirtyReadDemo scenario={selectedScenario} />;
      case 'unrepeatable-read':
        return <UnrepeatableReadDemo scenario={selectedScenario} />;
      case 'phantom':
        return <PhantomReadDemo scenario={selectedScenario} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Demo Concurrency Control Database</h1>
              <p className="text-primary-foreground/80">
                Railway Concurrency Control
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="space-y-4">
              <TabsList className="flex flex-col h-auto w-full bg-muted p-1">
                <TabsTrigger value="lost-update" className="w-full justify-start gap-2">
                  <Database className="w-4 h-4" />
                  Lost Update
                </TabsTrigger>
                <TabsTrigger value="dirty-read" className="w-full justify-start gap-2">
                  <FileWarning className="w-4 h-4" />
                  Dirty Read
                </TabsTrigger>
                <TabsTrigger value="unrepeatable-read" className="w-full justify-start gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Unrepeatable Read
                </TabsTrigger>
                <TabsTrigger value="phantom" className="w-full justify-start gap-2">
                  <Ghost className="w-4 h-4" />
                  Phantom Read
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-4">
              <ScenarioSelector
                scenarios={DEMO_SCENARIOS}
                selectedScenario={selectedScenario}
                onSelect={setSelectedScenario}
                filterType={activeTab}
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            {renderDemo()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcurrencyDemoPage;
