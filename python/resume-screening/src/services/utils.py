# common utility functions

def results_to_html_table(results):
    html = """
    <table style="width:100%; border-collapse: collapse; font-size: 15px;">
        <thead>
            <tr style="background:#f4f4f4;">
                <th style="border:1px solid #ccc; padding:8px; text-align:left;">BR ID</th>
                <th style="border:1px solid #ccc; padding:8px; text-align:left;">Selections - EmpID(%match)</th>
            </tr>
        </thead>
        <tbody>
    """

    for r in results:
        html += f"""
        <tr>
            <td style="border:1px solid #ccc; padding:8px;">{r['br_id']}</td>
            <td style="border:1px solid #ccc; padding:8px;">{r['matches']}</td>
        </tr>
        """

    html += "</tbody></table>"
    return html


def results_to_html_table_v2(results_all, jd_map, resume_skill_map, resume_text_map):

    html = """
    <style>
        .popup {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            display: none;
            z-index: 9999;
            white-space: pre-wrap;
        }
        .popup-overlay {
            position: fixed;
            top:0; left:0; right:0; bottom:0;
            background: rgba(0,0,0,0.45);
            display:none;
            z-index: 9998;
        }
        .popup-close {
            float:right;
            cursor:pointer;
            font-weight:bold;
            font-size: 18px;
        }
    </style>

    <div class="popup-overlay" id="popupOverlay" onclick="hidePopup()"></div>
    <div class="popup" id="popupBox">
        <span class="popup-close" onclick="hidePopup()">✖</span>
        <div id="popupContent"></div>
    </div>

    <script>
        function showBRInfo(br_id) {
            const jd_text = jdData[br_id];
            document.getElementById("popupContent").innerHTML =
                "<h3>Job Description – " + br_id + "</h3><p>" + jd_text + "</p>";
            showPopup();
        }

        function showResumeInfo(id) {
            const text = resumeText[id] || "No resume text found.";
            document.getElementById("popupContent").innerHTML =
                "<h3>Resume ID – " + id + "</h3><pre>" + text + "</pre>";
            showPopup();
        }

        function showPopup() {
            document.getElementById("popupOverlay").style.display = "block";
            document.getElementById("popupBox").style.display = "block";
        }

        function hidePopup() {
            document.getElementById("popupOverlay").style.display = "none";
            document.getElementById("popupBox").style.display = "none";
        }
    </script>

    <script>
        var jdData = {};
        var resumeText = {};
    </script>

    <table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr style="background:#f3f3f3;">
                <th>BR ID</th>
                <th>Selections – EmpID(% match)</th>
            </tr>
        </thead>
        <tbody>
    """

    # Inject JD and resume text into JS
    html += "<script>\n"

    for br_id, jd_text in jd_map.items():
        safe = jd_text.replace('"', '\\"')
        html += f'jdData["{br_id}"] = "{safe}";\n'

    for resume_id, text in resume_text_map.items():
        safe = text.replace('"', '\\"').replace("\n", "\\n")
        html += f'resumeText["{resume_id}"] = "{safe}";\n'

    html += "</script>\n"

    # Build table rows
    for entry in results_all:
        br = entry["br_id"]
        matches = entry["matches"]

        formatted = [
            f'{m["resume_id"]} ({float(m["final_score"]):.2f}%)'
            for m in matches
        ]

        html += f"""
        <tr>
            <td>{br}</td>
            <td>{", ".join(formatted)}</td>
        </tr>
        """

    html += """
        </tbody>
    </table>
    """

    return html


