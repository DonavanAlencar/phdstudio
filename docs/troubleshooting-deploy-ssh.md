# Troubleshooting: Deploy via SSH (GitHub Actions)

Quando o workflow **Deploy to Server** falha com **Connection timed out** na etapa de teste SSH, o runner do GitHub **não consegue alcançar o servidor** na porta 22. Isso é um problema de **rede/firewall**, não de chave SSH.

## O que significa "Connection timed out"

- O GitHub Actions tenta `ssh root@<SERVER_HOST>` a partir da nuvem (IPs variados).
- Se der **timeout**: nenhum pacote TCP chegou na porta 22 (firewall, rede ou servidor inacessível).
- Se der **Permission denied** ou **Host key verification**: aí sim é problema de chave SSH ou host key.

## Checklist

### 1. Servidor acessível pela internet?

- O `SERVER_HOST` no GitHub Secrets deve ser um **IP público** ou **hostname que resolva para um IP público**.
- Se o servidor estiver atrás de um roteador/NAT, a porta 22 precisa estar **encaminhada (port forwarding)** para o servidor.
- Teste na **sua máquina** (fora do servidor):
  ```bash
  ping <SERVER_HOST>
  nc -zv <SERVER_HOST> 22
  # ou: ssh -v -o ConnectTimeout=10 root@<SERVER_HOST> echo ok
  ```

### 2. Firewall no servidor

- O **SSH (porta 22)** precisa aceitar conexões de **qualquer origem** (ou pelo menos dos [IP ranges do GitHub](https://api.github.com/meta)), se quiser deploy pelo Actions.
  - **Ubuntu/Debian (ufw):**
    ```bash
    sudo ufw allow 22/tcp
    sudo ufw status
    sudo ufw enable   # se ainda não estiver ativo
    ```
  - **Firewall do provedor (AWS Security Group, GCP, etc.):** libere entrada TCP na porta 22 (origem 0.0.0.0/0 ou os IPs do GitHub).

### 3. SSH em outra porta

- Se o servidor usa SSH na **porta 2222** (ou outra), configure o secret **`SERVER_SSH_PORT`** no repositório com o valor `2222`. O workflow usa esse valor quando existir.
- No servidor, confira em qual porta o SSH está ouvindo:
  ```bash
  ss -tlnp | grep sshd
  ```

### 4. GitHub Secrets necessários

| Secret            | Obrigatório | Descrição                          |
|-------------------|------------|------------------------------------|
| `SSH_PRIVATE_KEY` | Sim        | Chave privada SSH (conteúdo do arquivo, ex.: `id_rsa`) |
| `SERVER_HOST`     | Sim        | IP ou hostname do servidor (acessível da internet)     |
| `SERVER_SSH_PORT` | Não        | Porta SSH; se não definir, usa 22                      |

### 5. Deploy sem GitHub Actions (alternativa)

Se não puder liberar SSH da internet para o GitHub:

- **No próprio servidor:** clonar o repo e rodar deploy manualmente:
  ```bash
  cd /root/phdstudio
  git pull origin main
  ./deploy/docker/scripts/deploy-remote.sh
  ```
- **Self-hosted runner:** instalar um runner do GitHub Actions na sua rede e usá-lo no job de deploy (assim o SSH é interno).

## Referências

- [GitHub IP ranges (Actions)](https://api.github.com/meta) – para liberar só IPs do GitHub no firewall, se preferir.
- [Troubleshooting 502](troubleshooting-502.md) – quando o deploy até sobe, mas o site retorna 502.
