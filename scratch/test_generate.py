import urllib.request
import json
import os

url = "http://localhost:8080/api/generate-docx"
data = {
    "date": "MAY 22, 2026",
    "subject": "SUBJECT: SELF-IDENTIFICATION AND RECOMMENDATION FOR TATTOO WAIVER - APPLICANT MARTINEZ, CARLOS A.",
    "paragraphs": [
        "1. References:",
        "   a. AR 670-1 (Wear and Appearance of Army Uniforms and Insignia).",
        "   b. USAREC Regulation 601-210 (Enlistment and Accessions Processing).",
        "",
        "2. In accordance with reference 1a, the enlisting recruiter has inspected the tattoo(s) of Applicant Martinez, Carlos A. (SSN: XXX-XX-7742).",
        "",
        "3. Tattoo details:",
        "   - Location/Description: Neck Tattoo: 'BLESSED' in cursive script, approximately 2x3 inches, placed on left lateral neck.",
        "   - The tattoo does not contain extremist, indecent, sexist, or racist imagery and is fully compliant with Army values.",
        "",
        "4. Recommendation: The Station Commander strongly recommends approval of this waiver. The applicant possesses outstanding potential for military service, holding an AFQT score of 91, and demonstrates exceptional motivation.",
        "",
        "5. Point of contact for this action is the enlisting recruiter, SSG Thompson, R., at 555-0199."
    ],
    "signature": [
        "MARTINEZ, CARLOS A.",
        "Applicant"
    ],
    "filename": "test_mfr.docx"
}

req = urllib.request.Request(
    url, 
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        with open("/Users/lucaskraat/Desktop/ARTIFACTS/scratch/test_download.docx", "wb") as f:
            f.write(response.read())
    print("Success! Downloaded docx to scratch/test_download.docx")
except Exception as e:
    print("Error calling API:", e)
