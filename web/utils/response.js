export function resAsSuccess({ status_code, message, data }) {
  const res_success = {
    status: status_code,
    response: {
      message: message !== null ? message : "",
      data: data !== null ? data : "",
    },
    // additional feilds to send

    error: {
      message: null,
    },
  };

  return res_success;
}

export function resAsFailed({ status_code, message, data }) {
  const res_failed = {
    status: status_code,
    response: {
      message: null,
      data: data,
    },
    error: {
      message: message !== null ? message : "",
    },
  };

  return res_failed;
}
