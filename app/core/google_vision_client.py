import io
from google.cloud import vision

def extract_text_from_image_io(image_content):
    """Detects text in an image using in-memory bytes."""
    client = vision.ImageAnnotatorClient()

    # Use in-memory bytes (content passed in)
    image = vision.Image(content=image_content)

    # Perform text detection using Google Vision
    response = client.text_detection(image=image)
    texts = response.text_annotations

    if response.error.message:
        raise Exception(f'{response.error.message}')

    # The first entry in the response contains the full detected text
    if texts:
        return texts[0].description  # Full text extracted from the image
    else:
        return "No text found"
