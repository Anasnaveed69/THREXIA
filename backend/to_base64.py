import base64

with open(r"d:\Github\THREXIA\frontend\public\logo.png", "rb") as image_file:
    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    print(encoded_string)
