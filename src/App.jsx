import './App.css';
import PDV from './components/PDV'; // Importando o novo componente PDV

function App() {
  return (
    <div className="App">
      <header>
        <h1>🥖 Sistema de Padaria - Ponto de Venda</h1>
      </header>
      <main>
        <PDV />
      </main>
    </div>
  );
}

export default App;