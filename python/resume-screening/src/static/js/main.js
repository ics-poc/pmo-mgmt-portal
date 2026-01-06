document.getElementById("jdForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("jdFile");
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const res = await fetch("/match", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    document.getElementById("results").innerText = JSON.stringify(data, null, 2);
});
