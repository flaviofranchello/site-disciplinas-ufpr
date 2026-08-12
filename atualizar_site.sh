#!/usr/bin/env bash

set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly REPOSITORIO="flaviofranchello/site-disciplinas-ufpr"
readonly URL_SITE="https://flaviofranchello.github.io/site-disciplinas-ufpr/"

cd "$SCRIPT_DIR"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    cat <<'EOF'
Uso:
  ./atualizar_site.sh
  ./atualizar_site.sh "Mensagem personalizada do commit"

Sincroniza os PDFs, cria um commit quando houver mudanças e envia a
atualização para o branch main do GitHub.
EOF
    exit 0
fi

for comando in python3 git; do
    if ! command -v "$comando" >/dev/null 2>&1; then
        echo "Erro: o comando '$comando' não está instalado." >&2
        exit 1
    fi
done

if [[ "$(git branch --show-current)" != "main" ]]; then
    echo "Erro: execute a atualização no branch main." >&2
    exit 1
fi

if ! git diff --cached --quiet; then
    echo "Erro: já existem alterações preparadas para commit:" >&2
    git diff --cached --stat >&2
    echo "Conclua ou desfaça essas alterações antes de executar novamente." >&2
    exit 1
fi

echo "[1/4] Sincronizando os PDFs..."
python3 scripts/sincronizar_materiais.py

echo "[2/4] Verificando as alterações..."
git add -A -- fisica-3 fisica-experimental-1

if git diff --cached --quiet; then
    echo "Nenhuma alteração encontrada. O site já está atualizado."
    exit 0
fi

git diff --cached --stat

mensagem="${*:-Atualiza materiais das disciplinas em $(date +%d/%m/%Y)}"

echo "[3/4] Criando o commit..."
git commit -m "$mensagem"

echo "[4/4] Enviando para o GitHub..."
if ! git push origin main; then
    echo >&2
    echo "O commit foi criado localmente, mas não pôde ser enviado." >&2
    echo "Corrija a autenticação ou a conexão e execute: git push origin main" >&2
    exit 1
fi

echo
echo "Atualização enviada com sucesso."
echo "O GitHub Pages publicará o conteúdo automaticamente em:"
echo "$URL_SITE"
echo "Execuções: https://github.com/$REPOSITORIO/actions"
