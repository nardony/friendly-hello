/**
 * Gerador de Payload PIX seguindo o padrão EMV/BRCode
 * Especificação: https://www.bcb.gov.br/content/estabilidadefinanceira/forumpiram/BR%20Code.pdf
 */

// Função para calcular CRC16-CCITT (polinômio 0x1021)
function crc16ccitt(str: string): string {
  let crc = 0xFFFF;
  
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xFFFF;
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Formata um campo TLV (Tag-Length-Value)
function formatTLV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

// Remove caracteres especiais e acentos
function sanitizeString(str: string, maxLength: number = 25): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .substring(0, maxLength)
    .trim();
}

// Valida CPF
function isValidCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCpf)) return false; // Todos dígitos iguais
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  if (digit1 !== parseInt(cleanCpf[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  if (digit2 !== parseInt(cleanCpf[10])) return false;
  
  return true;
}

// Valida CNPJ
function isValidCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  if (cleanCnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCnpj)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCnpj[i]) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  if (digit1 !== parseInt(cleanCnpj[12])) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCnpj[i]) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  if (digit2 !== parseInt(cleanCnpj[13])) return false;
  
  return true;
}

// Valida Email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 77;
}

// Valida Telefone (formato brasileiro)
function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  // Com DDI: 55 + DDD (2) + número (8-9) = 12-13 dígitos
  // Sem DDI: DDD (2) + número (8-9) = 10-11 dígitos
  if (cleanPhone.length < 10 || cleanPhone.length > 13) return false;
  
  // Se começa com 55, valida formato brasileiro
  if (cleanPhone.startsWith('55')) {
    const withoutDDI = cleanPhone.slice(2);
    return withoutDDI.length >= 10 && withoutDDI.length <= 11;
  }
  
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Valida chave aleatória (EVP - 32 caracteres UUID sem hífens ou com)
function isValidEVP(key: string): boolean {
  // UUID com hífens: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
  // UUID sem hífens: 32 chars hexadecimais
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const cleanUuidRegex = /^[0-9a-fA-F]{32}$/;
  
  return uuidRegex.test(key) || cleanUuidRegex.test(key);
}

// Detecta o tipo de chave PIX
function getPixKeyType(key: string): 'CPF' | 'CNPJ' | 'PHONE' | 'EMAIL' | 'EVP' {
  const cleanKey = key.replace(/\D/g, '');
  
  // Phone with + prefix is always phone
  if (key.startsWith('+')) {
    return 'PHONE';
  }
  
  if (/^\d{11}$/.test(cleanKey)) {
    // 11 digits: could be CPF or phone. Check if valid CPF first.
    if (isValidCPF(cleanKey)) {
      return 'CPF';
    }
    // If not a valid CPF, treat as phone
    return 'PHONE';
  }
  
  if (/^\d{10}$/.test(cleanKey)) {
    return 'PHONE';
  }
  
  if (/^\d{12,13}$/.test(cleanKey)) {
    // 12-13 digits starting with 55 = phone with country code
    if (cleanKey.startsWith('55')) {
      return 'PHONE';
    }
  }
  
  if (/^\d{14}$/.test(cleanKey)) {
    return 'CNPJ';
  }
  
  if (key.includes('@')) {
    return 'EMAIL';
  }
  
  // Chave aleatória (EVP)
  return 'EVP';
}

export interface PixKeyValidationResult {
  isValid: boolean;
  type: 'CPF' | 'CNPJ' | 'PHONE' | 'EMAIL' | 'EVP';
  error?: string;
}

/**
 * Valida uma chave PIX e retorna o resultado
 */
export function validatePixKey(key: string): PixKeyValidationResult {
  if (!key || key.trim() === '') {
    return { isValid: false, type: 'EVP', error: 'Chave PIX não pode estar vazia' };
  }

  const trimmedKey = key.trim();
  const type = getPixKeyType(trimmedKey);

  switch (type) {
    case 'CPF':
      if (!isValidCPF(trimmedKey)) {
        return { isValid: false, type, error: 'CPF inválido. Verifique os dígitos.' };
      }
      break;
    case 'CNPJ':
      if (!isValidCNPJ(trimmedKey)) {
        return { isValid: false, type, error: 'CNPJ inválido. Verifique os dígitos.' };
      }
      break;
    case 'EMAIL':
      if (!isValidEmail(trimmedKey)) {
        return { isValid: false, type, error: 'Email inválido. Verifique o formato.' };
      }
      break;
    case 'PHONE':
      if (!isValidPhone(trimmedKey)) {
        return { isValid: false, type, error: 'Telefone inválido. Use formato: +5511999999999' };
      }
      break;
    case 'EVP':
      if (!isValidEVP(trimmedKey)) {
        return { isValid: false, type, error: 'Chave aleatória inválida. Deve ser um UUID válido.' };
      }
      break;
  }

  return { isValid: true, type };
}

// Formata a chave PIX conforme o tipo
function formatPixKey(key: string): string {
  const type = getPixKeyType(key);
  
  switch (type) {
    case 'PHONE':
      // Telefone deve estar no formato +5511999999999
      const cleanPhone = key.replace(/\D/g, '');
      return cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
    case 'CPF':
    case 'CNPJ':
      return key.replace(/\D/g, '');
    case 'EMAIL':
      return key.toLowerCase();
    default:
      return key;
  }
}

export interface PixPayloadOptions {
  /** Chave PIX (CPF, CNPJ, Email, Telefone ou Chave Aleatória) */
  pixKey: string;
  /** Nome do beneficiário (max 25 caracteres) */
  merchantName: string;
  /** Cidade do beneficiário (max 15 caracteres) */
  merchantCity?: string;
  /** Valor da transação (opcional para QR estático) */
  amount?: number;
  /** Identificador da transação / descrição (max 25 caracteres) */
  txId?: string;
  /** Descrição adicional */
  description?: string;
}

/**
 * Gera o payload do PIX no formato EMV/BRCode
 */
export function generatePixPayload(options: PixPayloadOptions): string {
  const {
    pixKey,
    merchantName,
    merchantCity = 'SAO PAULO',
    amount,
    txId,
    description
  } = options;

  const formattedKey = formatPixKey(pixKey);
  const sanitizedName = sanitizeString(merchantName, 25);
  const sanitizedCity = sanitizeString(merchantCity, 15);
  
  // Payload Format Indicator
  let payload = formatTLV('00', '01');
  
  // Point of Initiation Method (12 = valor pode mudar, 11 = valor fixo)
  payload += formatTLV('01', amount ? '12' : '11');
  
  // Merchant Account Information (ID 26)
  // Estrutura: GUI (ID 00) + Chave PIX (ID 01) + Descrição (ID 02, opcional)
  let merchantAccount = formatTLV('00', 'br.gov.bcb.pix');
  merchantAccount += formatTLV('01', formattedKey);
  
  if (description) {
    merchantAccount += formatTLV('02', sanitizeString(description, 25));
  }
  
  payload += formatTLV('26', merchantAccount);
  
  // Merchant Category Code (MCC)
  payload += formatTLV('52', '0000');
  
  // Transaction Currency (986 = BRL)
  payload += formatTLV('53', '986');
  
  // Transaction Amount (opcional)
  if (amount && amount > 0) {
    payload += formatTLV('54', amount.toFixed(2));
  }
  
  // Country Code
  payload += formatTLV('58', 'BR');
  
  // Merchant Name
  payload += formatTLV('59', sanitizedName);
  
  // Merchant City
  payload += formatTLV('60', sanitizedCity);
  
  // Additional Data Field Template (ID 62)
  if (txId) {
    const additionalData = formatTLV('05', sanitizeString(txId, 25));
    payload += formatTLV('62', additionalData);
  }
  
  // CRC16 (ID 63) - placeholder para calcular
  payload += '6304';
  
  // Calcula e adiciona o CRC16
  const crc = crc16ccitt(payload);
  payload = payload.slice(0, -4) + formatTLV('63', crc);
  
  return payload;
}

/**
 * Gera a URL do QR Code a partir do payload PIX
 */
export function generatePixQRCodeUrl(payload: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}&ecc=M`;
}

/**
 * Função helper que gera payload e URL do QR Code
 */
export function generatePixQRCode(options: PixPayloadOptions, size: number = 200): {
  payload: string;
  qrCodeUrl: string;
} {
  const payload = generatePixPayload(options);
  const qrCodeUrl = generatePixQRCodeUrl(payload, size);
  
  return { payload, qrCodeUrl };
}
