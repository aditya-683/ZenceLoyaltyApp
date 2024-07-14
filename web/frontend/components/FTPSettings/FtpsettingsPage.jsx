import React, { useCallback, useState } from "react";
import { FormInput } from "../FormInput/FormInput";
import { timezones } from "../../../utils/constants.js";
import styles from "../styles/FTPSettingsPage.module.css";

import { getShopNameFromUrl } from "../../utils/frontendUtils.js";
import {
  Button,
  FormLayout,
  InlineError,
  TextField,
  Modal,
  LegacyStack,
  VerticalStack,
  Text,
  Toast,
} from "@shopify/polaris";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch.js";
import { useAppQuery } from "../../hooks/useAppQuery";
import LoadingComponent from "../LoadingComponent";

export function FtpsettingsPage() {
  const [isReconAllowed, setIsReconAllowed] = useState(false);
  const [hh, setHH] = useState("");
  const [mm, setMM] = useState("");
  const [ss, setSS] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [btnLoading, setIsbtnLoading] = useState(false);
  const [data, setData] = useState(null);
  const fetch = useAuthenticatedFetch();
  const emptyToastProps = { content: null };
  const [toastProps, setToastProps] = useState(emptyToastProps);

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)} />
  );

  const [values, setValues] = useState({
    host: "",
    username: "",
    password: "",
    confirmPassword: "",
    remoteDir: "",
    port: "",
    timezone: "",
    cronTime: "",
  });

  const inputFields = [
    {
      id: 1,
      name: "host",
      type: "text",
      placeholder: "HostName eg:batainternationalftp.ercx.co",
      errorMessage: "This Can not be empty",
      label: "Host",
      //   pattern: "^[A-Za-z0-9]{3,16}$",
      required: true,
      elementType: "input",
    },
    {
      id: 2,
      name: "username",
      type: "username eg:BataSingapore",
      placeholder: "Username",
      errorMessage: "It should be a valid username!",
      label: "Username",
      autoComplete: "new-password",
      required: true,
      elementType: "input",
    },
    // {
    //   id: 3,
    //   name: "birthday",
    //   type: "date",
    //   placeholder: "Birthday",
    //   label: "Birthday",
    // },
    {
      id: 3,
      name: "password",
      type: "password",
      placeholder: "Password",
      errorMessage: "Please enter a valid password",
      label: "Password",
      //   pattern: `^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$`,
      required: true,
      autoComplete: "new-password",
      elementType: "input",
    },
    {
      id: 4,
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm Password",
      errorMessage: "Passwords don't match!",
      label: "Confirm Password",
      pattern: values.password,
      required: true,
      elementType: "input",
    },

    /* {
      id: 5,
      name: "path",
      type: "text",
      placeholder: "Path",
      errorMessage: "Please Enter Valid Path",
      label: "Path",
      pattern: `^\/([A-Za-z0-9_\-]+\/)*[A-Za-z0-9_\-]+$`,
      required: true,
      elementType: "input",
      readOnly: "readOnly",
    }, */
    {
      id: 5,
      name: "remoteDir",
      type: "text",
      placeholder: "Remote Directory eg . //Ecom",
      errorMessage: "This is required",
      label: "remoteDir",
      //   pattern: `^\/([A-Za-z0-9_\-]+\/)*[A-Za-z0-9_\-]+$`,
      required: true,
      elementType: "input",
    },

    {
      id: 6,
      name: "port",
      type: "text",
      placeholder: "Port eg :2222",
      errorMessage: "This is required",
      label: "Port",
      //   pattern: `^\/([A-Za-z0-9_\-]+\/)*[A-Za-z0-9_\-]+$`,
      required: true,
      elementType: "input",
    },
    {
      id: 7,
      name: "timezone",
      type: "text",
      placeholder: "Timezone",
      errorMessage: "This is required",
      label: "timezone",
      //   pattern: `^\/([A-Za-z0-9_\-]+\/)*[A-Za-z0-9_\-]+$`,
      required: true,
      elementType: "select",
    },
    {
      id: 8,
      name: "cronTime",
      type: "text",
      placeholder: "cronTime",
      errorMessage: "This is required",
      label: "cronTime",
      //   pattern: `^\/([A-Za-z0-9_\-]+\/)*[A-Za-z0-9_\-]+$`,
      required: true,
      elementType: "select",
    },
  ];

  const times = [];

  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, "0");
    const time1 = hour + ":"; // +":00:00";
    // const time2 = hour + ":30:00";
    times.push(time1);
  }
  const minutes = [];

  for (let i = 0; i < 60; i++) {
    const minute = i.toString().padStart(2, "0");
    const time1 = minute + ":"; // +":00:00";
    // const time2 = hour + ":30:00";
    minutes.push(time1);
  }
  const seconds = [];

  for (let i = 0; i < 60; i++) {
    const second = i.toString().padStart(2, "0");
    const time1 = second; // +":00:00";
    // const time2 = hour + ":30:00";
    seconds.push(time1);
  }

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    // console.log(values);
  };
  const handleSelectChange = (e, selectionType, timeUnit) => {
    if (selectionType == "timezone") {
      setValues({ ...values, ["timezone"]: e.target.value });
    } else if ((e, selectionType == "cronTime" && timeUnit == "hh")) {
      setValues((prev) => {
        const time = `${e.target.value}${mm}${ss}`;

        return {
          ...prev,
          ["cronTime"]: `${time}`,
        };
      });
    } else if ((e, selectionType == "cronTime" && timeUnit == "mm")) {
      setValues((prev) => {
        const time = `${hh}${e.target.value}${ss}`;

        return {
          ...prev,
          ["cronTime"]: `${time}`,
        };
      });
    } else if ((e, selectionType == "cronTime" && timeUnit == "ss")) {
      setValues((prev) => {
        const time = `${hh}${mm}${e.target.value}`;

        return {
          ...prev,
          ["cronTime"]: `${time}`,
        };
      });
    }
  };
  // console.log("prev cron value22=", values["cronTime"]);

  const validateFormInput = () => {
    return Object.keys(values).every((key) => !isEmpty(values[key]));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("prev cron value11=", values["cronTime"]);
    // console.log(values);
    // console.log("isReconAllowed=", isReconAllowed);
    // console.log("validateFormInput=", validateFormInput());
    const regexForCronTime = /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/;

    if (!regexForCronTime.test(values["cronTime"])) {
      setToastProps({
        content: "Invalid Time",
        error: true,
      });
      return;
    } else if (isEmpty(values["timezone"]) || values["timezone"] == "none") {
      setToastProps({
        content: "Invalid Timezone",
        error: true,
      });
      return;
    } else if (!validateFormInput()) {
      setToastProps({
        content: "Invalid Inputs",
        error: true,
      });

      return;
    }

    //loading
    // setIsLoading(true);
    setIsbtnLoading(true);

    // console.log("isReconAllowed=", isReconAllowed);
    const store = getShopNameFromUrl(location.href);
    var apiData = {
      store: store,
      isReconAllowed: isReconAllowed,
      ...values,
    };

    //checkSFTPDetails
    fetch(`/api/sftp-checker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    })
      .then((res) => res.json() || "")
      .then((res) => {
        if (res.status == "500" || res.status === 500) {
          setIsLoading(false);
          setIsbtnLoading(false);
          setToastProps({
            content: "Invalid Details!",
            error: true,
          });
        } else {
          setIsLoading(false);
          fetch(`/api/updateFtpSettings`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          })
            .then((response) => response.json())
            .then((res) => {
              scheduleCronJobs(store);
              setIsbtnLoading(false);
              setToastProps({
                content: "Updated",
                error: false,
              });
            })
            .catch((err) => {
              setIsbtnLoading(false);
              setToastProps({
                content: "Something Went Wrong!",
                error: true,
              });
            });
        }
      })
      .catch((err) => {
        setIsbtnLoading(false);
        setCheckRecondData(false);
        setToastProps({
          content: "Internal Server Error!",
          error: true,
        });
      });
  };

  const CurrentTimeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone; //Asia/Calcutta

  const updateReconBoolean = () => {
    setIsLoading(true);

    const store = getShopNameFromUrl(location.href);
    // console.log("isReconAllowed=", isReconAllowed);

    fetch(`/api/updateFtpSettings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        store: store,
        isReconAllowed: isReconAllowed,
        ...values,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        scheduleCronJobs(store);
        setIsLoading(false);
        setToastProps({
          content: "Updated",
          error: false,
        });

        // console.log("updateAppSettings result from ftp setting:", res);
        // console.log("Response", res);
      })
      .catch((err) => {
        // console.log(err);
        setToastProps({
          content: "Something Went Wrong ",
          error: true,
        });
      });
  };

  const scheduleCronJobs = async (store) => {
    fetch(`/api/scheduleCronJobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        StoreName: store,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        // console.log("scheduleCronJobs response=", res);
        // console.log("Response",res);
      })
      .catch((err) => {
        // console.log("error in scheduleCronJobs:");
        // console.log(err);
      });
  };

  const url = location.href;
  const storeUrl = getShopNameFromUrl(url);
  const bodyData = { storeName: storeUrl };

  const store = storeUrl;
  const {
    data: shopData,
    isSuccess,
    isError,
    isFetching,
  } = useAppQuery({
    url: `/api/getFtpSettings?store=${storeUrl}`,
    fetchInit: {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      // body: JSON.stringify(bodyData)
    }, //fetchInit ends

    reactQueryOptions: {
      onSuccess: (responseData) => {
        // console.log("responseData_from_ftpsettingPage", responseData);
        if (isEmpty(responseData.data)) {
          setToastProps({
            content: "Something Went Wrong",
            error: true,
          });
        }
        const settingsObj = responseData.data;
        setData(settingsObj);
        setIsLoading(false);
        setIsReconAllowed(!isEmpty(settingsObj) && settingsObj.isReconAllowed);

        const {
          host,
          username,
          password,
          remoteDir,
          port,
          timezone,
          cronTime,
        } = !isEmpty(settingsObj) ? settingsObj : { ...values };
        !isEmpty(settingsObj) &&
          setValues({
            ...values,
            ["host"]: host,
            ["username"]: username,
            ["password"]: password,
            ["confirmPassword"]: password,
            ["remoteDir"]: remoteDir,
            ["port"]: port,
            ["timezone"]: timezone,
            ["cronTime"]: cronTime,
          });

        if (cronTime) {
          const [hh, mm, ss] = cronTime?.split(":");

          setMM(mm);
          setSS(ss);
          setHH(hh);
        }
      },
      onError: (error) => {
        // console.log(error);
        setData(null);
        setIsLoading(false);
        setToastProps({
          content: error.message || "Something Went Wrong!",
          error: true,
        });
      },
    },
  });

  const isEmpty = (obj) => {
    if (obj === undefined || obj === null || obj === "") {
      return true;
    } else if (Array.isArray(obj) && obj.length <= 0) {
      return true;
    } else if (Object.keys(obj).length <= 0) {
      return true;
    } else {
      return false;
    }
  };

  const getArrayDefaultIndex = (array, toBeSearched, timeUnit) => {
    // console.log("hh", hh, "mm", mm, "ss", ss);
    if (!isEmpty(data)) {
      // console.log("getArrayDefaultIndex=", isEmpty(data));
      // console.log("data=", array);
      let idx = 0;
      if (toBeSearched?.includes(":") && timeUnit) {
        const [hh, mm, ss] = toBeSearched?.split(":");
        // console.log("ss", ss);

        switch (timeUnit) {
          case "hh":
            idx = array?.findIndex((item) => item?.trim() === `${hh}:`?.trim());
            break;

          case "mm":
            idx = array?.findIndex((item) => item?.trim() === `${mm}:`?.trim());
            break;

          case "ss":
            idx = array?.findIndex((item) => item?.trim() === `${ss}`?.trim());
            break;
        }
      } else if (toBeSearched?.includes("/") || toBeSearched?.includes("UTC")) {
        idx = array?.findIndex((item) => item?.trim() === toBeSearched?.trim());
      }

      if (idx <= 0) return 0;
      else return idx;
    } else {
      return 0;
    }
  };

  const ConfirmationDialog = () => {
    //************************************Model Desc************************************************ */
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailDesc, setEmailDesc] = useState("");
    const [passwordDesc, setPasswordDesc] = useState("");

    const [active, setActive] = useState(false);
    const handleModalChange = useCallback(() => setActive(!active), [active]);

    const handleClose = () => {
      handleModalChange();
    };

    const updateDetails = (e) => {
      e.preventDefault();
      if (!email) {
        setEmailDesc("Email is required");
        setPasswordDesc("");
        return;
      } else if (!password) {
        e.preventDefault();
        setPasswordDesc("Password is Required");
        setEmailDesc("");
        return;
      } else {
        handleModalChange();
        setPasswordDesc("");
        setEmailDesc("");
      }
    };

    const activator = (
      <Button primary onClick={handleModalChange}>
        Open
      </Button>
    );

    const handleEmailChange = useCallback((value) => setEmail(value), []);
    const handlePasswordChange = useCallback((value) => setPassword(value), []);
    //************************************Model Desc************************************************ */
    return (
      <Modal
        activator={null}
        open={active}
        onClose={handleClose}
        title="Please confirm Email and password to update"
        primaryAction={{
          content: "Update",
          onAction: updateDetails,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleClose,
          },
        ]}
      >
        <Modal.Section>
          <VerticalStack>
            <LegacyStack.Item>
              <FormLayout>
                <TextField
                  value={email}
                  type="email"
                  label="Email"
                  onChange={handleEmailChange}
                  autoComplete="email"
                  helpText={
                    <InlineError message={emailDesc} fieldID="myFieldID-2" />
                  }
                />
                <TextField
                  value={password}
                  type="text"
                  label="Password"
                  onChange={handlePasswordChange}
                  autoComplete="off"
                  helpText={
                    <InlineError message={passwordDesc} fieldID="myFieldID-1" />
                  }
                />
              </FormLayout>
            </LegacyStack.Item>
          </VerticalStack>
        </Modal.Section>
      </Modal>
    );
  };

  const CustomCheckBox = () => {
    return (
      <input
        type="checkbox"
        style={{
          height: "18px",
          width: "18px",
          cursor: "pointer",
        }}
        checked={isReconAllowed}
        onChange={() => {
          setIsReconAllowed((prev) => !prev);
        }}
      />
    );
  };

  return (
    <>
      {isLoading ? (
        <LoadingComponent isLoading={isLoading} tabCount={5} />
      ) : (
        <>
          {toastMarkup}

          <LegacyStack vertical={false} distribution="fill">
            <LegacyStack.Item>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  padding: "10px",
                  gap: "30px",
                }}
              >
                <LegacyStack spacing="loose" alignment="center">
                  <Text variant="headingLg" as="h2">
                    Enable Recon
                  </Text>

                  <CustomCheckBox />
                </LegacyStack>
                {!isReconAllowed && (
                  <div>
                    <Button
                      onClick={updateReconBoolean}
                      primary
                      loading={isLoading}
                    >
                      Update
                    </Button>
                  </div>
                )}

                {isReconAllowed && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "30px",
                      padding: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="headingLg" as="h2">
                        Timezones:
                      </Text>
                      <select
                        style={{
                          padding: "8px",
                          borderRadius: "5px",
                          width: "30%",
                        }}
                        id={8}
                        defaultValue={
                          timezones[
                            getArrayDefaultIndex(timezones, data?.timezone)
                          ]
                        }
                        onChange={(e) => handleSelectChange(e, "timezone")}
                        // defaultValue={CurrentTimeZoneName}
                      >
                        {timezones.map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "5px",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="headingLg" as="h2">
                        Time:
                      </Text>
                      <p>hh:</p>
                      <select
                        style={{
                          padding: "8px",
                          marginLeft: "5px",
                          borderRadius: "5px",
                          width: "10%",
                        }}
                        id={9}
                        defaultValue={
                          times[
                            getArrayDefaultIndex(times, data?.cronTime, "hh")
                          ]
                        }
                        onChange={(e) => {
                          setHH(e.target.value);
                          handleSelectChange(e, "cronTime", "hh");
                        }}
                      >
                        {times.map((option, indx) => (
                          <option key={indx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <p>mm:</p>
                      <select
                        id={10}
                        style={{
                          padding: "8px",
                          marginLeft: "5px",
                          borderRadius: "5px",
                          width: "10%",
                        }}
                        defaultValue={
                          minutes[
                            getArrayDefaultIndex(minutes, data?.cronTime, "mm")
                          ]
                        }
                        onChange={(e) => {
                          setMM(e.target.value);
                          handleSelectChange(e, "cronTime", "mm");
                        }}
                      >
                        {minutes.map((option, indx) => (
                          <option key={indx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <p>ss:</p>
                      <select
                        id={11}
                        style={{
                          padding: "8px",
                          marginLeft: "5px",
                          borderRadius: "5px",
                          width: "10%",
                        }}
                        defaultValue={
                          seconds[
                            getArrayDefaultIndex(seconds, data?.cronTime, "ss")
                          ]
                        }
                        onChange={(e) => {
                          setSS(e.target.value);
                          handleSelectChange(e, "cronTime", "ss");
                        }}
                      >
                        {seconds.map((option, indx) => (
                          <option key={indx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </LegacyStack.Item>
            <LegacyStack.Item>
              {isReconAllowed && (
                <form className={styles.myForm} autoComplete="off">
                  <h3>FTP OPTIONS</h3>

                  {inputFields.map((input, idx) => {
                    return (
                      <FormInput
                        key={input.id}
                        {...input}
                        value={values[input.name]}
                        onChange={onChange}
                      />
                    );
                  })}

                  <Button
                    onClick={handleSubmit}
                    size="large"
                    primary
                    loading={btnLoading}
                  >
                    Submit
                  </Button>
                </form>
              )}
            </LegacyStack.Item>
          </LegacyStack>
        </>
      )}
    </>
  );
}

// export default FtpsettingsPage;
