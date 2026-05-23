import http.server
import socketserver
import json
import zipfile
import xml.etree.ElementTree as ET
import io
import os

PORT = 8080
DIRECTORY = "/Users/lucaskraat/Desktop/ARTIFACTS"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/api/generate-docx':
            try:
                # Read content length and parse JSON
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Extract template parameters
                date_val = data.get('date', '')
                subject_val = data.get('subject', '')
                paragraphs = data.get('paragraphs', [])
                signature_lines = data.get('signature', [])
                filename = data.get('filename', 'MFR.docx')
                
                docx_template = "/Users/lucaskraat/Desktop/MILITARY/REGULATIONS/MEMO.docx"
                
                if not os.path.exists(docx_template):
                    self.send_error(404, f"Template file MEMO.docx not found at {docx_template}")
                    return
                
                # We will generate in-memory docx file
                out_buffer = io.BytesIO()
                with zipfile.ZipFile(docx_template, 'r') as yin:
                    with zipfile.ZipFile(out_buffer, 'w') as yout:
                        for item in yin.infolist():
                            content = yin.read(item.filename)
                            if item.filename == 'word/document.xml':
                                root = ET.fromstring(content)
                                ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                                
                                p_elements = root.findall('.//w:p', ns)
                                body = root.find('.//w:body', ns)
                                
                                def format_p_arial12(p_elem):
                                    pPr = p_elem.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
                                    if pPr is None:
                                        pPr = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
                                        p_elem.insert(0, pPr)
                                    rPr = pPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
                                    if rPr is None:
                                        rPr = ET.SubElement(pPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
                                    rFonts = rPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts')
                                    if rFonts is None:
                                        rFonts = ET.SubElement(rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts')
                                    rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ascii', 'Arial')
                                    rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hAnsi', 'Arial')
                                    sz = rPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz')
                                    if sz is None:
                                        sz = ET.SubElement(rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz')
                                    sz.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '24')
                                    
                                    for r in p_elem.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r', ns):
                                        r_rPr = r.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
                                        if r_rPr is None:
                                            r_rPr = ET.SubElement(r, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
                                        r_rFonts = r_rPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts')
                                        if r_rFonts is None:
                                            r_rFonts = ET.SubElement(r_rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts')
                                        r_rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ascii', 'Arial')
                                        r_rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hAnsi', 'Arial')
                                        r_sz = r_rPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz')
                                        if r_sz is None:
                                            r_sz = ET.SubElement(r_rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz')
                                        r_sz.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '24')

                                # Update date (index 28) and clear other runs in date paragraph
                                if len(p_elements) > 28:
                                    date_p = p_elements[28]
                                    date_ts = date_p.findall('.//w:t', ns)
                                    if date_ts:
                                        date_ts[0].text = date_val
                                        for t_elem in date_ts[1:]:
                                            t_elem.text = ""
                                    format_p_arial12(date_p)
                                
                                # Update subject (index 33) and clear other runs in subject paragraph
                                if len(p_elements) > 33:
                                    subj_p = p_elements[33]
                                    subj_ts = subj_p.findall('.//w:t', ns)
                                    if subj_ts:
                                        subj_ts[0].text = subject_val.upper() # AR 25-50: Subject line in uppercase
                                        for t_elem in subj_ts[1:]:
                                            t_elem.text = ""
                                    format_p_arial12(subj_p)
                                        
                                # Function to insert paragraphs before the continuous section break
                                def append_p(p_elem):
                                    sectPr = body.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sectPr')
                                    if sectPr is not None:
                                        children = list(body)
                                        idx = children.index(sectPr)
                                        body.insert(idx, p_elem)
                                    else:
                                        body.append(p_elem)

                                # Create a paragraph with specific left indent, Arial, 12pt
                                def create_p(text, indent_inches=0.0):
                                    p_elem = ET.Element('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')
                                    pPr = ET.SubElement(p_elem, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}pPr')
                                    
                                    if indent_inches > 0.0:
                                        ind = ET.SubElement(pPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ind')
                                        dxa = int(indent_inches * 1440)
                                        ind.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}left', str(dxa))
                                    
                                    rPr = ET.SubElement(pPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
                                    rFonts = ET.SubElement(rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts')
                                    rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ascii', 'Arial')
                                    rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hAnsi', 'Arial')
                                    sz = ET.SubElement(rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz')
                                    sz.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '24')
                                    
                                    spacing = ET.SubElement(pPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}spacing')
                                    spacing.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}after', '0')
                                    spacing.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}before', '0')
                                    spacing.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}lineRule', 'auto')
                                    
                                    r = ET.SubElement(p_elem, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}r')
                                    r_rPr = ET.SubElement(r, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr')
                                    r_rFonts = ET.SubElement(r_rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts')
                                    r_rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}ascii', 'Arial')
                                    r_rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}hAnsi', 'Arial')
                                    r_sz = ET.SubElement(r_rPr, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}sz')
                                    r_sz.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val', '24')
                                    
                                    t = ET.SubElement(r, '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                                    t.text = text
                                    return p_elem

                                # Remove the template's empty signature placeholder paragraph (Paragraph 35, index 34) if it exists
                                if len(body) > 34:
                                    last_p = body[34]
                                    if last_p.tag.endswith('p'):
                                        t_elems = last_p.findall('.//w:t', ns)
                                        text = "".join([t.text for t in t_elems if t.text])
                                        if not text.strip():
                                            body.remove(last_p)

                                # Add two blank lines between subject and body (making text start on the 3rd line below subject)
                                append_p(create_p("", indent_inches=0.75))
                                append_p(create_p("", indent_inches=0.75))
                                
                                for p_text in paragraphs:
                                    # Strip leading spaces and indent appropriately
                                    if p_text.startswith("   "):
                                        indent = 1.00 # 0.25 margin + 0.75 indent + 0.25 extra
                                        cleaned_text = p_text[3:]
                                    elif p_text.startswith("  "):
                                        indent = 1.00
                                        cleaned_text = p_text[2:]
                                    else:
                                        indent = 0.75 # 0.25 margin + 0.75 indent = 1.00 inch margin
                                        cleaned_text = p_text
                                    
                                    append_p(create_p(cleaned_text, indent_inches=indent))
                                    
                                # AR 25-50: Signature block starts on 5th line below text (so 4 spacer lines)
                                for _ in range(4):
                                    append_p(create_p("", indent_inches=0.75))
                                    
                                for sig_line in signature_lines:
                                    # Left margin 0.25 + left indent 4.00 = 4.25 (center of the page)
                                    append_p(create_p(sig_line, indent_inches=4.00))
                                    
                                modified_data = ET.tostring(root, encoding='utf-8', method='xml')
                                yout.writestr(item.filename, modified_data)
                            else:
                                yout.writestr(item.filename, content)
                
                # Send modified file as attachment
                docx_bytes = out_buffer.getvalue()
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Content-Length', str(len(docx_bytes)))
                self.end_headers()
                self.wfile.write(docx_bytes)
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f"Error generating DOCX: {e}".encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == "__main__":
    # Allow socket address reuse to avoid "address already in use" errors during quick restarts
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
