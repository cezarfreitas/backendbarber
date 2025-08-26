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
  Barbeiro,
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
  gerarCodigoVerificacao,
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
        erro: "Celular e senha são obrigatórios",
      } as LoginResponse);
    }

    if (!validarCelular(celular)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de celular inválido",
      } as LoginResponse);
    }

    // Buscar cliente no banco
    const cliente = await executeQuerySingle(
      `
      SELECT id, nome, email, celular, senha_hash, tipo_login, status,
             email_verificado, celular_verificado
      FROM clientes 
      WHERE celular = ? AND (tipo_login = 'celular' OR tipo_login = 'ambos')
    `,
      [formatarCelular(celular)],
    );

    if (!cliente) {
      return res.status(401).json({
        sucesso: false,
        erro: "Celular não encontrado ou tipo de login incorreto",
      } as LoginResponse);
    }

    // Verificar status do cliente
    if (cliente.status !== "ativo") {
      return res.status(401).json({
        sucesso: false,
        erro: "Conta inativa ou suspensa",
      } as LoginResponse);
    }

    // Verificar senha
    if (
      !cliente.senha_hash ||
      !(await verificarSenha(senha, cliente.senha_hash))
    ) {
      return res.status(401).json({
        sucesso: false,
        erro: "Senha incorreta",
      } as LoginResponse);
    }

    // Gerar tokens
    const token = gerarToken({
      clienteId: cliente.id,
      celular: cliente.celular,
      email: cliente.email,
      nome: cliente.nome,
      tipoLogin: cliente.tipo_login,
    });

    const refreshToken = gerarRefreshToken(cliente.id);

    // Atualizar último login
    await executeQuery(
      `
      UPDATE clientes SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?
    `,
      [cliente.id],
    );

    // Buscar dados completos do cliente (sem senha)
    const clienteCompleto = await executeQuerySingle(
      `
      SELECT id, nome, email, celular, data_nascimento, foto,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, 
             endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
             servicos_preferidos, tipo_login, google_id, email_verificado, 
             celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
      FROM clientes 
      WHERE id = ?
    `,
      [cliente.id],
    );

    const response: LoginResponse = {
      sucesso: true,
      token,
      refreshToken,
      cliente: clienteCompleto
        ? {
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
              cep: clienteCompleto.endereco_cep,
            },
            preferencias: {
              barbeariaId: clienteCompleto.barbearia_preferida,
              barbeiroId: clienteCompleto.barbeiro_preferido,
              servicosPreferidos: clienteCompleto.servicos_preferidos
                ? JSON.parse(clienteCompleto.servicos_preferidos)
                : [],
            },
            tipoLogin: clienteCompleto.tipo_login,
            googleId: clienteCompleto.google_id,
            emailVerificado: clienteCompleto.email_verificado,
            celularVerificado: clienteCompleto.celular_verificado,
            status: clienteCompleto.status,
            dataCadastro: clienteCompleto.data_cadastro,
            dataAtualizacao: clienteCompleto.data_atualizacao,
            ultimoLogin: clienteCompleto.ultimo_login,
          }
        : undefined,
      expiresIn: 7 * 24 * 60 * 60, // 7 dias em segundos
      mensagem: "Login realizado com sucesso",
    };

    res.json(response);
  } catch (error) {
    console.error("Erro no login por celular:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
    } as LoginResponse);
  }
};

/**
 * POST /api/auth/login/barbearia
 * Login para barbearias com email + senha
 */
export const loginBarbearia: RequestHandler = async (req, res) => {
  try {
    const { email, senha }: LoginBarbeariaRequest = req.body;

    // Log request (avoid logging password)
    console.log(`[loginBarbearia] tentativa de login para email=${email}`);

    // Validações básicas
    if (!email || !senha) {
      console.log("[loginBarbearia] email ou senha ausente");
      return res.status(400).json({
        sucesso: false,
        erro: "Email e senha são obrigatórios",
      } as LoginBarbeariaResponse);
    }

    if (!validarEmail(email)) {
      console.log("[loginBarbearia] formato de email inválido:", email);
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de email inválido",
      } as LoginBarbeariaResponse);
    }

    // Buscar barbearia no banco
    console.log(`[loginBarbearia] consultando barbearia por email=${email}`);
    const barbearia = await executeQuerySingle(
      `
      SELECT id, nome, contato_email, senha_hash, status
      FROM barbearias
      WHERE contato_email = ?
    `,
      [email],
    );

    console.log(
      `[loginBarbearia] resultado da query: ${barbearia ? "encontrada" : "nao encontrada"}`,
    );

    if (!barbearia) {
      return res.status(401).json({
        sucesso: false,
        erro: "Email não encontrado",
      } as LoginBarbeariaResponse);
    }

    console.log(
      `[loginBarbearia] barbearia id=${barbearia.id} status=${barbearia.status} temSenha=${!!barbearia.senha_hash}`,
    );

    // Verificar status da barbearia
    if (barbearia.status !== "ativa") {
      return res.status(401).json({
        sucesso: false,
        erro: "Barbearia inativa ou pendente",
      } as LoginBarbeariaResponse);
    }

    // Verificar senha
    const senhaValida = barbearia.senha_hash
      ? await verificarSenha(senha, barbearia.senha_hash)
      : false;
    if (!barbearia.senha_hash || !senhaValida) {
      console.log(
        `[loginBarbearia] senha inválida para barbearia id=${barbearia.id}`,
      );
      return res.status(401).json({
        sucesso: false,
        erro: "Senha incorreta",
      } as LoginBarbeariaResponse);
    }

    console.log(
      `[loginBarbearia] senha verificada para barbearia id=${barbearia.id}`,
    );

    // Gerar tokens
    const token = gerarToken({
      userId: barbearia.id,
      userType: "barbearia",
      email: barbearia.contato_email,
      nome: barbearia.nome,
      tipoLogin: "email",
    });

    const refreshToken = gerarRefreshToken(barbearia.id);

    // Atualizar último login
    await executeQuery(
      `
      UPDATE barbearias SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?
    `,
      [barbearia.id],
    );
    console.log(
      `[loginBarbearia] ultimo_login atualizado para id=${barbearia.id}`,
    );

    // Buscar dados completos da barbearia
    const barbeariaCompleta = await executeQuerySingle(
      `
      SELECT id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
             endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
             contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
             proprietario_email, horario_funcionamento, status, data_cadastro,
             data_atualizacao, ultimo_login
      FROM barbearias
      WHERE id = ?
    `,
      [barbearia.id],
    );

    console.log(
      `[loginBarbearia] barbeariaCompleta encontrada id=${barbeariaCompleta ? barbeariaCompleta.id : "null"}`,
    );

    const response: LoginBarbeariaResponse = {
      sucesso: true,
      token,
      refreshToken,
      barbearia: barbeariaCompleta
        ? {
            id: barbeariaCompleta.id,
            nome: barbeariaCompleta.nome,
            descricao: barbeariaCompleta.descricao,
            endereco: {
              rua: barbeariaCompleta.endereco_rua,
              numero: barbeariaCompleta.endereco_numero,
              bairro: barbeariaCompleta.endereco_bairro,
              cidade: barbeariaCompleta.endereco_cidade,
              estado: barbeariaCompleta.endereco_estado,
              cep: barbeariaCompleta.endereco_cep,
            },
            contato: {
              telefone: barbeariaCompleta.contato_telefone,
              email: barbeariaCompleta.contato_email,
              whatsapp: barbeariaCompleta.contato_whatsapp,
            },
            proprietario: {
              nome: barbeariaCompleta.proprietario_nome,
              cpf: barbeariaCompleta.proprietario_cpf,
              email: barbeariaCompleta.proprietario_email,
            },
            horarioFuncionamento: (() => {
              try {
                const hf = barbeariaCompleta.horario_funcionamento;
                if (!hf) return {};
                if (typeof hf === "string") return JSON.parse(hf);
                return hf;
              } catch (e) {
                console.error('[loginBarbearia] erro parse horario_funcionamento', e);
                return {};
              }
            })(),
            status: barbeariaCompleta.status,
            dataCadastro: barbeariaCompleta.data_cadastro,
            dataAtualizacao: barbeariaCompleta.data_atualizacao,
          }
        : undefined,
      expiresIn: 7 * 24 * 60 * 60,
      mensagem: "Login realizado com sucesso",
    };

    res.json(response);
  } catch (error) {
    console.error("Erro no login de barbearia:", error);
    const detalhe = error && (error as any).message ? (error as any).message : String(error);
    const stack = error && (error as any).stack ? (error as any).stack.split('\n').map((s: string) => s.trim()) : undefined;
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
      detalhe,
      stack,
    } as any);
  }
};

/**
 * POST /api/auth/login/google
 * Login/Cadastro com Google OAuth
 */
export const loginGoogle: RequestHandler = async (req, res) => {
  try {
    const { googleToken, googleId, email, nome, foto }: LoginGoogleRequest =
      req.body;

    // Validações básicas
    if (!googleToken || !googleId || !email || !nome) {
      return res.status(400).json({
        sucesso: false,
        erro: "Dados do Google OAuth incompletos",
      } as LoginResponse);
    }

    if (!validarEmail(email)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Email inválido",
      } as LoginResponse);
    }

    // TODO: Validar token do Google com a API do Google
    // Por enquanto, vamos confiar no token enviado pelo frontend

    // Buscar cliente existente por Google ID ou email
    let cliente = await executeQuerySingle(
      `
      SELECT id, nome, email, celular, tipo_login, status,
             email_verificado, celular_verificado
      FROM clientes 
      WHERE google_id = ? OR (email = ? AND (tipo_login = 'google' OR tipo_login = 'ambos'))
    `,
      [googleId, email],
    );

    let clienteId: string;
    let isNewUser = false;

    if (cliente) {
      // Cliente existente - atualizar último login
      clienteId = cliente.id;

      // Verificar status
      if (cliente.status !== "ativo") {
        return res.status(401).json({
          sucesso: false,
          erro: "Conta inativa ou suspensa",
        } as LoginResponse);
      }

      // Atualizar dados do Google se necessário
      await executeQuery(
        `
        UPDATE clientes 
        SET google_id = ?, foto = ?, ultimo_login = CURRENT_TIMESTAMP,
            email_verificado = true, tipo_login = CASE 
              WHEN tipo_login = 'celular' THEN 'ambos' 
              ELSE tipo_login 
            END
        WHERE id = ?
      `,
        [googleId, foto, clienteId],
      );
    } else {
      // Novo cliente - criar conta
      isNewUser = true;
      clienteId = require("uuid").v4();

      await executeQuery(
        `
        INSERT INTO clientes (
          id, nome, email, celular, tipo_login, google_id, foto,
          email_verificado, celular_verificado, status, ultimo_login
        ) VALUES (?, ?, ?, '', 'google', ?, ?, true, false, 'ativo', CURRENT_TIMESTAMP)
      `,
        [clienteId, nome, email, googleId, foto],
      );
    }

    // Gerar tokens
    const token = gerarToken({
      clienteId,
      celular: cliente?.celular || "",
      email,
      nome,
      tipoLogin: "google",
    });

    const refreshToken = gerarRefreshToken(clienteId);

    // Buscar dados completos do cliente
    const clienteCompleto = await executeQuerySingle(
      `
      SELECT id, nome, email, celular, data_nascimento, foto,
             endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, 
             endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
             servicos_preferidos, tipo_login, google_id, email_verificado, 
             celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
      FROM clientes 
      WHERE id = ?
    `,
      [clienteId],
    );

    const response: LoginResponse = {
      sucesso: true,
      token,
      refreshToken,
      cliente: clienteCompleto
        ? {
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
              cep: clienteCompleto.endereco_cep,
            },
            preferencias: {
              barbeariaId: clienteCompleto.barbearia_preferida,
              barbeiroId: clienteCompleto.barbeiro_preferido,
              servicosPreferidos: clienteCompleto.servicos_preferidos
                ? JSON.parse(clienteCompleto.servicos_preferidos)
                : [],
            },
            tipoLogin: clienteCompleto.tipo_login,
            googleId: clienteCompleto.google_id,
            emailVerificado: clienteCompleto.email_verificado,
            celularVerificado: clienteCompleto.celular_verificado,
            status: clienteCompleto.status,
            dataCadastro: clienteCompleto.data_cadastro,
            dataAtualizacao: clienteCompleto.data_atualizacao,
            ultimoLogin: clienteCompleto.ultimo_login,
          }
        : undefined,
      expiresIn: 7 * 24 * 60 * 60,
      mensagem: isNewUser
        ? "Conta criada e login realizado com sucesso"
        : "Login realizado com sucesso",
    };

    res.json(response);
  } catch (error) {
    console.error("Erro no login Google:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
    } as LoginResponse);
  }
};

/**
 * POST /api/auth/login/barbeiro
 * Login para barbeiros com email + senha
 */
export const loginBarbeiro: RequestHandler = async (req, res) => {
  try {
    const { email, senha }: LoginBarbeiroRequest = req.body;

    // Validações básicas
    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        erro: "Email e senha são obrigatórios",
      } as LoginBarbeiroResponse);
    }

    if (!validarEmail(email)) {
      return res.status(400).json({
        sucesso: false,
        erro: "Formato de email inválido",
      } as LoginBarbeiroResponse);
    }

    // Buscar barbeiro no banco
    const barbeiro = await executeQuerySingle(
      `
      SELECT id, nome, email, senha_hash, status, barbearia_id
      FROM barbeiros
      WHERE email = ?
    `,
      [email],
    );

    if (!barbeiro) {
      return res.status(401).json({
        sucesso: false,
        erro: "Email não encontrado",
      } as LoginBarbeiroResponse);
    }

    // Verificar status do barbeiro
    if (barbeiro.status !== "ativo") {
      return res.status(401).json({
        sucesso: false,
        erro: "Barbeiro inativo ou afastado",
      } as LoginBarbeiroResponse);
    }

    // Verificar senha
    if (
      !barbeiro.senha_hash ||
      !(await verificarSenha(senha, barbeiro.senha_hash))
    ) {
      return res.status(401).json({
        sucesso: false,
        erro: "Senha incorreta",
      } as LoginBarbeiroResponse);
    }

    // Gerar tokens
    const token = gerarToken({
      userId: barbeiro.id,
      userType: "barbeiro",
      email: barbeiro.email,
      nome: barbeiro.nome,
      tipoLogin: "email",
      barbeariaId: barbeiro.barbearia_id,
    });

    const refreshToken = gerarRefreshToken(barbeiro.id);

    // Atualizar último login
    await executeQuery(
      `
      UPDATE barbeiros SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?
    `,
      [barbeiro.id],
    );

    // Buscar dados completos do barbeiro
    const barbeiroCompleto = await executeQuerySingle(
      `
      SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao,
             salario_fixo, valor_hora, barbearia_id, especialidades,
             horario_trabalho, status, data_cadastro, data_atualizacao, ultimo_login
      FROM barbeiros
      WHERE id = ?
    `,
      [barbeiro.id],
    );

    const response: LoginBarbeiroResponse = {
      sucesso: true,
      token,
      refreshToken,
      barbeiro: barbeiroCompleto
        ? {
            id: barbeiroCompleto.id,
            nome: barbeiroCompleto.nome,
            email: barbeiroCompleto.email,
            telefone: barbeiroCompleto.telefone,
            cpf: barbeiroCompleto.cpf,
            tipo: barbeiroCompleto.tipo,
            porcentagemComissao: barbeiroCompleto.porcentagem_comissao,
            salarioFixo: barbeiroCompleto.salario_fixo,
            valorHora: barbeiroCompleto.valor_hora,
            barbeariaId: barbeiroCompleto.barbearia_id,
            especialidades: barbeiroCompleto.especialidades
              ? JSON.parse(barbeiroCompleto.especialidades)
              : [],
            horarioTrabalho: barbeiroCompleto.horario_trabalho
              ? JSON.parse(barbeiroCompleto.horario_trabalho)
              : {},
            status: barbeiroCompleto.status,
            dataCadastro: barbeiroCompleto.data_cadastro,
            dataAtualizacao: barbeiroCompleto.data_atualizacao,
          }
        : undefined,
      expiresIn: 7 * 24 * 60 * 60,
      mensagem: "Login realizado com sucesso",
    };

    res.json(response);
  } catch (error) {
    console.error("Erro no login de barbeiro:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
    } as LoginBarbeiroResponse);
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
        erro: "Token não fornecido",
      } as VerificarTokenResponse);
    }

    const payload = verificarToken(token);

    if (!payload) {
      return res.json({
        valido: false,
        erro: "Token inválido ou expirado",
      } as VerificarTokenResponse);
    }

    const response: VerificarTokenResponse = {
      valido: true,
      userType: payload.userType,
    };

    // Buscar dados baseado no tipo de usuário
    if (payload.userType === "cliente") {
      const cliente = await executeQuerySingle(
        `
        SELECT id, nome, email, celular, data_nascimento, foto,
               endereco_rua, endereco_numero, endereco_bairro, endereco_cidade,
               endereco_estado, endereco_cep, barbearia_preferida, barbeiro_preferido,
               servicos_preferidos, tipo_login, google_id, email_verificado,
               celular_verificado, status, data_cadastro, data_atualizacao, ultimo_login
        FROM clientes
        WHERE id = ? AND status = 'ativo'
      `,
        [payload.userId],
      );

      if (!cliente) {
        return res.json({
          valido: false,
          erro: "Cliente não encontrado ou inativo",
        } as VerificarTokenResponse);
      }

      response.cliente = {
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
          cep: cliente.endereco_cep,
        },
        preferencias: {
          barbeariaId: cliente.barbearia_preferida,
          barbeiroId: cliente.barbeiro_preferido,
          servicosPreferidos: (() => {
            try {
              return cliente.servicos_preferidos
                ? JSON.parse(cliente.servicos_preferidos)
                : [];
            } catch (error) {
              return [];
            }
          })(),
        },
        tipoLogin: cliente.tipo_login,
        googleId: cliente.google_id,
        emailVerificado: cliente.email_verificado,
        celularVerificado: cliente.celular_verificado,
        status: cliente.status,
        dataCadastro: cliente.data_cadastro,
        dataAtualizacao: cliente.data_atualizacao,
        ultimoLogin: cliente.ultimo_login,
      };
    } else if (payload.userType === "barbearia") {
      const barbearia = await executeQuerySingle(
        `
        SELECT id, nome, descricao, endereco_rua, endereco_numero, endereco_bairro,
               endereco_cidade, endereco_estado, endereco_cep, contato_telefone,
               contato_email, contato_whatsapp, proprietario_nome, proprietario_cpf,
               proprietario_email, horario_funcionamento, status, data_cadastro,
               data_atualizacao, ultimo_login
        FROM barbearias
        WHERE id = ? AND status = 'ativa'
      `,
        [payload.userId],
      );

      if (!barbearia) {
        return res.json({
          valido: false,
          erro: "Barbearia não encontrada ou inativa",
        } as VerificarTokenResponse);
      }

      response.barbearia = {
        id: barbearia.id,
        nome: barbearia.nome,
        descricao: barbearia.descricao,
        endereco: {
          rua: barbearia.endereco_rua,
          numero: barbearia.endereco_numero,
          bairro: barbearia.endereco_bairro,
          cidade: barbearia.endereco_cidade,
          estado: barbearia.endereco_estado,
          cep: barbearia.endereco_cep,
        },
        contato: {
          telefone: barbearia.contato_telefone,
          email: barbearia.contato_email,
          whatsapp: barbearia.contato_whatsapp,
        },
        proprietario: {
          nome: barbearia.proprietario_nome,
          cpf: barbearia.proprietario_cpf,
          email: barbearia.proprietario_email,
        },
        horarioFuncionamento: barbearia.horario_funcionamento
          ? JSON.parse(barbearia.horario_funcionamento)
          : {},
        status: barbearia.status,
        dataCadastro: barbearia.data_cadastro,
        dataAtualizacao: barbearia.data_atualizacao,
      };
    } else if (payload.userType === "barbeiro") {
      const barbeiro = await executeQuerySingle(
        `
        SELECT id, nome, email, telefone, cpf, tipo, porcentagem_comissao,
               salario_fixo, valor_hora, barbearia_id, especialidades,
               horario_trabalho, status, data_cadastro, data_atualizacao, ultimo_login
        FROM barbeiros
        WHERE id = ? AND status = 'ativo'
      `,
        [payload.userId],
      );

      if (!barbeiro) {
        return res.json({
          valido: false,
          erro: "Barbeiro não encontrado ou inativo",
        } as VerificarTokenResponse);
      }

      response.barbeiro = {
        id: barbeiro.id,
        nome: barbeiro.nome,
        email: barbeiro.email,
        telefone: barbeiro.telefone,
        cpf: barbeiro.cpf,
        tipo: barbeiro.tipo,
        porcentagemComissao: barbeiro.porcentagem_comissao,
        salarioFixo: barbeiro.salario_fixo,
        valorHora: barbeiro.valor_hora,
        barbeariaId: barbeiro.barbearia_id,
        especialidades: barbeiro.especialidades
          ? JSON.parse(barbeiro.especialidades)
          : [],
        horarioTrabalho: barbeiro.horario_trabalho
          ? JSON.parse(barbeiro.horario_trabalho)
          : {},
        status: barbeiro.status,
        dataCadastro: barbeiro.data_cadastro,
        dataAtualizacao: barbeiro.data_atualizacao,
      };
    }

    res.json(response);
  } catch (error) {
    console.error("Erro na verificação de token:", error);
    res.status(500).json({
      valido: false,
      erro: "Erro interno do servidor",
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
        erro: "Autenticação requerida",
      } as ApiResponse);
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual e nova senha são obrigatórias",
      } as ApiResponse);
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        sucesso: false,
        erro: "Nova senha deve ter pelo menos 6 caracteres",
      } as ApiResponse);
    }

    // Buscar cliente
    const cliente = await executeQuerySingle(
      `
      SELECT senha_hash FROM clientes WHERE id = ?
    `,
      [clienteJWT.clienteId],
    );

    if (!cliente || !cliente.senha_hash) {
      return res.status(400).json({
        sucesso: false,
        erro: "Cliente não possui senha cadastrada",
      } as ApiResponse);
    }

    // Verificar senha atual
    if (!(await verificarSenha(senhaAtual, cliente.senha_hash))) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual incorreta",
      } as ApiResponse);
    }

    // Hash da nova senha
    const novaSenhaHash = await hashSenha(novaSenha);

    // Atualizar senha
    await executeQuery(
      `
      UPDATE clientes SET senha_hash = ?, data_atualizacao = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [novaSenhaHash, clienteJWT.clienteId],
    );

    res.json({
      sucesso: true,
      mensagem: "Senha alterada com sucesso",
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
    } as ApiResponse);
  }
};

/**
 * POST /api/auth/alterar-senha/barbearia
 * Alterar senha da barbearia logada
 */
export const alterarSenhaBarbearia: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente; // Usando a mesma variável por compatibilidade
    const { senhaAtual, novaSenha }: AlterarSenhaBarbeariaRequest = req.body;

    if (!userJWT || userJWT.userType !== "barbearia") {
      return res.status(401).json({
        sucesso: false,
        erro: "Autenticação de barbearia requerida",
      } as ApiResponse);
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual e nova senha são obrigatórias",
      } as ApiResponse);
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        sucesso: false,
        erro: "Nova senha deve ter pelo menos 6 caracteres",
      } as ApiResponse);
    }

    // Buscar barbearia
    const barbearia = await executeQuerySingle(
      `
      SELECT senha_hash FROM barbearias WHERE id = ?
    `,
      [userJWT.userId],
    );

    if (!barbearia || !barbearia.senha_hash) {
      return res.status(400).json({
        sucesso: false,
        erro: "Barbearia não possui senha cadastrada",
      } as ApiResponse);
    }

    // Verificar senha atual
    if (!(await verificarSenha(senhaAtual, barbearia.senha_hash))) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual incorreta",
      } as ApiResponse);
    }

    // Hash da nova senha
    const novaSenhaHash = await hashSenha(novaSenha);

    // Atualizar senha
    await executeQuery(
      `
      UPDATE barbearias SET senha_hash = ?, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [novaSenhaHash, userJWT.userId],
    );

    res.json({
      sucesso: true,
      mensagem: "Senha alterada com sucesso",
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao alterar senha da barbearia:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
    } as ApiResponse);
  }
};

/**
 * POST /api/auth/alterar-senha/barbeiro
 * Alterar senha do barbeiro logado
 */
export const alterarSenhaBarbeiro: RequestHandler = async (req, res) => {
  try {
    const userJWT = (req as any).cliente; // Usando a mesma variável por compatibilidade
    const { senhaAtual, novaSenha }: AlterarSenhaBarbeiroRequest = req.body;

    if (!userJWT || userJWT.userType !== "barbeiro") {
      return res.status(401).json({
        sucesso: false,
        erro: "Autenticação de barbeiro requerida",
      } as ApiResponse);
    }

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual e nova senha são obrigatórias",
      } as ApiResponse);
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        sucesso: false,
        erro: "Nova senha deve ter pelo menos 6 caracteres",
      } as ApiResponse);
    }

    // Buscar barbeiro
    const barbeiro = await executeQuerySingle(
      `
      SELECT senha_hash FROM barbeiros WHERE id = ?
    `,
      [userJWT.userId],
    );

    if (!barbeiro || !barbeiro.senha_hash) {
      return res.status(400).json({
        sucesso: false,
        erro: "Barbeiro não possui senha cadastrada",
      } as ApiResponse);
    }

    // Verificar senha atual
    if (!(await verificarSenha(senhaAtual, barbeiro.senha_hash))) {
      return res.status(400).json({
        sucesso: false,
        erro: "Senha atual incorreta",
      } as ApiResponse);
    }

    // Hash da nova senha
    const novaSenhaHash = await hashSenha(novaSenha);

    // Atualizar senha
    await executeQuery(
      `
      UPDATE barbeiros SET senha_hash = ?, data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [novaSenhaHash, userJWT.userId],
    );

    res.json({
      sucesso: true,
      mensagem: "Senha alterada com sucesso",
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao alterar senha do barbeiro:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
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
        erro: "Refresh token não fornecido",
      } as LoginResponse);
    }

    const payload = verificarToken(refreshToken);

    if (!payload || (payload as any).type !== "refresh") {
      return res.status(401).json({
        sucesso: false,
        erro: "Refresh token inválido",
      } as LoginResponse);
    }

    // Buscar usu��rio baseado no tipo (legado - assumindo cliente se não especificado)
    const userId = (payload as any).clienteId || (payload as any).userId;

    // Para compatibilidade com tokens antigos, assumir cliente se não tiver userType
    const userType = (payload as any).userType || "cliente";

    let userData;
    if (userType === "cliente") {
      userData = await executeQuerySingle(
        `
        SELECT id, nome, email, celular, tipo_login, status
        FROM clientes
        WHERE id = ? AND status = 'ativo'
      `,
        [userId],
      );
    } else if (userType === "barbearia") {
      userData = await executeQuerySingle(
        `
        SELECT id, nome, contato_email as email, status
        FROM barbearias
        WHERE id = ? AND status = 'ativa'
      `,
        [userId],
      );
    } else if (userType === "barbeiro") {
      userData = await executeQuerySingle(
        `
        SELECT id, nome, email, status, barbearia_id
        FROM barbeiros
        WHERE id = ? AND status = 'ativo'
      `,
        [userId],
      );
    }

    if (!userData) {
      return res.status(401).json({
        sucesso: false,
        erro: "Usuário não encontrado ou inativo",
      } as LoginResponse);
    }

    // Gerar novos tokens baseado no tipo de usuário
    let tokenPayload: any = {
      userId: userData.id,
      userType: userType,
      email: userData.email,
      nome: userData.nome,
      tipoLogin: "email",
    };

    if (userType === "cliente") {
      tokenPayload.celular = userData.celular;
      tokenPayload.tipoLogin = userData.tipo_login;
    } else if (userType === "barbeiro") {
      tokenPayload.barbeariaId = userData.barbearia_id;
    }

    const newToken = gerarToken(tokenPayload);
    const newRefreshToken = gerarRefreshToken(userData.id);

    res.json({
      sucesso: true,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: 7 * 24 * 60 * 60,
      mensagem: "Token renovado com sucesso",
    } as LoginResponse);
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
    } as LoginResponse);
  }
};
