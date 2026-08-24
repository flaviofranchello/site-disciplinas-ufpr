# Disciplinas de Física — UFPR 2026.2

Site estático para publicar aulas e listas de **Física III**, além de aulas e materiais complementares de **Física Experimental I**, no GitHub Pages.

## Atualizar os materiais

1. Coloque os PDFs nas pastas de origem das disciplinas.
2. A classificação é feita pelo nome do arquivo ou da subpasta:
   - em Física III, nomes contendo `lista` aparecem em **Listas**;
   - em Física Experimental I, nomes contendo `complementar`, `guia` ou `roteiro` aparecem em **Materiais Complementares**;
   - os demais PDFs aparecem em **Aulas**.
3. Execute o atualizador completo:

   ```bash
   cd "/home/flavio/site-disciplinas-ufpr"
   ./atualizar_site.sh
   ```

   Opcionalmente, informe uma mensagem personalizada para o commit:

   ```bash
   ./atualizar_site.sh "Adiciona as aulas 05 e 06"
   ```

   Esse comando sincroniza os arquivos, cria o commit e envia a atualização
   para o GitHub. Se não houver mudanças, nenhum commit será criado.

   A sincronização funciona como um espelho: ao remover um PDF da pasta de
   origem, a cópia correspondente também será removida do site na próxima
   execução.

4. Para conferir uma prévia local antes de atualizar, execute:

   ```bash
   python3 -m http.server 8000
   ```

   Depois abra `http://localhost:8000`.

## Publicar no GitHub Pages

No repositório do GitHub, abra **Settings → Pages**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`.

O site não usa frameworks nem dependências externas. Todo o conteúdo necessário para publicação fica neste repositório.
