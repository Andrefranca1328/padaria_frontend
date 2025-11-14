⚛️ 2. Frontend: padaria-frontend (React/Vite)
Configuração e Execução
O frontend consome a API REST rodando na porta 3000.

Instalar Dependências:

Bash

npm install
npm install axios # Necessário para requisições HTTP
Iniciar o Servidor de Desenvolvimento:

Bash

npm run dev
O frontend estará disponível em http://localhost:5173/.

Componentes Chave
src/components/PDV.jsx: Principal interface de vendas, onde ocorre a seleção de itens, tipo de pagamento e a verificação de limite de fiado ao enviar a requisição.

src/services/api.js: Configuração do cliente Axios, apontando para a base URL da API (http://localhost:3000/api).
