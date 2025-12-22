#!/usr/bin/env python3

"""
Script Python para criar usuário admin (alternativa ao Node.js)
Requer: pip install bcrypt
"""

import sys
import subprocess
import getpass

try:
    import bcrypt
except ImportError:
    print("❌ bcrypt não está instalado.")
    print("Instale com: pip install bcrypt")
    sys.exit(1)

def create_admin_user(email, password):
    """Cria usuário admin no banco"""
    
    # Gerar hash
    print("Gerando hash da senha...")
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=10)
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    print(f"✅ Hash gerado: {password_hash[:20]}...")
    print("")
    
    # SQL
    first_name = "Admin"
    last_name = "PHD Studio"
    
    sql = f"""INSERT INTO users (email, password_hash, first_name, last_name, role, created_at) 
              VALUES ('{email}', '{password_hash}', '{first_name}', '{last_name}', 'admin', NOW()) 
              ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', updated_at = NOW();"""
    
    # Executar no container
    print("Inserindo usuário no banco de dados...")
    cmd = ["docker", "exec", "-i", "phd-crm-db", "psql", "-U", "phd_crm_user", "-d", "phd_crm", "-c", sql]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("✅ Usuário criado/atualizado com sucesso!")
        print("")
        print(f"Email: {email}")
        print(f"Senha: {password}")
        print("")
        print("Você pode fazer login em: https://phdstudio.com.br/admin")
        return True
    else:
        print("❌ Erro ao criar usuário:")
        print(result.stderr)
        return False

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "admin@phdstudio.com.br"
    
    if len(sys.argv) > 2:
        password = sys.argv[2]
    else:
        password = getpass.getpass("Digite a senha: ")
    
    if not email or not password:
        print("Uso: python3 create-admin-user.py <email> [senha]")
        sys.exit(1)
    
    create_admin_user(email, password)

