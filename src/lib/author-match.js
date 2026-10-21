// Matching articles to writer profiles.
//
// Older articles store the writer only as a name string, and the same person
// can appear with small differences ("Destiny Smart", "Destiny  Smart ",
// "destiny smart"). Comparing names exactly split one writer into two in
// Analytics and left some of their articles off their profile page.
// No Firebase imports here, so it works in server and client code alike.

export function normalizeName(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[  -​  　]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function nameSlug(value) {
  return normalizeName(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Does this byline name belong to this writer profile? */
export function nameMatchesAuthor(name, author) {
  if (!name || !author) return false;
  const n = normalizeName(name);
  if (!n) return false;
  return n === normalizeName(author.name) || (!!author.slug && nameSlug(name) === author.slug);
}

/**
 * The writer profile an article belongs to, or null.
 * A valid authorId wins; otherwise the byline name is matched loosely.
 */
export function matchArticleAuthor(post, authors = []) {
  if (!post) return null;
  if (post.authorId) {
    const byId = authors.find((a) => a.id === post.authorId);
    if (byId) return byId;
  }
  const name = post.author || post.authorName;
  return authors.find((a) => nameMatchesAuthor(name, a)) || null;
}
