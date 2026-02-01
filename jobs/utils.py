from pdfminer.high_level import extract_text
import io

def extract_text_from_pdf(pdf_file):
    """
    Extracts text from a PDF file.
    Args:
        pdf_file: A Django UploadedFile object or a file path.
    Returns:
        str: The extracted text or empty string on failure.
    """
    try:
        # If it's an uploaded file (InMemoryUploadedFile or TemporaryUploadedFile)
        if hasattr(pdf_file, 'read'):
             # pdfminer extract_text expects a path or a binary file stream
             text = extract_text(pdf_file)
        else:
             text = extract_text(pdf_file)
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""
