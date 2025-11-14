// src/components/PDV.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PDV = () => {
  // Estados para gerenciar a aplicação
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [pagamento, setPagamento] = useState('dinheiro');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const FUNCIONARIO_ID = 1; // ID fixo para simplificar o exemplo

  // --- Efeitos de Carregamento ---
  useEffect(() => {
    // Carrega produtos e clientes ao montar o componente
    const carregarDados = async () => {
      try {
        const [prodRes, cliRes] = await Promise.all([
          api.get('/produtos'), // Assumindo rota GET /api/produtos
          api.get('/clientes') // Assumindo rota GET /api/clientes
        ]);
        setProdutos(prodRes.data);
        setClientes(cliRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setMensagem('Erro ao carregar produtos ou clientes.');
      }
    };
    carregarDados();
  }, []);

  // --- Funções de Lógica ---
  
  // Adiciona um item (ex: Pão Francês) ao carrinho
  const adicionarAoCarrinho = (produtoId) => {
    const produto = produtos.find(p => p.codigo === produtoId);
    if (!produto) return;

    setCarrinho(prev => {
      const itemExistente = prev.find(item => item.codigo_produto === produtoId);
      if (itemExistente) {
        return prev.map(item =>
          item.codigo_produto === produtoId
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { codigo_produto: produtoId, nome: produto.nome, preco: parseFloat(produto.preco), quantidade: 1 }];
    });
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2);
  };

  // --- Função Crítica: Finalizar Venda ---
  const finalizarVenda = async (e) => {
    e.preventDefault();
    setMensagem('');

    if (carrinho.length === 0) {
      setMensagem('O carrinho está vazio.');
      return;
    }

    if (pagamento === 'fiado' && !clienteSelecionado) {
      setMensagem('Selecione um cliente para pagamento fiado.');
      return;
    }
    
    // Mapeia o carrinho para o formato que a API espera
    const itensAPI = carrinho.map(item => ({
      codigo_produto: item.codigo_produto,
      quantidade: item.quantidade
    }));

    const payload = {
      id_funcionario: FUNCIONARIO_ID,
      id_cliente: clienteSelecionado ? clienteSelecionado.codigo : null,
      tipo_pagamento: pagamento,
      itens: itensAPI,
    };

    try {
      await api.post('/vendas', payload);
      setMensagem('✅ Venda registrada com sucesso!');
      setCarrinho([]); // Limpa o carrinho
      setClienteSelecionado(null);
      setPagamento('dinheiro');
    } catch (error) {
      console.error("Erro ao registrar venda:", error.response ? error.response.data : error.message);
      
      const erroData = error.response ? error.response.data : {};
      
      if (erroData.error && erroData.error.includes("Limite de fiado excedido")) {
          const { detalhes } = erroData;
          setMensagem(`❌ LIMITE EXCEDIDO: O cliente deve R$ ${detalhes.saldoDevedorAtual} e seu limite é R$ ${detalhes.limiteFiado}. A venda de R$ ${detalhes.valorTotal} não pode ser concluída.`);
      } else {
          setMensagem(`❌ Erro: ${erroData.error || 'Falha na conexão com a API.'}`);
      }
    }
  };


  // --- Renderização ---
  return (
    <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', gap: '20px', padding: '20px' }}>
      
      {/* Coluna 1: Produtos */}
      <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px' }}>
        <h2>🥐 Produtos Disponíveis</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {produtos.map(p => (
            <button
              key={p.codigo}
              onClick={() => adicionarAoCarrinho(p.codigo)}
              style={{ padding: '10px', border: '1px solid #007bff', background: '#f8f9fa', cursor: 'pointer' }}
            >
              **{p.nome}** (R$ {parseFloat(p.preco).toFixed(2)})
            </button>
          ))}
        </div>
      </div>

      {/* Coluna 2: Carrinho e Checkout */}
      <div style={{ flex: 1, border: '1px solid #000', padding: '15px', background: '#e9ecef' }}>
        <h2>💰 Checkout</h2>
        
        {/* Carrinho */}
        <div style={{ marginBottom: '20px', minHeight: '150px' }}>
          {carrinho.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #666', padding: '5px 0' }}>
              <span>{item.nome} x {item.quantidade}</span>
              <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <h3 style={{ borderTop: '2px solid #000', paddingTop: '10px' }}>
          TOTAL: R$ {calcularTotal()}
        </h3>

        {/* Mensagens de Status */}
        {mensagem && <p style={{ color: mensagem.startsWith('❌') ? 'red' : 'green', fontWeight: 'bold' }}>{mensagem}</p>}
        
        {/* Formas de Pagamento e Cliente */}
        <form onSubmit={finalizarVenda}>
          
          <h4 style={{marginTop: '15px'}}>Tipo de Pagamento</h4>
          <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartão">Cartão</option>
            <option value="pix">PIX</option>
            <option value="fiado">Fiado</option>
          </select>

          {pagamento === 'fiado' && (
            <>
              <h4>Cliente (Obrigatório para Fiado)</h4>
              <select
                value={clienteSelecionado ? clienteSelecionado.codigo : ''}
                onChange={(e) => {
                  const selected = clientes.find(c => c.codigo === parseInt(e.target.value));
                  setClienteSelecionado(selected);
                }}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              >
                <option value="">Selecione um cliente...</option>
                {clientes.map(c => (
                  <option key={c.codigo} value={c.codigo}>
                    {c.nome} (Limite: R$ {parseFloat(c.limite_fiado).toFixed(2)})
                  </option>
                ))}
              </select>
              {clienteSelecionado && <p style={{fontSize: '0.9em'}}>Limite selecionado: R$ {parseFloat(clienteSelecionado.limite_fiado).toFixed(2)}</p>}
            </>
          )}

          <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', marginTop: '15px', cursor: 'pointer' }}>
            FINALIZAR VENDA
          </button>
        </form>
      </div>
    </div>
  );
};

export default PDV;