// =======================
// V2 JavaScript
// =======================

// storage for server results
window.V2_RESULTS = null;
window.V2_JD_MAP = null;
window.V2_RESUME_TEXT_MAP = null;

// Handle form submit (JD Excel + ZIP file)
document.getElementById("uploadFormV2").onsubmit = async (e) => {
    e.preventDefault();

    const jdFile = document.getElementById("jdFileV2").files[0];
    const zipFile = document.getElementById("zipFileV2").files[0];
    const resultsDiv = document.getElementById("results_v2");

    const formData = new FormData();
    formData.append("jd_file", jdFile);
    formData.append("resume_zip", zipFile);

    resultsDiv.innerHTML = "<em>Processing...</em>";

    const resp = await fetch("/search_resumes_v2", {
        method: "POST",
        body: formData
    });

    const data = await resp.json();

    // Insert HTML table
    resultsDiv.innerHTML = data.html;

    // store results
    window.V2_RESULTS = data.results;
    window.V2_JD_MAP = data.jd_map;
    window.V2_RESUME_TEXT_MAP = data.resume_text_map;

    // show download buttons
    document.getElementById("downloadButtonsV2").style.display = "block";
};


// ===============
// Download Excel
// ===============
function downloadExcelV2() {
    fetch("/download_excel_v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({results: window.V2_RESULTS})
    })
    .then(r => r.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume_matches_v2.xlsx";
        a.click();
    });
}


// ===============
// Download PDF
// ===============
function downloadPdfV2() {
    fetch("/download_pdf_v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({results: window.V2_RESULTS})
    })
    .then(r => r.blob())
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "resume_matches_v2.pdf";
        a.click();
    });
}
