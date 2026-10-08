import assert from "node:assert/strict";
import test from "node:test";
import { searchStudy } from "../src/content/study-search.ts";
const sources = [
  { title: "Recuperação híbrida", paragraphs: ["O RAG utiliza BM25 e embeddings para recuperar materiais."] },
  { title: "Fallback", paragraphs: ["O fallback apresenta trechos originais quando a LLM está indisponível."] },
];
test("search returns original attributed evidence, including accents and uppercase", () => {
  const [hit] = searchStudy(sources, "RECUPERAÇÃO e rag");
  assert.equal(hit.title, sources[0].title);
  assert.equal(hit.text, sources[0].paragraphs[0]);
});
test("unrelated questions and empty queries cannot invent an answer", () => {
  for (const query of ["", "como que para uma", "previsão meteorológica"]) assert.deepEqual(searchStudy(sources, query), []);
});
test("ranking privileges matching section titles and does not mutate source order", () => {
  const original = JSON.stringify(sources);
  assert.equal(searchStudy(sources, "fallback")[0].title, "Fallback");
  assert.equal(JSON.stringify(sources), original);
});
