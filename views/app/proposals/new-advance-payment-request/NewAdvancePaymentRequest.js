import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { Fade } from "react-reveal";
import Dropzone from "react-dropzone";
import * as Icon from "react-feather";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  getSingleProposal,
  getUserProposalRequestPayment,
  submitPaymentProposal,
  uploadFile,
} from "../../../../utils/Thunk";
import { hideCanvas, showAlert, showCanvas } from "../../../../redux/actions";
import {
  PageHeaderComponent,
  InputMoney,
  Checkbox,
} from "../../../../components";
import "./new-advance-payment-request.scss";
import Helper from "../../../../utils/Helper";

const NewAdvancePaymentRequest = () => {
  const history = useHistory();
  const schema = yup.object().shape({
    proposal_id: yup.string().required(),
    total_grant: yup.number().positive(),
    amount_advance_detail: yup.string().required(),
    agree_term: yup.boolean().isTrue(),
  });

  const { formState, control, register, handleSubmit } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });
  const dispatch = useDispatch();
  const [userProposals, setUserProposals] = useState([]);
  const [files, setFiles] = useState([]);
  const [linkedProposal, setLinkedProposal] = useState();

  useEffect(() => {
    dispatch(
      getUserProposalRequestPayment(
        {},
        () => {
          dispatch(showCanvas());
        },
        (res) => {
          dispatch(hideCanvas());
          if (res.success) {
            setUserProposals(res.proposals);
          }
        }
      )
    );
  }, []);

  const appendFiles = (extra) => {
    const temp = files.concat(extra);
    setFiles(temp);
  };

  const removeFile = (index) => {
    files.splice(index, 1);
    setFiles([...files]);
  };

  const renderFiles = () => {
    if (!files || !files.length) return null;

    const items = [];
    files.forEach((file, index) => {
      items.push(
        <li key={`file_${index}`}>
          <p>{file.name}</p>
          <Icon.X onClick={() => removeFile(index)} />
        </li>
      );
    });

    return (
      <div id="files-wrap">
        <label>
          <b>Files:</b>
        </label>
        <ul>{items}</ul>
      </div>
    );
  };

  const onSubmit = (data) => {
    dispatch(
      submitPaymentProposal(
        data,
        () => {
          dispatch(showCanvas());
        },
        (res) => {
          if (res.success && res.proposal && res.proposal.id) {
            if (files && files.length) {
              const formData = new FormData();
              files.forEach((file) => {
                formData.append("files[]", file);
                formData.append("names[]", file.name);
              });
              formData.append("proposal", res.proposal.id);

              dispatch(
                uploadFile(
                  formData,
                  () => {},
                  (res) => {
                    if (res.success) {
                      history.push("/app/proposals");
                      dispatch(
                        showAlert(
                          `You have successfully submitted your advance payment request. We will review it and keep you posted.`,
                          "success"
                        )
                      );
                      dispatch(hideCanvas());
                    }
                  }
                )
              );
            } else {
              history.push("/app/proposals");
              dispatch(
                showAlert(
                  `You have successfully submitted your advance payment request. We will review it and keep you posted.`,
                  "success"
                )
              );
              dispatch(hideCanvas());
            }
          } else dispatch(hideCanvas());
        }
      )
    );
  };

  const getLinkedProposalDetail = (proposalId) => {
    dispatch(
      getSingleProposal(
        proposalId,
        () => {
          dispatch(showCanvas());
        },
        (res) => {
          if (res.success) {
            setLinkedProposal(res.proposal);
          }
          dispatch(hideCanvas());
        }
      )
    );
  };

  return (
    <div id="app-new-advance-payment-request-page">
      <div style={{ marginTop: "50px" }}>
        <PageHeaderComponent
          title="New Advance Payment Request"
          link="/app/proposals"
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row mt-5">
            <label>{`Select the proposal you are requesting a payment advance for:`}</label>
            <select
              {...register("proposal_id")}
              onChange={(e) => getLinkedProposalDetail(e.target.value)}
            >
              <option value="">Select Proposal</option>
              {userProposals.map((proposal) => (
                <option key={proposal.id} value={proposal.id}>
                  {proposal.id}-{proposal.title}
                </option>
              ))}
            </select>
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row">
            <label>
              {`The total Euro value of this proposal is: ${Helper.formatPriceNumber(
                linkedProposal?.total_grant || 0,
                "€"
              )}`}
              <br />
              {`Please select the portion of this proposal you are requesting as an advance`}
            </label>
            <Controller
              control={control}
              name={"total_grant"}
              render={({ field: { onChange, value } }) => (
                <InputMoney value={value} onChange={onChange} />
              )}
            />
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row">
            <label>Why are you requesting this amount as an advance?</label>
            <textarea {...register("amount_advance_detail")}></textarea>
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row mt-5">
            <label>
              {`Please add applicable PDF files as documentation for this request`}
            </label>
            <Dropzone
              accept="application/pdf"
              onDrop={(files) => appendFiles(files)}
            >
              {({ getRootProps, getInputProps }) => (
                <section id="c-dropzone">
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p className="color-primary">Drop files here</p>
                  </div>
                </section>
              )}
            </Dropzone>
            {renderFiles()}
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <Controller
            control={control}
            name={"agree_term"}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                value={value}
                onChange={onChange}
                text={`I understand that no request for advance payment is guarenteed. Once submitted, this request will be discussed
                and must pass an informal and formal vote for approval. If approved, I understand that my first milestone payment
                will be reduced by the amount advanced. If the amount advanced is greater than the amount of my first milestone,
                funds will be`}
              />
            )}
          />
        </Fade>
        <div className="mt-5 submit-btn-wrap">
          <button
            type="submit"
            className="btn btn-primary large"
            disabled={!formState.isValid}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAdvancePaymentRequest;
