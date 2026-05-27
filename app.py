from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import date

app = Flask(__name__)
CORS(app)

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Hl180903!#",
        database="inventario_escolar"
    )

# ─── USUARIO ───────────────────────────────

@app.route('/login', methods=['POST'])
def login():
    dados = request.json
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuario WHERE email = %s AND senha = %s",
                   (dados['email'], dados['senha']))
    usuario = cursor.fetchone()
    conn.close()
    if usuario:
        return jsonify({"sucesso": True, "usuario": usuario})
    return jsonify({"sucesso": False, "mensagem": "Email ou senha inválidos"}), 401

@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    dados = request.json
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO usuario (nome, email, senha, cpf, telefone, data_nascimento)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (dados['nome'], dados['email'], dados['senha'],
              dados['cpf'], dados['telefone'], dados['data_nascimento']))
        conn.commit()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Usuário cadastrado!"})
    except mysql.connector.IntegrityError:
        return jsonify({"sucesso": False, "mensagem": "Email ou CPF já cadastrado!"}), 400
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": "Erro ao cadastrar: " + str(e)}), 500

# ─── EQUIPAMENTO ───────────────────────────

@app.route('/equipamentos', methods=['GET'])
def listar_equipamentos():
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM equipamento")
    equipamentos = cursor.fetchall()
    conn.close()
    return jsonify(equipamentos)

@app.route('/equipamentos', methods=['POST'])
def adicionar_equipamento():
    dados = request.json
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO equipamento (nome, descricao, estado_conservacao, localizacao, numero_patrimonio, categoria, status, data_aquisicao)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (dados['nome'], dados['descricao'], dados['estado_conservacao'],
              dados['localizacao'], dados['numero_patrimonio'], dados['categoria'],
              dados['status'], dados['data_aquisicao']))
        conn.commit()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Equipamento adicionado!"})
    except mysql.connector.IntegrityError:
        return jsonify({"sucesso": False, "mensagem": "Nº de patrimônio já cadastrado!"}), 400
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": "Erro: " + str(e)}), 500

@app.route('/equipamentos/<int:id>', methods=['PUT'])
def atualizar_equipamento(id):
    dados = request.json
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE equipamento SET nome=%s, descricao=%s, estado_conservacao=%s,
        localizacao=%s, categoria=%s, status=%s WHERE id_equipamento=%s
    """, (dados['nome'], dados['descricao'], dados['estado_conservacao'],
          dados['localizacao'], dados['categoria'], dados['status'], id))
    conn.commit()
    conn.close()
    return jsonify({"sucesso": True, "mensagem": "Equipamento atualizado!"})

@app.route('/equipamentos/<int:id>', methods=['DELETE'])
def deletar_equipamento(id):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM equipamento WHERE id_equipamento = %s", (id,))
    conn.commit()
    conn.close()
    return jsonify({"sucesso": True, "mensagem": "Equipamento removido!"})

if __name__ == '__main__':
    app.run(debug=True)
