# Behavioral Wiki

Vieses e heurísticas explicados para produteiros e curiosos: o que é cada viés, como ele ajuda a aumentar, reduzir ou mudar um comportamento, um exemplo de tela e como testar no seu produto.

Site estático com uma página por rota (início, guia, cada viés em `/vieses/<id>/`, insights e cada post em `/insights/<id>/`), pré-renderizado para os buscadores e publicado na Vercel.

## SEO

- `sitemap.xml` é gerado em todo deploy da Vercel por `tools/build-sitemap.mjs`, que lê todas as páginas publicadas (exceto as `noindex`) e usa o `canonical` e a data `og:updated_time` de cada uma. Página nova entra no sitemap sozinha.
- `tools/lastmod.json` guarda, por página, a data de publicação e a da última mudança real de conteúdo. A data só muda quando o texto da página muda, então o `lastmod` do sitemap é confiável para o Google.
- Cada página tem dados estruturados (JSON-LD em `@graph`): `Organization` e `WebSite` em todas; `Article` + `DefinedTerm` nos vieses; `BlogPosting` nos insights; `CollectionPage` com `ItemList`/`DefinedTermSet` no guia e `Blog` na lista de insights; `BreadcrumbList` em todas as internas.
