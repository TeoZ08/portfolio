export type StudySection = { title: string; paragraphs: readonly string[] };
const words = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
const STOP_WORDS = new Set(["como", "para", "uma", "que", "qual", "com", "por", "das", "dos", "sao", "tem", "ele", "essa", "esse", "quais"]);
// Extractive search: returned text is always an original, attributed paragraph.
export function searchStudy(sections: readonly StudySection[], query: string) {
  const terms = [...new Set(words(query).filter(word => !STOP_WORDS.has(word)))];
  if (!terms.length) return [];
  return sections.flatMap(section => section.paragraphs.map(text => {
    const body = new Set(words(text)); const title = new Set(words(section.title));
    const score = terms.reduce((sum, term) => sum + (body.has(term) ? 2 : 0) + (title.has(term) ? .5 : 0), 0);
    return { title: section.title, text, score };
  })).filter(result => result.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}
