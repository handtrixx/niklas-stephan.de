document.querySelectorAll(".highlight").forEach((block) => {
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.textContent = "Copy";

  block.appendChild(btn);

  btn.addEventListener("click", () => {
    const code = block.querySelector("code");
    const text = Array.from(code.querySelectorAll('span[style="display:flex"]'))
      .map((line) => line.innerText.replace(/\n/g, ""))
      .join("\n")
      .replace(/\n$/, "");

    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      }, 2000);
    });
  });
});
