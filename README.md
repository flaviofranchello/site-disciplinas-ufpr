# Disciplinas de Física — UFPR 2026.2

Site estático para publicar aulas e materiais complementares de **Física III** e **Física Experimental I** no GitHub Pages.

## Atualizar os materiais

1. Coloque os PDFs nas pastas de origem das disciplinas.
2. Para classificar um PDF como complementar, coloque-o em uma subpasta cujo nome contenha `complementar`.
3. Na pasta do site, execute:

   ```bash
   python3 scripts/sincronizar_materiais.py
   ```

4. Confira a prévia local:

   ```bash
   python3 -m http.server 8000
   ```

   Depois abra `http://localhost:8000`.

5. Envie as alterações ao GitHub:

   ```bash
   git add .
   git commit -m "Atualiza materiais das disciplinas"
   git push
   ```

## Publicar no GitHub Pages

No repositório do GitHub, abra **Settings → Pages**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`.

O site não usa frameworks nem dependências externas. Todo o conteúdo necessário para publicação fica neste repositório.
