CREATE DATABASE inventario_escolar;
USE inventario_escolar;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATE DEFAULT (CURRENT_DATE),
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    ultimo_login DATE,
    data_nascimento DATE
);

CREATE TABLE equipamento (
    id_equipamento INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    estado_conservacao VARCHAR(50),
    localizacao VARCHAR(100),
    numero_patrimonio VARCHAR(50) UNIQUE,
    categoria VARCHAR(50),
    status VARCHAR(50) DEFAULT 'disponivel',
    data_aquisicao DATE
);