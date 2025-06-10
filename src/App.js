import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AIAssistant from './components/AIAssistant';
import Freeze from './components/Freeze';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/freeze" element={<Freeze />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
