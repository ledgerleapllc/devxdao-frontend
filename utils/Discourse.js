export const PER_PAGE = 20;

class Discourse {
  static offsetPostIds(allPostIds, currentPage) {
    return allPostIds.slice(
      currentPage * PER_PAGE,
      (currentPage + 1) * PER_PAGE
    );
  }

  static isLastPage(allPostIds, currentPage) {
    return (currentPage + 1) * PER_PAGE >= allPostIds.length;
  }

  static canPost(user, proposal) {
    if (user.is_member || user.is_admin || user.is_super_admin) {
      return true;
    }

    if (proposal && proposal.user_id === user.id) {
      return true;
    }

    return false;
  }
}

export default Discourse;
