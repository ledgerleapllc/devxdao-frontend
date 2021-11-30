import React, { useState } from "react";
import * as Icon from "react-feather";
import Dropzone from "react-dropzone";
import { Fade } from "react-reveal";
import { hideCanvas, showAlert, showCanvas } from "../../../../redux/actions";
import {
  BasicDatePicker,
  PageHeaderComponent,
  InputMoney,
} from "../../../../components";
import { submitAdminGrantProposal, uploadFile } from "../../../../utils/Thunk";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./new-admin-grant-proposal.scss";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { format } from "date-fns";

const schema = yup.object().shape({
  title: yup.string().required(),
  total_grant: yup.number().positive(),
  things_delivered: yup.string().required(),
  delivered_at: yup.string().required(),
});

const NewAdminGrantProposal = () => {
  const { formState, control, register, handleSubmit } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });
  const [files, setFiles] = useState([]);
  const history = useHistory();
  const dispatch = useDispatch();

  const onSubmit = (data) => {
    data.delivered_at = format(
      new Date(new Date(data.delivered_at).toLocaleDateString()),
      "yyyy-MM-dd"
    );
    dispatch(
      submitAdminGrantProposal(
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
                          `You have successfully submitted your admin grant proposal. We will review it and keep you posted.`,
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
                  `You have successfully submitted your admin grant proposal. We will review it and keep you posted.`,
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

  return (
    <div id="app-new-admin-grant-proposal-page">
      <div style={{ marginTop: "50px" }}>
        <PageHeaderComponent
          title="New Admin Grant Proposal"
          link="/app/proposals"
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row mt-5">
            <label>Title of Proposal (limit 10 words)</label>
            <input {...register("title")} type="text" />
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row">
            <label>{`Euro amount requested`}</label>
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
            <label>{`Enter what is being delivered for the DxD/ETA`}</label>
            <textarea {...register("things_delivered")}></textarea>
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row">
            <label>{`When will this be delivered`}</label>
            <Controller
              control={control}
              name={"delivered_at"}
              render={({ field: { onChange, value } }) => (
                <BasicDatePicker value={value} onChange={onChange} />
              )}
            />
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row">
            <label>{`Enter other notes (optional)`}</label>
            <textarea {...register("extra_notes")}></textarea>
          </div>
        </Fade>
        <Fade distance={"20px"} bottom duration={300} delay={600}>
          <div className="c-form-row mt-5">
            <label>
              {`Drag and drop a file into this box to upload pitch deck, project architecture, charts, etc.`}
              <br />
              {`( Only PDF files will be accepted )`}
            </label>
            <Dropzone
              accept="application/pdf"
              onDrop={(files) => appendFiles(files)}
            >
              {({ getRootProps, getInputProps }) => (
                <section id="c-dropzone">
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Icon.Upload color="#9B64E6" />
                    <p className="color-primary">Add Files</p>
                  </div>
                </section>
              )}
            </Dropzone>
            {renderFiles()}
          </div>
        </Fade>
        <div className="mt-5">
          <button
            disabled={!formState.isValid}
            type="submit"
            className="btn btn-primary large"
          >
            Submit Admin Grant Proposal
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAdminGrantProposal;
