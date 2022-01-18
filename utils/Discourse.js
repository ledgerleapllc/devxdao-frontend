export const PER_PAGE = 20;

export function offsetPostIds(allPostIds, currentPage) {
  return allPostIds.slice(currentPage * PER_PAGE, (currentPage + 1) * PER_PAGE);
}

export function isLastPage(allPostIds, currentPage) {
  return (currentPage + 1) * PER_PAGE >= allPostIds.length;
}
