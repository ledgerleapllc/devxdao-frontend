/* eslint-disable no-undef */
/* global require */
import Helper from "./Helper";

const axios = require("axios");

const sendRequest = (
  url,
  params = {},
  method = "POST",
  requireAuth = false,
  responseType = null
) => {
  let headers = { "Content-Type": "application/json" };
  if (requireAuth) {
    const userData = Helper.fetchUser();
    const accessToken = userData.accessTokenAPI || "";

    headers = {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  let apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "api" + url;
  if (method == "GET") {
    const urlParams = [];
    for (let key in params) {
      if (key && params[key]) {
        urlParams.push(`${key}=${params[key]}`);
      }
    }
    if (urlParams.length) {
      apiUrl += `?${urlParams.join("&")}`;
    }
  }

  return new Promise((resolve) => {
    axios({
      method,
      headers,
      data: JSON.stringify(params),
      url: apiUrl,
      responseType: responseType || "json",
    })
      .then((res) => {
        if (res.data) {
          let data = res.data;
          if (!responseType) {
            if (!data.success && !data.message) {
              data = {
                ...data,
                message: "Please try again later",
              };
            }
            resolve(data);
          } else {
            resolve(data);
          }
        } else {
          resolve({
            success: false,
            message: "Please try again later",
          });
        }
      })
      .catch((e) => {
        if (+e.response.status === 401) {
          Helper.removeUser();
          window.location.href = "/login";
        }
        resolve({
          success: false,
          message: "Please try again later",
          ...e,
        });
      });
  });
};

class API {
  // Login
  static login(email, password) {
    const params = {
      email,
      password,
    };
    return sendRequest("/login", params, "POST");
  }

  // Register
  static register(params) {
    return sendRequest("/register", params, "POST");
  }

  // Reset Password
  static resetPassword(params) {
    return sendRequest("/reset-password", params, "POST");
  }

  // Send Reset Email
  static sendResetEmail(email) {
    const params = {
      email,
    };
    return sendRequest("/send-reset-email", params, "POST");
  }

  // Resend Code
  static resendCode() {
    return sendRequest("/resend-code", {}, "POST", true);
  }

  static createTopic(params) {
    return sendRequest("/user/discourse/topics", params, "POST", true);
  }

  static updateTopic(id, params) {
    return sendRequest(`/user/discourse/topics/${id}`, params, "PUT", true);
  }

  static getTopic(id) {
    return sendRequest(`/user/discourse/topics/${id}`, {}, "GET", true);
  }

  static getTopics(page = 0) {
    return sendRequest("/user/discourse/topics", { page }, "GET", true);
  }

  static createMessage(params) {
    return sendRequest("/user/discourse/messages", params, "POST", true);
  }

  static searchDiscourseUsers(term) {
    return sendRequest("/user/discourse/users", { term }, "GET", true);
  }

  static notifications(recent = false) {
    return sendRequest(
      "/user/discourse/notifications",
      { recent },
      "GET",
      true
    );
  }

  static readNotification(id) {
    return sendRequest(
      `/user/discourse/notifications/${id}/read`,
      {},
      "PUT",
      true
    );
  }

  static getMessages(page = 0, folder = "") {
    return sendRequest(
      "/user/discourse/messages",
      { page, folder },
      "GET",
      true
    );
  }

  // Get Topic Posts
  static getPosts(id, postIds = []) {
    return sendRequest(
      `/user/discourse/topics/${id}/posts`,
      { post_ids: postIds },
      "GET",
      true
    );
  }

  // Get Topic Post
  static getPost(id) {
    return sendRequest(`/posts/${id}`, {}, "GET", true);
  }

  // Show Topic Post
  static showPost(id) {
    return sendRequest(`/user/discourse/posts/${id}`, {}, "GET", true);
  }

  // Get Post Replies
  static getPostReplies(id) {
    return sendRequest(`/user/discourse/posts/${id}/replies`, {}, "GET", true);
  }

  // Submit Post
  static submitPost(id, params = {}) {
    return sendRequest(
      `/user/discourse/topics/${id}/posts`,
      params,
      "POST",
      true
    );
  }

  // Update Post
  static updatePost(id, params = {}) {
    return sendRequest(`/user/discourse/posts/${id}`, params, "PUT", true);
  }

  // Destroy Post
  static destroyPost(id) {
    return sendRequest(`/user/discourse/posts/${id}`, {}, "DELETE", true);
  }

  // Flag Topic
  static flagTopic(id, params) {
    return sendRequest(
      `/user/discourse/topics/${id}/flag`,
      params,
      "POST",
      true
    );
  }

  // Read Topic
  static readTopic(id) {
    return sendRequest(`/user/discourse/topics/${id}/readed`, {}, "PUT", true);
  }

  // Toggle Like Post
  static toggleLikePost(id) {
    return sendRequest(
      `/user/discourse/posts/${id}/toggle-like`,
      {},
      "PUT",
      true
    );
  }

  // Up Vote Post
  static upVotePost(id) {
    return sendRequest(`/user/discourse/posts/${id}/up-vote`, {}, "PUT", true);
  }

  // Down Vote Post
  static downVotePost(id) {
    return sendRequest(
      `/user/discourse/posts/${id}/down-vote`,
      {},
      "PUT",
      true
    );
  }

  // Create Sponsor Code
  static createSponsorCode() {
    return sendRequest("/user/sponsor-code", {}, "POST", true);
  }

  // Check Sponsor Code - Associate
  static checkSponsorCode(code) {
    return sendRequest("/user/check-sponsor-code", { code }, "POST", true);
  }

  // Revoke Sponsor Code
  static revokeSponsorCode(codeId) {
    return sendRequest(`/user/sponsor-code/${codeId}`, {}, "DELETE", true);
  }

  // Get Sponsor Codes
  static getSponsorCodes(params = {}) {
    return sendRequest("/user/sponsor-codes", params, "GET", true);
  }

  // Post Help
  static postHelp(text) {
    return sendRequest("/user/help", { text }, "POST", true);
  }

  // Start Guest
  static startGuest(params) {
    return sendRequest("/start-guest", params, "POST");
  }

  // Enable 2FA Login
  static enable2FALogin() {
    return sendRequest("/shared/enable-2fa-login", {}, "POST", true);
  }

  // Disable 2FA Login
  static disable2FALogin() {
    return sendRequest("/shared/disable-2fa-login", {}, "POST", true);
  }

  // Check Login 2FA
  static checkLogin2FA(code) {
    return sendRequest("/shared/check-login-2fa", { code }, "POST", true);
  }

  // Generate 2FA
  static generate2FA(params = {}) {
    return sendRequest("/shared/generate-2fa", params, "POST", true);
  }

  // Check 2FA
  static check2FA(code) {
    return sendRequest("/shared/check-2fa", { code }, "POST", true);
  }

  // Check Proposal Id
  static checkProposalId(proposalId) {
    return sendRequest("/shared/check-proposal", { proposalId }, "POST", true);
  }

  // Send Hellosign Request
  static sendHellosignRequest(params) {
    return sendRequest("/user/hellosign-request", params, "POST", true);
  }

  // Send Hellosign Request
  static sendCheckSystemRequest(params) {
    return sendRequest("/user/associate-agreement", params, "POST", true);
  }

  // Get Myself
  static getMe() {
    return sendRequest("/me", {}, "GET", true);
  }

  // Verify Code
  static verifyCode(code) {
    const params = { code };
    return sendRequest("/verify-code", params, "POST", true);
  }

  // Complete Review Step2
  static completeStepReview2(params) {
    return sendRequest("/complete-step-review2", params, "POST", true);
  }

  // Save Shuftipro Temp - User
  static saveShuftiproTemp(params) {
    return sendRequest("/user/shuftipro-temp", params, "POST", true);
  }

  // Update Shuftipro Temp - User
  static updateShuftiproTemp(params) {
    return sendRequest("/user/shuftipro-temp", params, "PUT", true);
  }

  // Stake CC - User
  static stakeCC(proposalId, params) {
    return sendRequest(
      `/user/payment-proposal/${proposalId}/stake-cc`,
      params,
      "PUT",
      true
    );
  }

  // Stake Reputation - User
  static stakeReputation(proposalId, params) {
    return sendRequest(
      `/user/payment-proposal/${proposalId}/stake-reputation`,
      params,
      "PUT",
      true
    );
  }

  // Create Payment Intent - User
  static createPaymentIntent(proposalId, params = {}) {
    return sendRequest(
      `/user/payment-proposal/${proposalId}/payment-intent`,
      params,
      "PUT",
      true
    );
  }

  static downloadReport(params = {}) {
    return sendRequest(`/admin/export-report`, params, "GET", true, "blob");
  }

  // Create Payment Intent - User
  static getReportOnboarding(params = {}) {
    return sendRequest(`/admin/report-onboarding`, params, "GET", true);
  }

  // Create Payment Intent - User
  static getReportReputation(params = {}) {
    return sendRequest(`/admin/report-reputation`, params, "GET", true);
  }

  // Create Payment Intent - User
  static getReportTotalRep(params = {}) {
    return sendRequest(`/admin/report-total-rep`, params, "GET", true);
  }

  // Update Payment Proposal - User
  static updatePaymentProposal(proposalId, params = {}) {
    return sendRequest(
      `/user/payment-proposal/${proposalId}`,
      params,
      "PUT",
      true
    );
  }

  // Force Withdraw Proposal - Shared
  static forceWithdrawProposal(proposalId) {
    return sendRequest(
      `/shared/proposal/${proposalId}/force-withdraw`,
      {},
      "PUT",
      true
    );
  }

  // Withdraw Proposal - Shared
  static withdrawProposal(proposalId) {
    return sendRequest(
      `/shared/proposal/${proposalId}/withdraw`,
      {},
      "PUT",
      true
    );
  }

  // Update Simple Proposal - Shared
  static updateSimpleProposalShared(proposalId, params = {}) {
    return sendRequest(
      `/shared/simple-proposal/${proposalId}`,
      params,
      "PUT",
      true
    );
  }

  // Update Proposal - Shared
  static updateProposalShared(proposalId, params = {}) {
    return sendRequest(`/shared/proposal/${proposalId}`, params, "PUT", true);
  }

  // Update Payment Form - User
  static updatePaymentForm(proposalId, params = {}) {
    return sendRequest(
      `/user/proposal/${proposalId}/payment-form`,
      params,
      "PUT",
      true
    );
  }

  // Update Global Settings - Admin
  static updateGlobalSettingsByAdmin(params = {}) {
    return sendRequest(`/admin/global-settings`, params, "PUT", true);
  }

  // Force Approve KYC - User
  static forceApproveKYC() {
    return sendRequest(`/user/force-approve-kyc`, {}, "POST", true);
  }

  // Force Deny KYC - User
  static forceDenyKYC() {
    return sendRequest(`/user/force-deny-kyc`, {}, "POST", true);
  }

  // Approve Pre Register - Admin
  static approvePreRegister(recordId) {
    return sendRequest(
      `/admin/pre-register/${recordId}/approve`,
      {},
      "PUT",
      true
    );
  }

  // Register Admin - Admin
  static registerAdmin(body) {
    return sendRequest(`/register-admin`, body, "POST", true);
  }

  // Deny Pre Register - Admin
  static denyPreRegister(recordId) {
    return sendRequest(`/admin/pre-register/${recordId}/deny`, {}, "PUT", true);
  }

  // Approve KYC - Admin
  static approveKYC(userId) {
    return sendRequest(`/admin/user/${userId}/approve-kyc`, {}, "PUT", true);
  }

  // Deny KYC - Admin
  static denyKYC(userId) {
    return sendRequest(`/admin/user/${userId}/deny-kyc`, {}, "PUT", true);
  }

  // Reset KYC - Admin
  static resetKYC(userId, params) {
    return sendRequest(`/admin/user/${userId}/reset-kyc`, params, "PUT", true);
  }

  // Update Account Info - Shared
  static updateAccountInfo(params = {}) {
    return sendRequest("/shared/account-info", params, "PUT", true);
  }

  // Update Profile Info - Shared
  static updateProfileInfo(params = {}) {
    return sendRequest("/shared/profile-info", params, "PUT", true);
  }

  // Update Profile - Shared
  static updateProfile(params = {}) {
    return sendRequest("/shared/profile", params, "PUT", true);
  }

  // Change Password - Shared
  static changePassword(params = {}) {
    return sendRequest("/shared/change-password", params, "POST", true);
  }

  // Add Emailer Admin - Admin
  static addEmailerAdmin(params = {}) {
    return sendRequest("/admin/add-emailer-admin", params, "POST", true);
  }

  // Update Emailer Trigger Admin
  static updateEmailerTriggerAdmin(id, params) {
    return sendRequest(
      `/admin/emailer-trigger-admin/${id}`,
      params,
      "PUT",
      true
    );
  }

  // Update Eamiler Trigger User
  static updateEmailerTriggerUser(id, params) {
    return sendRequest(
      `/admin/emailer-trigger-user/${id}`,
      params,
      "PUT",
      true
    );
  }

  // Update Emailer Trigger Member
  static updateEmailerTriggerMember(id, params) {
    return sendRequest(
      `/admin/emailer-trigger-member/${id}`,
      params,
      "PUT",
      true
    );
  }

  // Delete Emailer Admin - Admin
  static deleteEmailerAdmin(adminId) {
    return sendRequest(`/admin/emailer-admin/${adminId}`, {}, "DELETE", true);
  }

  // Add Reputation - Admin
  static addReputation(params = {}) {
    return sendRequest("/admin/add-reputation", params, "POST", true);
  }

  // Subtract Reputation - Admin
  static subtractReputation(params = {}) {
    return sendRequest("/admin/subtract-reputation", params, "POST", true);
  }

  // Change User Type - Admin
  static changeUserType(params = {}) {
    return sendRequest("/admin/change-user-type", params, "POST", true);
  }

  // Change User Type - Admin
  static changeUserAML(id, params = {}) {
    return sendRequest(`/admin/user/${id}/kyc-info`, params, "PUT", true);
  }

  // Reset User Password - Admin
  static resetUserPassword(params = {}) {
    return sendRequest("/admin/reset-user-password", params, "POST", true);
  }

  // Submit Milestone - User
  static submitMilestone(params = {}) {
    return sendRequest("/user/milestone", params, "POST", true);
  }

  // Submit Proposal - User
  static submitProposal(params = {}) {
    return sendRequest("/user/proposal", params, "POST", true);
  }

  // Submit Simple Proposal - Voting Associate
  static submitSimpleProposal(params = {}) {
    return sendRequest("/user/simple-proposal", params, "POST", true);
  }

  // Submit Simple Proposal - Voting Associate
  static submitAdminGrantProposal(params = {}) {
    return sendRequest("/user/admin-grant-proposal", params, "POST", true);
  }

  // Submit Simple Proposal - Voting Associate
  static regeneratePDF(proposal_id) {
    return sendRequest(
      `/admin/proposal/${proposal_id}/file-url`,
      {},
      "GET",
      true
    );
  }

  // Submit Proposal Change
  static submitProposalChange(params = {}) {
    return sendRequest("/user/proposal-change", params, "POST", true);
  }

  // Submit Proposal Change Comment
  static submitProposalChangeComment(params = {}) {
    return sendRequest("/user/proposal-change-comment", params, "POST", true);
  }

  // Submit Vote - User
  static submitVote(params = {}) {
    return sendRequest("/user/vote", params, "POST", true);
  }

  // Support UP Proposal Change
  static supportUpProposalChange(proposalChangeId) {
    return sendRequest(
      `/user/proposal-change/${proposalChangeId}/support-up`,
      {},
      "PUT",
      true
    );
  }

  // Support DOWN Proposal Change
  static supportDownProposalChange(proposalChangeId) {
    return sendRequest(
      `/user/proposal-change/${proposalChangeId}/support-down`,
      {},
      "PUT",
      true
    );
  }

  // Approve Proposal Change - User
  static approveProposalChange(proposalChangeId) {
    return sendRequest(
      `/user/proposal-change/${proposalChangeId}/approve`,
      {},
      "PUT",
      true
    );
  }

  // Force Approve Proposal Change - Admin
  static forceApproveProposalChange(proposalChangeId) {
    return sendRequest(
      `/admin/proposal-change/${proposalChangeId}/force-approve`,
      {},
      "PUT",
      true
    );
  }

  // Deny Proposal Change - User
  static denyProposalChange(proposalChangeId) {
    return sendRequest(
      `/user/proposal-change/${proposalChangeId}/deny`,
      {},
      "PUT",
      true
    );
  }

  // Force Deny Proposal Change - Admin
  static forceDenyProposalChange(proposalChangeId) {
    return sendRequest(
      `/admin/proposal-change/${proposalChangeId}/force-deny`,
      {},
      "PUT",
      true
    );
  }

  // Withdraw Proposal Change - User
  static withdrawProposalChange(proposalChangeId) {
    return sendRequest(
      `/user/proposal-change/${proposalChangeId}/withdraw`,
      {},
      "PUT",
      true
    );
  }

  // Force Withdraw Proposal Change - Admin
  static forceWithdrawProposalChange(proposalChangeId) {
    return sendRequest(
      `/admin/proposal-change/${proposalChangeId}/force-withdraw`,
      {},
      "PUT",
      true
    );
  }

  // Start Formal Milestone Voting - Admin
  static startFormalMilestoneVoting(proposalId, voteId) {
    return sendRequest(
      "/admin/formal-milestone-voting",
      { proposalId, voteId },
      "POST",
      true
    );
  }

  // Start Formal Milestone Voting - Admin
  static startFormalMilestoneVotingUser(proposalId, voteId) {
    return sendRequest(
      `/user/proposal/${proposalId}/formal-milestone-voting`,
      { voteId },
      "POST",
      true
    );
  }

  // Start Formal Voting - Admin
  static startFormalVoting(proposalId, force) {
    return sendRequest(
      "/admin/formal-voting",
      { proposalId, force },
      "POST",
      true
    );
  }

  // Start Formal Voting - Admin
  static checkUserActiveGrant() {
    return sendRequest("/user/check-active-grant", {}, "POST", true);
  }

  // Start Informal Voting - Shared
  static startInformalVotingShared(proposalId) {
    return sendRequest("/shared/informal-voting", { proposalId }, "POST", true);
  }

  // Start Formal Voting - Shared
  static startFormalVotingShared(proposalId) {
    return sendRequest("/shared/formal-voting", { proposalId }, "POST", true);
  }

  // Restart Voting - Shared
  static restartVoting(voteId) {
    return sendRequest("/shared/restart-voting", { voteId }, "POST", true);
  }

  // Activate Associate to Voting Associate
  static activateParticipant(userId) {
    return sendRequest(
      `/admin/participant/${userId}/activate`,
      {},
      "PUT",
      true
    );
  }

  // Deny Associate - Admin
  static denyParticipant(userId) {
    return sendRequest(`/admin/participant/${userId}/deny`, {}, "PUT", true);
  }

  // Allow Access User - Admin
  static allowAccessUser(userId) {
    return sendRequest(`/admin/user/${userId}/allow-access`, {}, "PUT", true);
  }

  // Allow Access User - Admin
  static getMetrics() {
    return sendRequest(`/admin/metrics`, {}, "GET", true);
  }

  // Deny Access User - Admin
  static denyAccessUser(userId) {
    return sendRequest(`/admin/user/${userId}/deny-access`, {}, "PUT", true);
  }

  // Ban User - Admin
  static banUser(userId) {
    return sendRequest(`/admin/user/${userId}/ban`, {}, "PUT", true);
  }

  // Unban User - Admin
  static unbanUser(userId) {
    return sendRequest(`/admin/user/${userId}/unban`, {}, "PUT", true);
  }

  // Approve Proposal Payment - Admin
  static approveProposalPayment(proposalId) {
    return sendRequest(
      `/admin/proposal/${proposalId}/approve-payment`,
      {},
      "PUT",
      true
    );
  }

  // Deny Proposal Payment - Admin
  static denyProposalPayment(proposalId) {
    return sendRequest(
      `/admin/proposal/${proposalId}/deny-payment`,
      {},
      "PUT",
      true
    );
  }

  // Approve Proposal
  static approveProposal(proposalId) {
    return sendRequest(
      `/admin/proposal/${proposalId}/approve`,
      {},
      "PUT",
      true
    );
  }

  // Deny Proposal
  static denyProposal(proposalId, reason) {
    return sendRequest(
      `/admin/proposal/${proposalId}/deny`,
      { reason },
      "PUT",
      true
    );
  }

  // Get Global Settings - Shared
  static getGlobalSettings() {
    return sendRequest(`/shared/global-settings`, {}, "GET", true);
  }

  // Get Global Settings - Shared - Public
  static getPublicGlobalSettings() {
    return sendRequest(`/shared/public/global-settings`, {}, "GET", true);
  }

  // Get Proposal Changes - Shared
  static getProposalChanges(proposalId) {
    return sendRequest(
      `/shared/proposal/${proposalId}/changes`,
      {},
      "GET",
      true
    );
  }

  // Get Proposal Changes - Shared
  static getPublicProposalChanges(proposalId) {
    return sendRequest(
      `/shared/public/proposals/${proposalId}/changes`,
      {},
      "GET",
      true
    );
  }

  // GET Proposal Change Comments - Shared
  static getProposalChangeComments(proposalId, proposalChangeId) {
    return sendRequest(
      `/shared/proposal/${proposalId}/change/${proposalChangeId}/comments`,
      {},
      "GET",
      true
    );
  }

  // Get Reputation Track - User
  static getReputationTrack(params = {}) {
    return sendRequest("/user/reputation-track", params, "GET", true);
  }

  // Get Active Proposals - User
  static getActiveProposals(params = {}) {
    return sendRequest("/user/active-proposals", params, "GET", true);
  }

  // Get Active Proposals - User
  static getNotSubmitMilestones(proposalId) {
    return sendRequest(
      `/user/proposal/${proposalId}/milestone-not-submit`,
      {},
      "GET",
      true
    );
  }

  // Get Emailer Data - Admin
  static getEmailerData() {
    return sendRequest("/admin/emailer-data", {}, "GET", true);
  }

  // Get Move-to-Formal Votes - Admin
  static getMoveToFormalVotes(params = {}) {
    return sendRequest("/admin/move-to-formal-votes", params, "GET", true);
  }

  // Get Completed Votes - Shared
  static getCompletedVotes(params = {}) {
    return sendRequest("/shared/completed-votes", params, "GET", true);
  }

  // Get Active Informal Votes - Shared
  static getActiveInformalVotes(params = {}) {
    return sendRequest("/shared/active-informal-votes", params, "GET", true);
  }

  // Get Active Formal Votes - Shared
  static getActiveFormalVotes(params = {}) {
    return sendRequest("/shared/active-formal-votes", params, "GET", true);
  }

  // Get Active Discussions - Shared
  static getActiveDiscussions(params = {}) {
    return sendRequest("/shared/active-discussions", params, "GET", true);
  }

  // Get Completed Discussions - Shared
  static getCompletedDiscussions(params = {}) {
    return sendRequest("/shared/completed-discussions", params, "GET", true);
  }

  // Get My Payment Waiting Proposals By User
  static getMyPaymentProposals() {
    return sendRequest("/user/my-payment-proposals", {}, "GET", true);
  }

  // Get Single Proposal Change - Shared
  static getProposalChangeById(proposalId, proposalChangeId) {
    return sendRequest(
      `/shared/proposal/${proposalId}/change/${proposalChangeId}`,
      {},
      "GET",
      true
    );
  }

  // Get Grants - Shared
  static getGrantsShared(params = {}) {
    return sendRequest("/shared/grants", params, "GET", true);
  }

  // Get Active Proposals - Shared
  static getActiveProposalsShared(params = {}) {
    return sendRequest("/shared/active-proposals", params, "GET", true);
  }

  // Get All Proposals - Shared
  static getAllProposalsShared(params = {}) {
    return sendRequest("/shared/all-proposals", params, "GET", true);
  }

  // Get All Proposals - Shared - Public
  static getAllPublicProposalsShared(params = {}) {
    return sendRequest("/shared/all-proposals-2", params, "GET", true);
  }

  // Get All Proposals - Shared - Public
  static getAllPublicMilestonesShared(params = {}) {
    return sendRequest("/shared/public/all-milestones", params, "GET", true);
  }

  // Get Completed Proposals - Shared
  static getCompletedProposalsShared(params = {}) {
    return sendRequest("/shared/completed-proposals", params, "GET", true);
  }

  // Get Reputation By User - Admin
  static getReputationByUser(userId, params = {}) {
    return sendRequest(`/admin/user/${userId}/reputation`, params, "GET", true);
  }

  // Get All Proposals By User - Admin
  static getProposalsByUser(userId, params = {}) {
    return sendRequest(`/admin/user/${userId}/proposals`, params, "GET", true);
  }

  // Get All Votes By User - Admin
  static getVotesByUser(userId, params = {}) {
    return sendRequest(`/admin/user/${userId}/votes`, params, "GET", true);
  }

  // Get Pending Proposals - Shared
  static getPendingProposals(params = {}) {
    return sendRequest("/shared/pending-proposals", params, "GET", true);
  }

  // Get Onboardings - User
  static getOnboardings(params = {}) {
    return sendRequest("/user/onboardings", params, "GET", true);
  }

  // Get Pending Voting Associate Onboardings - Admin
  static getPendingMemberOnboardings(params = {}) {
    return sendRequest(
      "/admin/pending-member-onboardings",
      params,
      "GET",
      true
    );
  }

  // Get Pending Grant Onboardings - Admin
  static getPendingGrantOnboardings(params = {}) {
    return sendRequest("/admin/pending-grant-onboardings", params, "GET", true);
  }

  // Get Pending Users By Admin
  static getPendingUsersByAdmin(params = {}) {
    return sendRequest("/admin/pending-users", params, "GET", true);
  }

  // Get Pre Register Users By Admin
  static getPreRegisterUsersByAdmin(params = {}) {
    return sendRequest("/admin/pre-register-users", params, "GET", true);
  }

  // Get Pre Register User By Hash
  static getPreRegisterUserByHash(hash) {
    return sendRequest("/pre-register-user", { hash }, "GET");
  }

  // Get Users By Admin
  static getUsersByAdmin(params = {}) {
    return sendRequest("/admin/users", params, "GET", true);
  }

  // Get Single User - Admin
  static getSingleUserByAdmin(userId) {
    return sendRequest(`/admin/user/${userId}`, {}, "GET", true);
  }

  // Get Single User - Shared
  static dismissNewMemberAlert() {
    return sendRequest(`/user/press-dismiss`, {}, "POST", true);
  }

  // POST dismiss first completed proposal - Shared
  static dismissFirstCompletedGrantAlert() {
    return sendRequest(
      `/user/check-first-completed-proposal`,
      {},
      "POST",
      true
    );
  }

  // Get Single Proposal - Shared
  static getSingleProposal(proposalId) {
    return sendRequest(`/shared/proposal/${proposalId}`, {}, "GET", true);
  }

  // Get VA not Vote - Admin
  static getVAsNotVote(voteId) {
    return sendRequest(
      `/admin/vote/${voteId}/user-not-vote?limit=999`,
      {},
      "GET",
      true
    );
  }

  // Get Single Proposal - Shared
  static getPublicProposal(proposalId) {
    return sendRequest(
      `/shared/all-proposals-2/${proposalId}`,
      {},
      "GET",
      true
    );
  }

  // Get Single Proposal for Edit - Shared
  static getSingleProposalEdit(proposalId) {
    return sendRequest(`/shared/proposal/${proposalId}/edit`, {}, "GET", true);
  }

  // Activate Grant - Admin
  static activateGrant(grantId, formData) {
    const userData = Helper.fetchUser();
    const accessToken = userData.accessTokenAPI || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    return new Promise((resolve) => {
      axios
        .post(
          process.env.NEXT_PUBLIC_BACKEND_URL +
            `api/admin/grant/${grantId}/activate`,
          formData,
          {
            headers,
          }
        )
        .then((res) => {
          if (res.data) {
            let data = res.data;

            if (!data.success && !data.message) {
              data = {
                ...data,
                message: "Please try again later",
              };
            }
            resolve(data);
          } else {
            resolve({
              success: false,
              message: "Please try again later",
            });
          }
        })
        .catch(() => {
          resolve({
            success: false,
            message: "Please try again later",
          });
        });
    });
  }

  static beginGrant(grantId) {
    const userData = Helper.fetchUser();
    const accessToken = userData.accessTokenAPI || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    return new Promise((resolve) => {
      axios
        .post(
          process.env.NEXT_PUBLIC_BACKEND_URL +
            `api/admin/grant/${grantId}/begin`,
          {},
          {
            headers,
          }
        )
        .then((res) => {
          if (res.data) {
            let data = res.data;

            if (!data.success && !data.message) {
              data = {
                ...data,
                message: "Please try again later",
              };
            }
            resolve(data);
          } else {
            resolve({
              success: false,
              message: "Please try again later",
            });
          }
        })
        .catch(() => {
          resolve({
            success: false,
            message: "Please try again later",
          });
        });
    });
  }

  // Remind HellosignGrant
  static remindHellosignGrant(grantId) {
    return sendRequest(`/admin/grant/${grantId}/remind`, {}, "POST", true);
  }

  // Cancel HellosignGrant
  static resendHellosignGrant(grantId) {
    return sendRequest(`/admin/grant/${grantId}/resend`, {}, "POST", true);
  }

  // Activate Grant - Admin
  static viewSignedGrant(grantId) {
    return sendRequest(`/admin/grant/${grantId}/file-url`, {}, "GET", true);
  }

  // Milestone Review - Admin
  static getReviewMilestones(params = {}) {
    return sendRequest(`/admin/milestone-reviews`, params, "GET", true);
  }

  // Milestone Review - Admin
  static getVADirectory(params = {}) {
    return sendRequest(`/user/list-va`, params, "GET", true);
  }

  // getActiveSurveys - Admin
  static getSurveys(params = {}) {
    return sendRequest(`/admin/survey`, params, "GET", true);
  }

  // getActiveSurveys - Admin
  static getUserSurveys(params = {}) {
    return sendRequest(`/user/survey`, params, "GET", true);
  }

  // getActiveSurveys - Admin
  static getWinners(params = {}) {
    return sendRequest(`/admin/survey/win`, params, "GET", true);
  }

  // getActiveSurveys - Admin
  static approveDownVote(params = {}) {
    return sendRequest(`/admin/survey/approve-downvote`, params, "POST", true);
  }

  // getActiveSurveys - Admin
  static getLosers(params = {}) {
    return sendRequest(`/admin/survey/downvote`, params, "GET", true);
  }

  // getSurveyVotes - Admin
  static getSurveyVotes(id, params) {
    return sendRequest(`/admin/survey/${id}/discussions`, params, "GET", true);
  }

  // getSurveyVotes - Admin
  static getRFPSurveyVotes(id, params) {
    return sendRequest(`/admin/survey-rfp/${id}/result`, params, "GET", true);
  }

  // getSurveyDownvotes - Admin
  static getSurveyDownvotes(id, params) {
    return sendRequest(
      `/admin/survey/${id}/downvote/discussions`,
      params,
      "GET",
      true
    );
  }

  // getSurveyEmailVoter - Admin
  static getSurveyEmailVoter(id, params) {
    return sendRequest(`/admin/survey/${id}/vote`, params, "GET", true);
  }

  // getSurveyVoters - Admin
  static getSurveyVoters(id, params) {
    return sendRequest(`/admin/survey/${id}/user-vote`, params, "GET", true);
  }

  // getSurveyVoters - Admin
  static getRFPSurveyVoters(id, params) {
    return sendRequest(
      `/admin/survey-rfp/${id}/user-vote`,
      params,
      "GET",
      true
    );
  }

  // getVoterResponse - Admin
  static getVoterResponse(id, userId, params) {
    return sendRequest(
      `/admin/survey/${id}/user-vote/${userId}`,
      params,
      "GET",
      true
    );
  }

  static getVoterBidResponse(id, userId, params) {
    return sendRequest(
      `/admin/survey-rfp/${id}/user-vote/${userId}`,
      params,
      "GET",
      true
    );
  }

  // getUserNotVoteSurvey - Admin
  static getUserNotVoteSurvey(id, params) {
    return sendRequest(
      `/admin/survey/${id}/user-not-submit`,
      params,
      "GET",
      true
    );
  }

  // getUserNotVoteSurvey - Admin
  static getUserNotVoteRFPSurvey(id, params) {
    return sendRequest(
      `/admin/survey-rfp/${id}/user-not-submit`,
      params,
      "GET",
      true
    );
  }

  static getSurveyDetail(id) {
    return sendRequest(`/admin/survey/${id}`, {}, "GET", true);
  }

  // GetSurveyDetail - Admin
  static getUserSurveyDetail(id) {
    return sendRequest(`/user/survey/${id}`, {}, "GET", true);
  }

  // sendReminderForSurvey - Admin
  static sendReminderForSurvey(id) {
    return sendRequest(`/admin/survey/${id}/send-reminder`, {}, "POST", true);
  }

  // sendReminderForSurvey - Admin
  static sendReminderForRFPSurvey(id) {
    return sendRequest(
      `/admin/survey-rfp/${id}/send-reminder`,
      {},
      "POST",
      true
    );
  }

  // cancelSurvey - Admin
  static cancelSurvey(id) {
    return sendRequest(`/admin/survey/${id}/cancel`, {}, "POST", true);
  }

  // Milestone Logs - Admin
  static getMilestoneLogs(milestoneId, params = {}) {
    return sendRequest(
      `/admin/milestone/${milestoneId}/log`,
      params,
      "GET",
      true
    );
  }

  // Milestone Review - Admin
  static getAllMilestones(params = {}) {
    return sendRequest(`/admin/milestone-all`, params, "GET", true);
  }

  // Get Teams - Admin
  static getAdminTeams(params = {}) {
    return sendRequest(`/admin/teams`, params, "GET", true);
  }

  // Get Teams - Admin
  static getDosFee(params = {}) {
    return sendRequest(`/admin/dos-fee`, params, "GET", true);
  }

  // Milestone Review - Admin
  static getAllOPMilestones(params = {}) {
    return sendRequest(`/admin/milestone-user`, params, "GET", true);
  }

  static getShuftiStatus(params = {}) {
    return sendRequest(`/user/shuftipro-status`, params, "GET", true);
  }

  // Milestone Review - Admin
  static checkMasterPassword(params = {}) {
    return sendRequest(`/admin/verify/master-password`, params, "POST", true);
  }

  // Change Admin Permission - Admin
  static changeAdminPermission({ id, permissions }) {
    return sendRequest(
      `/admin/teams/${id}/change-permissions`,
      permissions,
      "PUT",
      true
    );
  }

  // resetPasswordAdmin - Admin
  static resetPasswordAdmin({ id }) {
    return sendRequest(`/admin/teams/${id}/reset-password`, {}, "POST", true);
  }

  // resendInvitedEmail - Admin
  static resendInvitedEmail({ id }) {
    return sendRequest(`/admin/teams/${id}/re-invite`, {}, "POST", true);
  }

  // Revoke Admin - Admin
  static revokeAdmin({ id }) {
    return sendRequest(`/admin/teams/${id}/revoke`, {}, "POST", true);
  }

  // Undo Revoke Admin - Admin
  static undoRevokeAdmin({ id }) {
    return sendRequest(`/admin/teams/${id}/undo-revoke`, {}, "POST", true);
  }

  // getProposalDrafts - User
  static getProposalDrafts(params = {}) {
    return sendRequest(`/user/proposal-draft`, params, "GET", true);
  }

  // Save proposal draft - User
  static createProposalDraft(body = {}) {
    return sendRequest(`/user/proposal-draft`, body, "POST", true);
  }

  // Save proposal draft - User
  static getProposalDraftDetail(id) {
    return sendRequest(`/user/proposal-draft/${id}`, {}, "GET", true);
  }

  // Delete proposal draft - User
  static deleteProposalDraft(id) {
    return sendRequest(`/user/proposal-draft/${id}`, {}, "DELETE", true);
  }

  // Milestone Review - Admin
  static downloadCSVMilestones(params = {}) {
    return sendRequest(
      `/admin/milestone/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadCSVAccounting(params = {}) {
    return sendRequest(
      `/admin/dos-fee/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Rep - User
  static downloadCSVMyRep(params = {}) {
    return sendRequest(
      `/user/reputation-track/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Rep - User
  static postRepDailyCsv(params = {}) {
    return sendRequest(`/user/reputation-daily-csv`, params, "POST", true);
  }

  // send KYC
  static sendKycKangaroo(params = {}) {
    return sendRequest(`/user/send-kyc-kangaroo`, params, "POST", true);
  }

  // send KYC
  static dismissStartKyc(params = {}) {
    return sendRequest(`/user/check-send-kyc`, params, "POST", true);
  }

  // resend KYC - User
  static resendKycKangaroo(params = {}) {
    return sendRequest(`/shared/resend-kyc-kangaroo`, params, "POST", true);
  }

  // resend KYC - User
  static sendKycKangarooByAdmin(params = {}) {
    return sendRequest(`/admin/send-kyc-kangaroo`, params, "POST", true);
  }

  // Rep - User
  static getTimelineProposal(proposalId, params = {}) {
    return sendRequest(
      `/shared/proposal/${proposalId}/trackings`,
      params,
      "GET",
      true
    );
  }

  // Rep - User
  static resendComplianceReview(params = {}) {
    return sendRequest(`/admin/resend-compliance-review`, params, "POST", true);
  }

  static saveUnvotedInformal(params = {}) {
    return sendRequest(`/user/show-unvoted-informal`, params, "PUT", true);
  }

  static saveUnvotedFormal(params = {}) {
    return sendRequest(`/user/show-unvoted-formal`, params, "PUT", true);
  }

  // Rep - User
  static approveComplianceReview(params = {}) {
    return sendRequest(`/compliance-review/approve`, params, "POST", true);
  }

  // Rep - User
  static denyComplianceReview(params = {}) {
    return sendRequest(`/compliance-review/deny`, params, "POST", true);
  }

  // Rep - Admin
  static downloadCSVUserRep(userId, params = {}) {
    return sendRequest(
      `/admin/user/${userId}/reputation/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadSurveyWinner(params = {}) {
    return sendRequest(
      `/admin/survey-win/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadVoteResultCSV(proposalId, voteId, params = {}) {
    return sendRequest(
      `/shared/proposal/${proposalId}/vote/${voteId}/vote-result/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadVoteResultPDF(proposalId, voteId, params = {}) {
    return sendRequest(
      `/shared/proposal/${proposalId}/vote/${voteId}/vote-result/export-pdf`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadSurveyLoser(params = {}) {
    return sendRequest(
      `/admin/survey-downvote/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadCurrentVoteByProposal(id, params = {}) {
    return sendRequest(
      `/survey-vote/${id}/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadCurrentBidVote(id, params = {}) {
    return sendRequest(
      `/admin/survey-rfp-vote/${id}/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Accounting - Admin
  static downloadCurrentDownvoteByProposal(id, params = {}) {
    return sendRequest(
      `/survey-downvote/${id}/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Milestone Review - Admin
  static downloadCSVAllProposals(params = {}) {
    return sendRequest(
      `/admin/proposal/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Milestone Review - Admin
  static downloadCSVActiveGrants(params = {}) {
    return sendRequest(
      `/admin/active-grant/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Milestone Review - Admin
  static downloadMentorHours(params = {}) {
    return sendRequest(
      `/admin/proposal/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Milestone Review - Admin
  static downloadCSVUsers(params = {}) {
    return sendRequest(`/admin/user/export-csv`, params, "GET", true, "blob");
  }

  // Milestone Review - Admin
  static checkMentor(params = {}) {
    return sendRequest(`/user/check-mentor`, params, "POST", true);
  }

  // Milestone Review - Admin
  static listProposalMentors(userId, params = {}) {
    return sendRequest(
      `/admin/user/${userId}/proposal-mentor`,
      params,
      "GET",
      true
    );
  }

  // Milestone Review - Admin
  static exportProposalMentor(userId, params = {}) {
    return sendRequest(
      `/admin/user/${userId}/proposal-mentor/export-csv`,
      params,
      "GET",
      true,
      "blob"
    );
  }

  // Milestone Review - Admin
  static getAllProposalMilestones(params = {}) {
    return sendRequest(`/admin/milestone-proposal`, params, "GET", true);
  }

  // Milestone Review D - Admin
  static getReviewMilestoneDetail(milestoneId) {
    return sendRequest(
      `/admin/milestone-reviews/${milestoneId}`,
      {},
      "GET",
      true
    );
  }

  // Milestone Detail - Admin
  static getMilestoneDetail(milestoneId) {
    return sendRequest(`/admin/milestone/${milestoneId}`, {}, "GET", true);
  }

  // Milestone Detail - Admin
  static getPublicMilestoneDetail(milestoneId) {
    return sendRequest(
      `/shared/public/all-milestones/${milestoneId}`,
      {},
      "GET",
      true
    );
  }

  // Approve Review Milestone - Admin
  static approveReviewMilestone(milestoneId, body) {
    const formData = new FormData();

    formData.append("notes", body.notes);
    if (body.file) {
      formData.append("file", body.file);
    }

    const userData = Helper.fetchUser();
    const accessToken = userData.accessTokenAPI || "";

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    return new Promise((resolve) => {
      let apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "api";
      axios
        .post(
          `${apiUrl}/admin/milestone-reviews/${milestoneId}/approve`,
          formData,
          {
            headers,
          }
        )
        .then((res) => {
          if (res.data) {
            let data = res.data;

            if (!data.success && !data.message) {
              data = {
                ...data,
                message: "Please try again later",
              };
            }
            resolve(data);
          } else {
            resolve({
              success: false,
              message: "Please try again later",
            });
          }
        })
        .catch(() => {
          resolve({
            success: false,
            message: "Please try again later",
          });
        });
    });
  }

  // Toggle Paid Milestone - Admin
  static togglePaidMilestone(milestoneId, paid) {
    return sendRequest(
      `/admin/milestone/${milestoneId}/paid`,
      { paid },
      "PUT",
      true
    );
  }

  // Deny Review Milestone - Admin
  static denyReviewMilestone({ milestoneId, message }) {
    return sendRequest(
      `/admin/milestone-reviews/${milestoneId}/deny`,
      { message },
      "POST",
      true
    );
  }

  // Deny Review Milestone - Admin
  static inviteAdmin({ email }) {
    return sendRequest(`/admin/teams/invite`, { email }, "POST", true);
  }

  // Deny Review Milestone - Admin
  static updateShufti({ userId, ref, shufti_pass }) {
    return sendRequest(
      `/admin/user/${userId}/shuftipro-id`,
      { reference_id: ref, shufti_pass },
      "POST",
      true
    );
  }

  // launchSurvey - Admin
  static launchSurvey(body) {
    return sendRequest(`/admin/survey`, body, "POST", true);
  }

  // getCurrentSurvey - Admin
  static getCurrentSurvey() {
    return sendRequest(`/user/current-survey`, {}, "GET", true);
  }

  // submitSurvey - User
  static submitSurvey(id, body) {
    return sendRequest(`/user/survey/${id}`, body, "POST", true);
  }

  // submitRFPSurvey - User
  static submitRFPSurvey(id, body) {
    return sendRequest(`/user/survey-rfp/${id}`, body, "POST", true);
  }

  // submitSurvey - User
  static submitDownvoteSurvey(id, body) {
    return sendRequest(`/user/survey/down-vote/${id}`, body, "POST", true);
  }

  // Update Proposal - Shared
  static updateAdminGrantProposalShared(proposalId, params = {}) {
    return sendRequest(
      `/shared/admin-grant-proposal/${proposalId}`,
      params,
      "PUT",
      true
    );
  }

  // Upload File
  static uploadFile(formData) {
    const userData = Helper.fetchUser();
    const accessToken = userData.accessTokenAPI || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    return new Promise((resolve) => {
      axios
        .post(
          process.env.NEXT_PUBLIC_BACKEND_URL + "api/shared/proposal/upload",
          formData,
          {
            headers,
          }
        )
        .then((res) => {
          if (res.data) {
            let data = res.data;

            if (!data.success && !data.message) {
              data = {
                ...data,
                message: "Please try again later",
              };
            }
            resolve(data);
          } else {
            resolve({
              success: false,
              message: "Please try again later",
            });
          }
        })
        .catch(() => {
          resolve({
            success: false,
            message: "Please try again later",
          });
        });
    });
  }

  // Upload File
  static uploadDraftFile(formData) {
    const userData = Helper.fetchUser();
    const accessToken = userData.accessTokenAPI || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    return new Promise((resolve) => {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/user/proposal-draft/upload`,
          formData,
          {
            headers,
          }
        )
        .then((res) => {
          if (res.data) {
            let data = res.data;

            if (!data.success && !data.message) {
              data = {
                ...data,
                message: "Please try again later",
              };
            }
            resolve(data);
          } else {
            resolve({
              success: false,
              message: "Please try again later",
            });
          }
        })
        .catch(() => {
          resolve({
            success: false,
            message: "Please try again later",
          });
        });
    });
  }

  // Get User's Proposal Request Payment - User
  static getUserProposalRequestPayment() {
    return sendRequest(`/user/proposal/request-payment`, {}, "GET", true);
  }

  static getRFPSurveys(params = {}) {
    return sendRequest(`/admin/survey-rfp`, params, "GET", true);
  }

  // Submit Payment Proposal
  static submitPaymentProposal(params = {}) {
    return sendRequest("/user/advance-payment-proposal", params, "POST", true);
  }
}

export default API;
