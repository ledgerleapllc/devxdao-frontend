import API from "./API";
import { saveUser, setGlobalSettings, showAlert } from "../redux/actions";
import Helper from "./Helper";

// Login
export function login(email, password, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.login(email, password).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Register
export function register(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.register(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Reset Password
export function resetPassword(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.resetPassword(params).then((res) => {
      if (res.success)
        dispatch(
          showAlert("You've successfully reset your password.", "success")
        );
      else dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Send Reset Email
export function sendResetEmail(email, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.sendResetEmail(email).then((res) => {
      if (res.success)
        dispatch(
          showAlert("We have emailed your password reset link", "success")
        );
      else dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Create Sponsor Code
export function createSponsorCode(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.createSponsorCode().then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check Sponsor Code
export function checkSponsorCode(code, start, completion) {
  return () => {
    if (start) start();
    API.checkSponsorCode(code).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Revoke Sponsor Code
export function revokeSponsorCode(codeId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.revokeSponsorCode(codeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check Login 2FA
export function checkLogin2FA(code, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.checkLogin2FA(code).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Enable 2FA Login
export function enable2FALogin(start, completion) {
  return () => {
    if (start) start();
    API.enable2FALogin().then((res) => {
      if (completion) completion(res);
    });
  };
}

// Disable 2FA Login
export function disable2FALogin(start, completion) {
  return () => {
    if (start) start();
    API.disable2FALogin().then((res) => {
      if (completion) completion(res);
    });
  };
}

// Generate 2FA
export function generate2FA(email, start, completion) {
  return (dispatch) => {
    if (start) start();
    let params = {};
    if (email) params = { email };
    API.generate2FA(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check 2FA
export function check2FA(code, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.check2FA(code).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check Proposal Id
export function checkProposalId(proposalId, start, completion) {
  return () => {
    if (start) start();
    API.checkProposalId(proposalId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Resend Code
export function resendCode(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.resendCode().then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Post Help
export function postHelp(text, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.postHelp(text).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Start Guest
export function startGuest(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.startGuest(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Send Hellosign Request
export function sendHellosignRequest(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.sendHellosignRequest(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Send CheckSystem Request
export function sendCheckSystemRequest(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.sendCheckSystemRequest(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get Single Proposal Change - User
export function getProposalChangeById(
  proposalId,
  proposalChangeId,
  start,
  completion
) {
  return () => {
    if (start) start();
    API.getProposalChangeById(proposalId, proposalChangeId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Global Settings - Shared
export function getGlobalSettings(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getGlobalSettings().then((res) => {
      const settings = res.settings || {};
      dispatch(setGlobalSettings(settings));
      if (completion) completion();
    });
  };
}

// Get Global Settings - Shared - Public
export function getPublicGlobalSettings(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getPublicGlobalSettings().then((res) => {
      const settings = res.settings || {};
      dispatch(setGlobalSettings(settings));
      if (completion) completion();
    });
  };
}

// Get Proposal Changes - Shared
export function getProposalChanges(proposalId, start, completion) {
  return () => {
    if (start) start();
    API.getProposalChanges(proposalId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Dismiss new member alert - Shared
export function dismissNewMemberAlert(start, completion) {
  return () => {
    if (start) start();
    API.dismissNewMemberAlert().then((res) => {
      if (completion) completion(res);
    });
  };
}

// Dismiss first completed grant alert - Shared
export function dismissFirstCompletedGrantAlert(start, completion) {
  return () => {
    if (start) start();
    API.dismissFirstCompletedGrantAlert().then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Public Proposal Changes - Shared
export function getPublicProposalChanges(proposalId, start, completion) {
  return () => {
    if (start) start();
    API.getPublicProposalChanges(proposalId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Proposal Change Comments - Shared
export function getProposalChangeComments(
  proposalId,
  proposalChangeId,
  start,
  completion
) {
  return () => {
    if (start) start();
    API.getProposalChangeComments(proposalId, proposalChangeId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Emailer Data - Admin
export function getEmailerData(start, completion) {
  return () => {
    if (start) start();
    API.getEmailerData().then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Move-to-Formal Votes - Admin
export function getMoveToFormalVotes(params, start, completion) {
  return () => {
    if (start) start();
    API.getMoveToFormalVotes(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Completed Votes - Shared
export function getCompletedVotes(params, start, completion) {
  return () => {
    if (start) start();
    API.getCompletedVotes(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Completed Votes - Shared
export function downloadCompletedVotes(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCompletedVotes(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Active Informal Votes - Shared
export function getActiveInformalVotes(params, start, completion) {
  return () => {
    if (start) start();
    API.getActiveInformalVotes(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Active Formal Votes - Shared
export function getActiveFormalVotes(params, start, completion) {
  return () => {
    if (start) start();
    API.getActiveFormalVotes(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Active Discussions - Shared
export function getActiveDiscussions(params, start, completion) {
  return () => {
    if (start) start();
    API.getActiveDiscussions(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Active Discussions - Shared
export function getUserProposalRequestPayment(params, start, completion) {
  return () => {
    if (start) start();
    API.getUserProposalRequestPayment(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Completed Discussions - Shared
export function getCompletedDiscussions(params, start, completion) {
  return () => {
    if (start) start();
    API.getCompletedDiscussions(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Sponsor Codes - User
export function getSponsorCodes(params, start, completion) {
  return () => {
    if (start) start();
    API.getSponsorCodes(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Grants - Shared
export function getGrantsShared(params, start, completion) {
  return () => {
    if (start) start();
    API.getGrantsShared(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Reputation By User
export function getReputationByUser(userId, params, start, completion) {
  return () => {
    if (start) start();
    API.getReputationByUser(userId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Proposals By User
export function getProposalsByUser(userId, params, start, completion) {
  return () => {
    if (start) start();
    API.getProposalsByUser(userId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Votes By User
export function getVotesByUser(userId, params, start, completion) {
  return () => {
    if (start) start();
    API.getVotesByUser(userId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposals - Shared
export function getAllProposalsShared(params, start, completion) {
  return () => {
    if (start) start();
    API.getAllProposalsShared(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposals - Shared - Public
export function getAllPublicProposalsShared(params, start, completion) {
  return () => {
    if (start) start();
    API.getAllPublicProposalsShared(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Milestones - Shared - Public
export function getAllPublicMilestonesShared(params, start, completion) {
  return () => {
    if (start) start();
    API.getAllPublicMilestonesShared(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Completed Proposals - Shared
export function getCompletedProposalsShared(params, start, completion) {
  return () => {
    if (start) start();
    API.getCompletedProposalsShared(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Active Proposals - Shared
export function getActiveProposalsShared(params, start, completion) {
  return () => {
    if (start) start();
    API.getActiveProposalsShared(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Reputation Track - User
export function getReputationTrack(params, start, completion) {
  return () => {
    if (start) start();
    API.getReputationTrack(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Active Proposals - User
export function getActiveProposals(params, start, completion) {
  return () => {
    if (start) start();
    API.getActiveProposals(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get My Payment Waiting Proposals - User
export function getMyPaymentProposals(start, completion) {
  return () => {
    if (start) start();
    API.getMyPaymentProposals().then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Pending Proposals - Shared
export function getPendingProposals(params, start, completion) {
  return () => {
    if (start) start();
    API.getPendingProposals(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Onboardings - User
export function getOnboardings(params, start, completion) {
  return () => {
    if (start) start();
    API.getOnboardings(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Pending Voting Associate Onboardings - Admin
export function getPendingMemberOnboardings(params, start, completion) {
  return () => {
    if (start) start();
    API.getPendingMemberOnboardings(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Pending Grant Onboardings - Admin
export function getPendingGrantOnboardings(params, start, completion) {
  return () => {
    if (start) start();
    API.getPendingGrantOnboardings(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

//
// Get Pending Users By Admin
export function getPendingUsersByAdmin(params, start, completion) {
  return () => {
    if (start) start();
    API.getPendingUsersByAdmin(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Pre Register Users By Admin
export function getPreRegisterUsersByAdmin(params, start, completion) {
  return () => {
    if (start) start();
    API.getPreRegisterUsersByAdmin(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Pre Register User By Hash
export function getPreRegisterUserByHash(hash, start, completion) {
  return () => {
    if (start) start();
    API.getPreRegisterUserByHash(hash).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Users By Admin
export function getUsersByAdmin(params, start, completion) {
  return () => {
    if (start) start();
    API.getUsersByAdmin(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Single User - Admin
export function getSingleUserByAdmin(userId, start, completion) {
  return () => {
    if (start) start();
    API.getSingleUserByAdmin(userId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Single Proposal - Shared
export function getSingleProposal(proposalId, start, completion) {
  return () => {
    if (start) start();
    API.getSingleProposal(proposalId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get VA not Vote - Admin
export function getVAsNotVote(voteId, start, completion) {
  return () => {
    if (start) start();
    API.getVAsNotVote(voteId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Single Proposal - Shared - Public
export function getPublicProposal(proposalId, start, completion) {
  return () => {
    if (start) start();
    API.getPublicProposal(proposalId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Single Proposal Edit - Shared
export function getSingleProposalEdit(proposalId, start, completion) {
  return () => {
    if (start) start();
    API.getSingleProposalEdit(proposalId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get My Data - Auth
export function getMe(start, completion, returnOnly = false) {
  return (dispatch) => {
    if (start) start();
    API.getMe().then((res) => {
      if (!returnOnly && res.me) {
        let userData = Helper.fetchUser();
        if (userData && userData.id) {
          userData = {
            ...res.me,
            accessTokenAPI: userData.accessTokenAPI,
          };

          Helper.storeUser(userData);
          dispatch(saveUser(userData));
        }
      }
      if (completion) completion(res);
    });
  };
}

// Verify Code
export function verifyCode(code, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.verifyCode(code).then((res) => {
      if (!res.success)
        dispatch(
          showAlert(
            "The code is incorrect. Please check the code and enter it again"
          )
        );
      if (completion) completion(res);
    });
  };
}

// Complete Review Step 2
export function completeStepReview2(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.completeStepReview2(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Save Shuftipro Temp - User
export function saveShuftiproTemp(params, start, completion) {
  return () => {
    if (start) start();
    API.saveShuftiproTemp(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Update Shuftipro Temp - User
export function updateShuftiproTemp(params, start, completion) {
  return () => {
    if (start) start();
    API.updateShuftiproTemp(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Update Shuftipro Ref Id
export function updateShuftiproRefId(params, start, completion) {
  return () => {
    if (start) start();
    API.updateShuftiproRefId(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Stake CC - User
export function stakeCC(proposalId, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.stakeCC(proposalId, params).then((res) => {
      if (!res.success) {
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Stake Reputation - User
export function stakeReputation(proposalId, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.stakeReputation(proposalId, params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Create Payment Intent - User
export function createPaymentIntent(proposalId, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.createPaymentIntent(proposalId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Payment Proposal - User
export function updatePaymentProposal(proposalId, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updatePaymentProposal(proposalId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// register Admin
export function registerAdmin(body, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.registerAdmin(body).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Payment Form
export function updatePaymentForm(proposalId, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updatePaymentForm(proposalId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Simple Proposal - Shared
export function updateSimpleProposalShared(
  proposalId,
  params,
  start,
  completion
) {
  return (dispatch) => {
    if (start) start();
    API.updateSimpleProposalShared(proposalId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Proposal - Shared
export function updateProposalShared(proposalInfo, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    if (proposalInfo.type === "simple") {
      API.updateSimpleProposalShared(proposalInfo.id, params).then((res) => {
        if (!res.success) dispatch(showAlert(res.message));
        if (completion) completion(res);
      });
    } else if (proposalInfo.type === "admin-grant") {
      API.updateAdminGrantProposalShared(proposalInfo.id, params).then(
        (res) => {
          if (!res.success) dispatch(showAlert(res.message));
          if (completion) completion(res);
        }
      );
    } else {
      API.updateProposalShared(proposalInfo.id, params).then((res) => {
        if (!res.success) dispatch(showAlert(res.message));
        if (completion) completion(res);
      });
    }
  };
}

// Update Global Settings - Admin
export function updateGlobalSettingsByAdmin(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateGlobalSettingsByAdmin(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      else dispatch(getGlobalSettings());
      if (completion) completion(res);
    });
  };
}

// Force Approve KYC - User
export function forceApproveKYC(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.forceApproveKYC().then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Force Deny KYC - User
export function forceDenyKYC(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.forceDenyKYC().then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Approve Pre Register - Admin
export function approvePreRegister(recordId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.approvePreRegister(recordId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Deny Pre Register - Admin
export function denyPreRegister(recordId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyPreRegister(recordId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Approve KYC - Admin
export function approveKYC(userId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.approveKYC(userId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Approve KYC - Admin
export function getNotSubmitMilestones(proposalId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getNotSubmitMilestones(proposalId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Deny KYC - Admin
export function denyKYC(userId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyKYC(userId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Reset KYC - Admin
export function resetKYC(userId, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.resetKYC(userId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Account Info - Shared
export function updateAccountInfo(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateAccountInfo(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Update Profile Info - Shared
export function updateProfileInfo(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateProfileInfo(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Update Profile - Shared
export function updateProfile(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateProfile(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Add Emailer Admin - Admin
export function addEmailerAdmin(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.addEmailerAdmin(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Emailer Trigger Admin - Admin
export function updateEmailerTriggerAdmin(id, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateEmailerTriggerAdmin(id, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Emailer Trigger User - Admin
export function updateEmailerTriggerUser(id, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateEmailerTriggerUser(id, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Emailer Trigger Member - Admin
export function updateEmailerTriggerMember(id, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateEmailerTriggerMember(id, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Delete Emailer Admin - Admin
export function deleteEmailerAdmin(adminId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.deleteEmailerAdmin(adminId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Add Reputation - Admin
export function addReputation(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.addReputation(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Subtract Reputation - Admin
export function subtractReputation(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.subtractReputation(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Change User Type - Admin
export function changeUserType(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.changeUserType(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Change User Type - Admin
export function changeUserAML(id, params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.changeUserAML(id, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Reset User Password - Admin
export function resetUserPassword(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.resetUserPassword(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Change Password - Shared
export function changePassword(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.changePassword(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Submit Simple Proposal
export function submitSimpleProposal(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitSimpleProposal(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Submit Simple Proposal
export function submitAdminGrantProposal(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitAdminGrantProposal(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Submit Payment Proposal
export function submitPaymentProposal(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitPaymentProposal(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Submit Milestone
export function submitMilestone(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitMilestone(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Submit Proposal
export function submitProposal(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitProposal(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Submit Proposal Change
export function submitProposalChange(
  params,
  start,
  completion,
  preventAlert = false
) {
  return (dispatch) => {
    if (start) start();
    API.submitProposalChange(params).then((res) => {
      if (!res.success && !preventAlert) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Submit Proposal Change Comment
export function submitProposalChangeComment(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitProposalChangeComment(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Submit Vote - User
export function submitVote(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitVote(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Support UP Proposal Change
export function supportUpProposalChange(proposalChangeId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.supportUpProposalChange(proposalChangeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Support DOWN Proposal Change
export function supportDownProposalChange(proposalChangeId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.supportDownProposalChange(proposalChangeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Approve Proposal Change - User
export function approveProposalChange(proposalChangeId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.approveProposalChange(proposalChangeId).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Force Approve Proposal Change - Admin
export function forceApproveProposalChange(
  proposalChangeId,
  start,
  completion
) {
  return (dispatch) => {
    if (start) start();
    API.forceApproveProposalChange(proposalChangeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Deny Proposal Change - User
export function denyProposalChange(proposalChangeId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyProposalChange(proposalChangeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Force Deny Proposal Change - Admin
export function forceDenyProposalChange(proposalChangeId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.forceDenyProposalChange(proposalChangeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Withdraw Proposal Change
export function withdrawProposalChange(proposalChangeId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.withdrawProposalChange(proposalChangeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Force Withdraw Proposal Change
export function forceWithdrawProposalChange(
  proposalChangeId,
  start,
  completion
) {
  return (dispatch) => {
    if (start) start();
    API.forceWithdrawProposalChange(proposalChangeId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Upload File for Proposal - Shared
export function uploadFile(formData, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.uploadFile(formData).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// uploadDraftFile for Proposal - Shared
export function uploadDraftFile(formData, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.uploadDraftFile(formData).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Start Formal Milestone Voting - Admin
export function startFormalMilestoneVoting(
  proposalId,
  voteId,
  start,
  completion
) {
  return (dispatch) => {
    if (start) start();
    API.startFormalMilestoneVoting(proposalId, voteId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Start Formal Milestone Voting - Admin
export function startFormalMilestoneVotingUser(
  proposalId,
  voteId,
  start,
  completion
) {
  return (dispatch) => {
    if (start) start();
    API.startFormalMilestoneVotingUser(proposalId, voteId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Start Formal Voting - Admin
export function startFormalVoting(proposalId, force, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.startFormalVoting(proposalId, force).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get Metrics - Admin
export function getMetrics(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getMetrics().then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check Active Grant - User
export function checkUserActiveGrant(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.checkUserActiveGrant().then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Start Formal Voting - Shared
export function startFormalVotingShared(proposalId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.startFormalVotingShared(proposalId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Start Informal Voting - Shared
export function startInformalVotingShared(proposalId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.startInformalVotingShared(proposalId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Restart Voting - Shared
export function restartVoting(voteId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.restartVoting(voteId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Approve Proposal Payment - Admin
export function approveProposalPayment(proposalId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.approveProposalPayment(proposalId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Deny Proposal Payment - Admin
export function denyProposalPayment(proposalId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyProposalPayment(proposalId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Approve Proposal - Admin
export function approveProposal(proposalId, start, completion) {
  return () => {
    if (start) start();
    API.approveProposal(proposalId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Deny Proposal - Admin
export function denyProposal(proposalId, reason, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyProposal(proposalId, reason).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Force Withdraw Proposal - Shared
export function forceWithdrawProposal(proposalId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.forceWithdrawProposal(proposalId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Withdraw Proposal - Shared
export function withdrawProposal(proposalId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.withdrawProposal(proposalId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Activate Associate to Voting Associate
export function activateParticipant(userId, start, completion) {
  return () => {
    if (start) start();
    API.activateParticipant(userId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Deny Associate - Admin
export function denyParticipant(userId, start, completion) {
  return () => {
    if (start) start();
    API.denyParticipant(userId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Allow Access User - Admin
export function allowAccessUser(userId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.allowAccessUser(userId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Deny Access User - Admin
export function denyAccessUser(userId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyAccessUser(userId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Activate Grant - Admin
export function activateGrant(grantId, formData, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.activateGrant(grantId, formData).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Begin Grant - Admin
export function beginGrant(grantId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.beginGrant(grantId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Ban User - Admin
export function banUser(userId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.banUser(userId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Unban User - Admin
export function unbanUser(userId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.unbanUser(userId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Remind Hellosign Grant
export function remindHellosignGrant(grantId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.remindHellosignGrant(grantId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// resend Hellosign Grant
export function resendHellosignGrant(grantId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.resendHellosignGrant(grantId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// view signed Grant
export function viewSignedGrant(grantId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.viewSignedGrant(grantId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// view Associate Agreement
export function viewAgreement(grantId, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.viewAgreement(grantId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get All Review Milestones - Admin
export function getAllReviewMilestones(params, start, completion) {
  return () => {
    if (start) start();
    API.getReviewMilestones(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Review Milestones - Admin
export function getVADirectory(params, start, completion) {
  return () => {
    if (start) start();
    API.getVADirectory(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getSurveys - Admin
export function getSurveys(params, start, completion) {
  return () => {
    if (start) start();
    API.getSurveys(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getSurveys - User
export function getUserSurveys(params, start, completion) {
  return () => {
    if (start) start();
    API.getUserSurveys(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getWinners - Admin
export function getWinners(params, start, completion) {
  return () => {
    if (start) start();
    API.getWinners(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// approveDownVote - Admin
export function approveDownVote(params, start, completion) {
  return () => {
    if (start) start();
    API.approveDownVote(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getLosers - Admin
export function getLosers(params, start, completion) {
  return () => {
    if (start) start();
    API.getLosers(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getSurveyVotes - Admin
export function getSurveyVotes(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getSurveyVotes(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getRFPSurveyVotes - Admin
export function getRFPSurveyVotes(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getRFPSurveyVotes(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getSurveyVotes - Admin
export function getSurveyDownvotes(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getSurveyDownvotes(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getSurveyEmailVoter - Admin
export function getSurveyEmailVoter(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getSurveyEmailVoter(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getSurveyVoters - Admin
export function getSurveyVoters(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getSurveyVoters(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getRFPSurveyVoters - Admin
export function getRFPSurveyVoters(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getRFPSurveyVoters(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getVoterResponse - Admin
export function getVoterResponse(id, userId, params, start, completion) {
  return () => {
    if (start) start();
    API.getVoterResponse(id, userId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

export function getVoterBidResponse(id, userId, params, start, completion) {
  return () => {
    if (start) start();
    API.getVoterBidResponse(id, userId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getUserNotVoteSurvey - Admin
export function getUserNotVoteSurvey(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getUserNotVoteSurvey(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getUserNotVoteSurvey - Admin
export function getUserNotVoteRFPSurvey(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getUserNotVoteRFPSurvey(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getSurveyDetail - Admin
export function getSurveyDetail(params, start, completion) {
  return () => {
    if (start) start();
    API.getSurveyDetail(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// getUserSurveyDetail - User
export function getUserSurveyDetail(params, start, completion) {
  return () => {
    if (start) start();
    API.getUserSurveyDetail(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// sendReminderForSurvey - Admin
export function sendReminderForSurvey(params, start, completion) {
  return () => {
    if (start) start();
    API.sendReminderForSurvey(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// sendReminderForRFPSurvey - Admin
export function sendReminderForRFPSurvey(params, start, completion) {
  return () => {
    if (start) start();
    API.sendReminderForRFPSurvey(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// cancelSurvey - Admin
export function cancelSurvey(params, start, completion) {
  return () => {
    if (start) start();
    API.cancelSurvey(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Milestone Logs - Admin
export function getMilestoneLogs(id, params, start, completion) {
  return () => {
    if (start) start();
    API.getMilestoneLogs(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Review Milestones - Admin
export function getAllMilestones(params, start, completion) {
  return () => {
    if (start) start();
    API.getAllMilestones(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Teams List - Admin
export function getAdminTeams(params, start, completion) {
  return () => {
    if (start) start();
    API.getAdminTeams(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Dos Fee - Admin
export function getDosFee(params, start, completion) {
  return () => {
    if (start) start();
    API.getDosFee(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Dos Fee - Admin
export function checkMasterPassword(params, start, completion) {
  return () => {
    if (start) start();
    API.checkMasterPassword(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Dos Fee - Admin
export function getShuftiStatus(params, start, completion) {
  return () => {
    if (start) start();
    API.getShuftiStatus(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Dos Fee - Admin
export function regeneratePDF(params, start, completion) {
  return () => {
    if (start) start();
    API.regeneratePDF(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Change Admin Permissions - Admin
export function changeAdminPermission(params, start, completion) {
  return () => {
    if (start) start();
    API.changeAdminPermission(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// resetPasswordAdmin - Admin
export function resetPasswordAdmin(params, start, completion) {
  return () => {
    if (start) start();
    API.resetPasswordAdmin(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// resendInvitedEmail - Admin
export function resendInvitedEmail(params, start, completion) {
  return () => {
    if (start) start();
    API.resendInvitedEmail(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All OP Milestones - Admin
export function getAllOPMilestones(params, start, completion) {
  return () => {
    if (start) start();
    API.getAllOPMilestones(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function getAllProposalMilestones(params, start, completion) {
  return () => {
    if (start) start();
    API.getAllProposalMilestones(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadCSVMilestones(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCSVMilestones(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadCSVAccounting(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCSVAccounting(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadCSVMyRep(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCSVMyRep(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function postRepDailyCsv(params, start, completion) {
  return () => {
    if (start) start();
    API.postRepDailyCsv(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function sendKycKangaroo(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.sendKycKangaroo(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - User
export function dismissStartKyc(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.dismissStartKyc(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function sendKycKangarooByAdmin(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.sendKycKangarooByAdmin(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function resendKycKangaroo(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.resendKycKangaroo(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function getTimelineProposal(proposalId, params, start, completion) {
  return () => {
    if (start) start();
    API.getTimelineProposal(proposalId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadCSVUserRep(userId, params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCSVUserRep(userId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadSurveyWinner(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadSurveyWinner(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadVoteResultCSV(
  propsalId,
  voteId,
  params,
  start,
  completion
) {
  return () => {
    if (start) start();
    API.downloadVoteResultCSV(propsalId, voteId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

export function downloadVoteResultPDF(
  propsalId,
  voteId,
  params,
  start,
  completion
) {
  return () => {
    if (start) start();
    API.downloadVoteResultPDF(propsalId, voteId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadSurveyLoser(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadSurveyLoser(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadCurrentVoteByProposal(id, params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCurrentVoteByProposal(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadCurrentBidVote(id, params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCurrentBidVote(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadCurrentDownvoteByProposal(
  id,
  params,
  start,
  completion
) {
  return () => {
    if (start) start();
    API.downloadCurrentDownvoteByProposal(id, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadAllVotes(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadAllVotes(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function downloadAllRep(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadAllRep(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function approveComplianceReview(params, start, completion) {
  return () => {
    if (start) start();
    API.approveComplianceReview(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

export function saveUnvotedInformal(params, start, completion) {
  return () => {
    if (start) start();
    API.saveUnvotedInformal(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

export function saveUnvotedFormal(params, start, completion) {
  return () => {
    if (start) start();
    API.saveUnvotedFormal(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function resendComplianceReview(params, start, completion) {
  return () => {
    if (start) start();
    API.resendComplianceReview(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal Milestones - Admin
export function denyComplianceReview(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyComplianceReview(params).then((res) => {
      if (completion) completion(res);
      if (!res.success) dispatch(showAlert(res.message));
    });
  };
}

// Get All Proposal Milestones - Admin
export function getReportOnboarding(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getReportOnboarding(params).then((res) => {
      if (completion) completion(res);
      if (!res.success) dispatch(showAlert(res.message));
    });
  };
}

// Get All Proposal Milestones - Admin
export function getReportReputation(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getReportReputation(params).then((res) => {
      if (completion) completion(res);
      if (!res.success) dispatch(showAlert(res.message));
    });
  };
}

// Get All Proposal Milestones - Admin
export function getReportTotalRep(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getReportTotalRep(params).then((res) => {
      if (completion) completion(res);
      if (!res.success) dispatch(showAlert(res.message));
    });
  };
}

// Get All Proposal CSV - Admin
export function downloadReport(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadReport(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal CSV - Admin
export function downloadCSVAllProposals(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCSVAllProposals(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal CSV - Admin
export function downloadCSVActiveGrants(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCSVActiveGrants(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal CSV - Admin
export function downloadCSVUsers(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadCSVUsers(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal CSV - Admin
export function checkMentor(params, start, completion) {
  return () => {
    if (start) start();
    API.checkMentor(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal CSV - Admin
export function listProposalMentors(userID, params, start, completion) {
  return () => {
    if (start) start();
    API.listProposalMentors(userID, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal CSV - Admin
export function exportProposalMentor(userId, params, start, completion) {
  return () => {
    if (start) start();
    API.exportProposalMentor(userId, params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get All Proposal CSV - Admin
export function downloadMentorHours(params, start, completion) {
  return () => {
    if (start) start();
    API.downloadMentorHours(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Review Milestone Detail - Admin
export function getReviewMilestoneDetail(params, start, completion) {
  return () => {
    if (start) start();
    API.getReviewMilestoneDetail(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Milestone Detail - Admin
export function getMilestoneDetail(params, start, completion) {
  return () => {
    if (start) start();
    API.getMilestoneDetail(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Public Milestone Detail
export function getPublicMilestoneDetail(params, start, completion) {
  return () => {
    if (start) start();
    API.getPublicMilestoneDetail(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Milestone Detail - Admin
export function togglePaidMilestone(id, paid, start, completion) {
  return () => {
    if (start) start();
    API.togglePaidMilestone(id, paid).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Approved Milestone - Admin
export function approveReviewMilestone(params, body, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.approveReviewMilestone(params, body).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Deny Milestone - Admin
export function denyReviewMilestone(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.denyReviewMilestone(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// invited - Admin
export function inviteAdmin(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.inviteAdmin(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// invited - Admin
export function updateShufti(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.updateShufti(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// revoke - Admin
export function revokeAdmin(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.revokeAdmin(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// undo revoke - Admin
export function undoRevokeAdmin(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.undoRevokeAdmin(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// get proposal draft - User
export function getProposalDrafts(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getProposalDrafts(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// get proposal draft - User
export function getProposalDraftDetail(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getProposalDraftDetail(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// get proposal draft - User
export function createProposalDraft(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.createProposalDraft(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// get proposal draft - User
export function deleteProposalDraft(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.deleteProposalDraft(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// launchSurvey - Admin
export function launchSurvey(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.launchSurvey(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// getCurrentSurvey - Admin
export function getCurrentSurvey(start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getCurrentSurvey().then((res) => {
      if (!res.success && res.message !== "Not found survey") {
        dispatch(showAlert(res.message));
      }
      if (completion) completion(res);
    });
  };
}

export function getRFPSurveys(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getRFPSurveys(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// submitSurvey - User
export function submitSurvey(id, body, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitSurvey(id, body).then((res) => {
      if (!res.success) {
        if (res.message?.downvote_responses) {
          dispatch(showAlert(res.message?.downvote_responses));
        }
        if (res.message?.upvote_responses) {
          dispatch(showAlert(res.message?.upvote_responses));
        }
      }
      if (completion) completion(res);
    });
  };
}

export function submitRFPSurvey(id, body, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitRFPSurvey(id, body).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
      }
      if (completion) completion(res);
    });
  };
}

// submitSurvey - User
export function submitDownvoteSurvey(id, body, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.submitDownvoteSurvey(id, body).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// 30 Days report
export function getMetricDiscussions(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getMetricDiscussions(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

export function getReportDiscussions(params, start, completion) {
  return (dispatch) => {
    if (start) start();
    API.getReportDiscussions(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}
