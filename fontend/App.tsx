import React from 'react';
import { Sidebar } from './components/Sidebar';
import { GraphCanvas } from './components/GraphCanvas';
import { PlayerControls } from './components/PlayerControls';
import { LogPanel } from './components/LogPanel';

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 relative flex flex-col">
        <GraphCanvas />
        <PlayerControls />
        <LogPanel />
      </div>
    </div>
  );
};

export default App;