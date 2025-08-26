import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWTPayload } from "@shared/api";
import { Request, Response, NextFunction } from "express";

// Configurações JWT
const JWT_SECRET =
  process.env.JWT_SECRET || "seu-jwt-secret-super-seguro-aqui-em-producao";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

/**
 * Gera hash da senha
 */
export const hashSenha = async (senha: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(senha, salt);
};

/**
 * Verifica se a senha está correta
 */
export const verificarSenha = async (
  senha: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(senha, hash);
};

/**
 * Gera token JWT
 */
export const gerarToken = (
  payload: Omit<JWTPayload, "iat" | "exp">,
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Gera refresh token JWT
 */
export const gerarRefreshToken = (clienteId: string): string => {
  return jwt.sign({ clienteId, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Verifica e decodifica token JWT
 */
export const verificarToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extrai token do header Authorization
 */
export const extrairToken = (authHeader?: string): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
};

/**
 * Middleware para verificar autenticação
 */
export const verificarAutenticacao = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extrairToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: "Token de acesso requerido",
      });
    }

    const payload = verificarToken(token);

    if (!payload) {
      return res.status(401).json({
        sucesso: false,
        erro: "Token inválido ou expirado",
      });
    }

    // Adicionar dados do usuário ao request (compatibilidade mantida com .cliente)
    (req as any).cliente = payload;
    (req as any).usuario = payload; // Nova propriedade mais genérica
    (req as any).user = {
      id: (payload as any).userId || (payload as any).clienteId || null,
      userType: (payload as any).userType || (payload as any).type || "cliente",
      // Para compatibilidade, se for token de barbearia sem barbeariaId setado,
      // usar userId (ou clienteId) como barbeariaId
      barbeariaId:
        (payload as any).barbeariaId ||
        (payload as any).userId ||
        (payload as any).clienteId ||
        null,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      erro: "Erro na verificação do token",
    });
  }
};

/**
 * Middleware para verificar se é uma barbearia autenticada
 */
export const verificarBarbearia = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user =
      (req as any).user || (req as any).cliente || (req as any).usuario;

    if (!user || user.userType !== "barbearia") {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso restrito a barbearias",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      erro: "Erro na verificação do tipo de usuário",
    });
  }
};

/**
 * Middleware para verificar se é um barbeiro autenticado
 */
export const verificarBarbeiro = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user =
      (req as any).user || (req as any).cliente || (req as any).usuario;

    if (!user || user.userType !== "barbeiro") {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso restrito a barbeiros",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      erro: "Erro na verificação do tipo de usuário",
    });
  }
};

/**
 * Middleware para verificar se é um cliente autenticado
 */
export const verificarCliente = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user =
      (req as any).user || (req as any).cliente || (req as any).usuario;

    if (!user || user.userType !== "cliente") {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso restrito a clientes",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      erro: "Erro na verificação do tipo de usuário",
    });
  }
};

/**
 * Middleware para verificar se é barbearia OU barbeiro (profissionais)
 */
export const verificarProfissional = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user =
      (req as any).user || (req as any).cliente || (req as any).usuario;

    if (
      !user ||
      (user.userType !== "barbearia" && user.userType !== "barbeiro")
    ) {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso restrito a profissionais (barbearias ou barbeiros)",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      erro: "Erro na verificação do tipo de usuário",
    });
  }
};

/**
 * Middleware para verificar se é admin de barbearia (proprietário)
 */
export const verificarAdminBarbearia = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user =
      (req as any).user || (req as any).cliente || (req as any).usuario;

    if (!user || user.userType !== "barbearia") {
      return res.status(403).json({
        sucesso: false,
        erro: "Acesso restrito a administradores de barbearia",
      });
    }

    if (!user.barbeariaId) {
      return res.status(403).json({
        sucesso: false,
        erro: "Usuário não associado a uma barbearia",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      sucesso: false,
      erro: "Erro na verificação do admin",
    });
  }
};

/**
 * Middleware opcional para verificar autenticação (não bloqueia se não tiver token)
 */
export const verificarAutenticacaoOpcional = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extrairToken(req.headers.authorization);

    if (token) {
      const payload = verificarToken(token);
      if (payload) {
        (req as any).cliente = payload;
        (req as any).usuario = payload;
        (req as any).user = {
          id: (payload as any).userId || (payload as any).clienteId || null,
          userType:
            (payload as any).userType || (payload as any).type || "cliente",
          barbeariaId:
            (payload as any).barbeariaId ||
            (payload as any).userId ||
            (payload as any).clienteId ||
            null,
        };
      }
    }

    next();
  } catch (error) {
    // Continua mesmo com erro no token
    next();
  }
};

/**
 * Valida formato de celular brasileiro
 */
export const validarCelular = (celular: string): boolean => {
  // Remove caracteres especiais
  const celularLimpo = celular.replace(/\D/g, "");

  // Valida formato brasileiro: 11 dígitos (DDD + 9 + 8 dígitos)
  return /^[1-9]{2}9[0-9]{8}$/.test(celularLimpo);
};

/**
 * Formata celular para padrão brasileiro
 */
export const formatarCelular = (celular: string): string => {
  const celularLimpo = celular.replace(/\D/g, "");

  if (celularLimpo.length === 11) {
    return `(${celularLimpo.slice(0, 2)}) ${celularLimpo.slice(2, 7)}-${celularLimpo.slice(7)}`;
  }

  return celular; // Retorna original se não conseguir formatar
};

/**
 * Gera código de verificação aleatório (6 dígitos)
 */
export const gerarCodigoVerificacao = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Valida formato de email
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
