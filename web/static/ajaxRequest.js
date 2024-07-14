export const makeAjaxRequest = async (url, data, method = "POST") => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // console.log("Yes result came", xhr.responseText);
        resolve(xhr.responseText);
      } else if (xhr.readyState === 4 && xhr.status !== 200) {
        reject(xhr.responseText);
      };
    };

    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  });
};


export const showErrorMessage = (message) => {
  // console.log("=-====================================== ", message);
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".errorMessage").innerHTML =
    message;
};
