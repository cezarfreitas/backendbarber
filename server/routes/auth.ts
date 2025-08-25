import { RequestHandler } from "express";
import {
  LoginCelularRequest,
  LoginGoogleRequest,
  LoginBarbeariaRequest,
  LoginBarbeiroRequest,
  AlterarSenhaRequest,
  AlterarSenhaBarbeariaRequest,
  AlterarSenhaBarbeiroRequest,
  ResetSenhaRequest,
  LoginResponse,
  LoginBarbeariaResponse,
  LoginBarbeiroResponse,
  VerificarTokenResponse,
  ApiResponse,
  Cliente,
  Barbearia,
  Barbeiro
} from "@shared/api";
import { executeQuery, executeQuerySingle } from "../config/database";
import { 
  hashSenha, 
  verificarSenha,
  gerarToken,
  gerarRefreshToken,
  verificarToken,
  validarCelular,
  formatarCelular,
  validarEmail,
  gerarCodigoVerificacao
} from "../utils/auth";

/**
 * POST /api/auth/login/celular
 * Login com celular + senha
 */
export const loginCelular: RequestHandler = async (req, res) => {
  try {
    const { celular, senha }: LoginCelularRequest = req.body;

    // Validações básicas
    if (!celular || !senha) {
      return res.status(400).json({
        sucesso: false,
        erro: "Celular e senha são obrigatórios"
      } as LoginResponse);
    }

    if (!validarCelular(celular)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de celular inválido"
      } as LoginResponse);
    }

    // Buscar cliente no banco
    const cliente = await executeQuerySingle(`
      SELECT id, nome, email, celular, senha_hash, tipo_login, status,
             email_verificado, celular_verificado
      FROM clientes 
      WHERE celular = ? AND (tipo_login = 'celular' OR tipo_login = 'ambos')
    `, [formatarCelular(celular)]);

    if (!cliente) {
      return res.status(401).json({
        sucesso: false,
        erro: "Celular não encontrado ou tipo de login incorreto"
      } as LoginResponse);
    }

    // Verificar status do cliente
    if (cliente.status !== 'ativo') {
      return res.status(401).json({
        sucesso: false,
        erro: "Conta inativa ou suspensa"
      } as LoginResponse);
    }

    // Verificar senha
    if (!cliente.senha_hash || !await verificarSenha(senha, cliente.senha_hash)) {
      return res.status(401).json({
        sucesso: false,
        erro: "Senha incorreta"
      } as LoginResponse);
    }

    // Gerar tokens
    const token = gerarToken({
      clienteId: cliente.id,
      celular: cliente.celular,
      email: cliente.email,
      nome: cliente.nome,
      tipoLogin: cliente.tipo_login
    });

    const refreshToken = gerarRefreshToken(cliente.id);

    // Atualizar último login
    await executeQuery(`
      UPDATE clientes SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?
    `, [cliente.id]);

    // Buscar dados completos do cliente (sem senha)
    const clienteCompleto = await executeQuerySingle(`
      SELECT id, nome, email, celular, data_nascimento, foto,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, 
             endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
             servicos_preferidos, tipo_login, google_id, email_verificado, 
             celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
      FROM clientes 
      WHERE id = ?
    `, [cliente.id]);

    const response: LoginResponse = {
      sucesso: true,
      token,
      refreshToken,
      cliente: clienteCompleto ? {
        id: clienteCompleto.id,
        nome: clienteCompleto.nome,
        email: clienteCompleto.email,
        celular: clienteCompleto.celular,
        dataNascimento: clienteCompleto.data_nascimento,
        foto: clienteCompleto.foto,
        endereco: {
          rua: clienteCompleto.endereco_rua,
          numero: clienteCompleto.endereco_numero,
          bairro: clienteCompleto.endereco_bairro,
          cidade: clienteCompleto.endereco_cidade,
          estado: clienteCompleto.endereco_estado,
          cep: clienteCompleto.endereco_cep
        },
        preferencias: {
          barbeariaId: clienteCompleto.barbearia_preferida,
          barbeiroId: clienteCompleto.barbeiro_preferido,
          servicosPreferidos: clienteCompleto.servicos_preferidos ? JSON.parse(clienteCompleto.servicos_preferidos) : []
        },
        tipoLogin: clienteCompleto.tipo_login,
        googleId: clienteCompleto.google_id,
        emailVerificado: clienteCompleto.email_verificado,
        celularVerificado: clienteCompleto.celular_verificado,
        status: clienteCompleto.status,
        dataCadastro: clienteCompleto.data_cadastro,
        dataAtualizacao: clienteCompleto.data_atualizacao,
        ultimoLogin: clienteCompleto.ultimo_login
      } : undefined,
      expiresIn: 7 * 24 * 60 * 60, // 7 dias em segundos
      mensagem: "Login realizado com sucesso"
    };

    res.json(response);

  } catch (error) {
    console.error("Erro no login por celular:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as LoginResponse);
  }
};

/**
 * POST /api/auth/login/google
 * Login/Cadastro com Google OAuth
 */
export const loginGoogle: RequestHandler = async (req, res) => {
  try {
    const { googleToken, googleId, email, nome, foto }: LoginGoogleRequest = req.body;

    // Validações básicas
    if (!googleToken || !googleId || !email || !nome) {
      return res.status(400).json({
        sucesso: false,
        erro: "Dados do Google OAuth incompletos"
      } as LoginResponse);
    }

    if (!validarEmail(email)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Email inválido"
      } as LoginResponse);
    }

    // TODO: Validar token do Google com a API do Google
    // Por enquanto, vamos confiar no token enviado pelo frontend

    // Buscar cliente existente por Google ID ou email
    let cliente = await executeQuerySingle(`
      SELECT id, nome, email, celular, tipo_login, status,
             email_verificado, celular_verificado
      FROM clientes 
      WHERE google_id = ? OR (email = ? AND (tipo_login = 'google' OR tipo_login = 'ambos'))
    `, [googleId, email]);

    let clienteId: string;
    let isNewUser = false;

    if (cliente) {
      // Cliente existente - atualizar último login
      clienteId = cliente.id;

      // Verificar status
      if (cliente.status !== 'ativo') {
        return res.status(401).json({
          sucesso: false,
          erro: "Conta inativa ou suspensa"
        } as LoginResponse);
      }

      // Atualizar dados do Google se necessário
      await executeQuery(`
        UPDATE clientes 
        SET google_id = ?, foto = ?, ultimo_login = CURRENT_TIMESTAMP,
            email_verificado = true, tipo_login = CASE 
              WHEN tipo_login = 'celular' THEN 'ambos' 
              ELSE tipo_login 
            END
        WHERE id = ?
      `, [googleId, foto, clienteId]);

    } else {
      // Novo cliente - criar conta
      isNewUser = true;
      clienteId = require('uuid').v4();

      await executeQuery(`
        INSERT INTO clientes (
          id, nome, email, celular, tipo_login, google_id, foto,
          email_verificado, celular_verificado, status, ultimo_login
        ) VALUES (?, ?, ?, '', 'google', ?, ?, true, false, 'ativo', CURRENT_TIMESTAMP)
      `, [clienteId, nome, email, googleId, foto]);
    }

    // Gerar tokens
    const token = gerarToken({
      clienteId,
      celular: cliente?.celular || '',
      email,
      nome,
      tipoLogin: 'google'
    });

    const refreshToken = gerarRefreshToken(clienteId);

    // Buscar dados completos do cliente
    const clienteCompleto = await executeQuerySingle(`
      SELECT id, nome, email, celular, data_nascimento, foto,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, 
             endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
             servicos_preferidos, tipo_login, google_id, email_verificado, 
             celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
      FROM clientes 
      WHERE id = ?
    `, [clienteId]);

    const response: LoginResponse = {
      sucesso: true,
      token,
      refreshToken,
      cliente: clienteCompleto ? {
        id: clienteCompleto.id,
        nome: clienteCompleto.nome,
        email: clienteCompleto.email,
        celular: clienteCompleto.celular,
        dataNascimento: clienteCompleto.data_nascimento,
        foto: clienteCompleto.foto,
        endereco: {
          rua: clienteCompleto.endereco_rua,
          numero: clienteCompleto.endereco_numero,
          bairro: clienteCompleto.endereco_bairro,
          cidade: clienteCompleto.endereco_cidade,
          estado: clienteCompleto.endereco_estado,
          cep: clienteCompleto.endereco_cep
        },
        preferencias: {
          barbeariaId: clienteCompleto.barbearia_preferida,
          barbeiroId: clienteCompleto.barbeiro_preferido,
          servicosPreferidos: clienteCompleto.servicos_preferidos ? JSON.parse(clienteCompleto.servicos_preferidos) : []
        },
        tipoLogin: clienteCompleto.tipo_login,
        googleId: clienteCompleto.google_id,
        emailVerificado: clienteCompleto.email_verificado,
        celularVerificado: clienteCompleto.celular_verificado,
        status: clienteCompleto.status,
        dataCadastro: clienteCompleto.data_cadastro,
        dataAtualizacao: clienteCompleto.data_atualizacao,
        ultimoLogin: clienteCompleto.ultimo_login
      } : undefined,
      expiresIn: 7 * 24 * 60 * 60,
      mensagem: isNewUser ? "Conta criada e login realizado com sucesso" : "Login realizado com sucesso"
    };

    res.json(response);

  } catch (error) {
    console.error("Erro no login Google:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as LoginResponse);
  }
};

/**
 * POST /api/auth/verificar-token
 * Verificar se o token JWT é válido
 */
export const verificarTokenAuth: RequestHandler = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        valido: false,
        erro: "Token não fornecido"
      } as VerificarTokenResponse);
    }

    const payload = verificarToken(token);

    if (!payload) {
      return res.json({
        valido: false,
        erro: "Token inválido ou expirado"
      } as VerificarTokenResponse);
    }

    // Buscar dados atuais do cliente
    const cliente = await executeQuerySingle(`
      SELECT id, nome, email, celular, data_nascimento, foto,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, 
             endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
             servicos_preferidos, tipo_login, google_id, email_verificado, 
             celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
      FROM clientes 
      WHERE id = ? AND status = 'ativo'
    `, [payload.clienteId]);

    if (!cliente) {
      return res.json({
        valido: false,
        erro: "Cliente não encontrado ou inativo"
      } as VerificarTokenResponse);
    }

    res.json({
      valido: true,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        celular: cliente.celular,
        dataNascimento: cliente.data_nascimento,
        foto: cliente.foto,
        endereco: {
          rua: cliente.endereco_rua,
          numero: cliente.endereco_numero,
          bairro: cliente.endereco_bairro,
          cidade: cliente.endereco_cidade,
          estado: cliente.endereco_estado,
          cep: cliente.endereco_cep
        },
        preferencias: {
          barbeariaId: cliente.barbearia_preferida,
          barbeiroId: cliente.barbeiro_preferido,
          servicosPreferidos: cliente.servicos_preferidos ? JSON.parse(cliente.servicos_preferidos) : []
        },
        tipoLogin: cliente.tipo_login,
        googleId: cliente.google_id,
        emailVerificado: cliente.email_verificado,
        celularVerificado: cliente.celular_verificado,
        status: cliente.status,
        dataCadastro: cliente.data_cadastro,
        dataAtualizacao: cliente.data_atualizacao,
        ultimoLogin: cliente.ultimo_login
      }
    } as VerificarTokenResponse);

  } catch (error) {
    console.error("Erro na verificação de token:", error);
    res.status(500).json({
      valido: false,
      erro: "Erro interno do servidor"
    } as VerificarTokenResponse);
  }
};

/**
 * POST /api/auth/alterar-senha
 * Alterar senha do cliente logado
 */
export const alterarSenha: RequestHandler = async (req, res) => {
  try {
    const clienteJWT = (req as any).cliente;
    const { senhaAtual, novaSenha }: AlterarSenhaRequest = req.body;

    if (!clienteJWT) {
      return res.status(401).json({
        sucesso: false,
        erro: "Autenticação requerida"
      } as ApiResponse);
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual e nova senha são obrigatórias"
      } as ApiResponse);
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        sucesso: false,
        erro: "Nova senha deve ter pelo menos 6 caracteres"
      } as ApiResponse);
    }

    // Buscar cliente
    const cliente = await executeQuerySingle(`
      SELECT senha_hash FROM clientes WHERE id = ?
    `, [clienteJWT.clienteId]);

    if (!cliente || !cliente.senha_hash) {
      return res.status(400).json({
        sucesso: false,
        erro: "Cliente não possui senha cadastrada"
      } as ApiResponse);
    }

    // Verificar senha atual
    if (!await verificarSenha(senhaAtual, cliente.senha_hash)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual incorreta"
      } as ApiResponse);
    }

    // Hash da nova senha
    const novaSenhaHash = await hashSenha(novaSenha);

    // Atualizar senha
    await executeQuery(`
      UPDATE clientes SET senha_hash = ?, data_atualizacao = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [novaSenhaHash, clienteJWT.clienteId]);

    res.json({
      sucesso: true,
      mensagem: "Senha alterada com sucesso"
    } as ApiResponse);

  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as ApiResponse);
  }
};

/**
 * POST /api/auth/refresh-token
 * Renovar token JWT usando refresh token
 */
export const refreshTokenAuth: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        sucesso: false,
        erro: "Refresh token não fornecido"
      } as LoginResponse);
    }

    const payload = verificarToken(refreshToken);

    if (!payload || (payload as any).type !== 'refresh') {
      return res.status(401).json({
        sucesso: false,
        erro: "Refresh token inválido"
      } as LoginResponse);
    }

    // Buscar cliente
    const cliente = await executeQuerySingle(`
      SELECT id, nome, email, celular, tipo_login, status
      FROM clientes 
      WHERE id = ? AND status = 'ativo'
    `, [(payload as any).clienteId]);

    if (!cliente) {
      return res.status(401).json({
        sucesso: false,
        erro: "Cliente não encontrado ou inativo"
      } as LoginResponse);
    }

    // Gerar novos tokens
    const newToken = gerarToken({
      clienteId: cliente.id,
      celular: cliente.celular,
      email: cliente.email,
      nome: cliente.nome,
      tipoLogin: cliente.tipo_login
    });

    const newRefreshToken = gerarRefreshToken(cliente.id);

    res.json({
      sucesso: true,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 7 * 24 * 60 * 60,
      mensagem: "Token renovado com sucesso"
    } as LoginResponse);

  } catch (error) {
    console.error("Erro ao renovar token:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor"
    } as LoginResponse);
  }
};
