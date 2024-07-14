export async function clickEvent() {
  document
    .querySelector(".abhi_eazyRewardz-submit-button")
    .addEventListener("click", async function (e) {
      e.preventDefault();
      document.querySelector("#iframeID").style.display = "block";
    });
}

export function closeModal() {
  var frame = document.getElementById("iframeID");
  frame.style.display = "none";
  var frameDoc = frame.contentDocument || frame.contentWindow.document;
  frameDoc.documentElement.innerHTML = "";
}
