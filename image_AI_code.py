# install ///////////////////////
# %pip install boto3 numpy pillow matplotlib --quiet

# Restart kernel
# from IPython.core.display import HTML

# HTML("<script>Jupyter.notebook.kernel.restart()</script>")

# from pathlib import Path

# Path("output").mkdir(parents=True, exist_ok=True)

# Exploring the "seed" parameter ///////////////////////

# import io
# import json
# import base64
# import boto3
# from botocore.config import Config
# from PIL import Image
# from utils import save_image, plot_images, plot_images_for_comparison

# bedrock_runtime_client = boto3.client(
#     "bedrock-runtime",
#     region_name="us-east-1",
#     config=Config(
#         read_timeout=5 * 60
#     ),  # IMPORTANT: Increase the read timeout to 5 minutes to support longer operations.
# )
# image_generation_model_id = "amazon.nova-canvas-v1:0"
# output_dir = "output"



# # Define the main input parameters.
# text = "A men's collared white t-shirt, with a dog image in the center; the whole shirt is visible"
# seed_values = [1, 12, 20]  # Any number from 0 through 858,993,459

# generated_images = []

# # Generate image using only a text prompt.
# for index, seed in enumerate(seed_values):
#     body = json.dumps(
#         {
#             "taskType": "TEXT_IMAGE",
#             "textToImageParams": {"text": text},
#             "imageGenerationConfig": {
#                 "numberOfImages": 1,  # Number of images to generate, up to 5
#                 "width": 1024,
#                 "height": 1024,
#                 "cfgScale": 6.5,  # How closely the prompt will be followed
#                 "seed": seed,  # Any number from 0 through 858,993,459
#                 "quality": "premium",  # Quality of either "standard" or "premium"
#             },
#         }
#     )

#     print(f"Generating image {index + 1} of {len(seed_values)}...")

#     response = bedrock_runtime_client.invoke_model(
#         body=body,
#         modelId=image_generation_model_id,
#         accept="application/json",
#         contentType="application/json",
#     )

#     response_body = json.loads(response.get("body").read())

#     base64_images = response_body.get("images")
#     image_path = f"{output_dir}/01-text-to-image_seed-{seed}.png"
#     save_image(base64_images[0], image_path)

#     print(f"Saved to {image_path}")

#     generated_img = [
#         Image.open(io.BytesIO(base64.b64decode(base64_image)))
#         for base64_image in base64_images
#     ]
#     generated_images.append(generated_img[0])

# # Plot comparison images
# plot_images_for_comparison(
#     generated_images=generated_images,
#     labels=seed_values,
#     prompt=text,
#     comparison_mode=True,
#     title_prefix="Seed",
# )

# Exploring resolution and aspect ratio ///////////////////////

# # Define the main input parameters.
# text = "A men's collared white t-shirt, with a dog in the center; the whole shirt is visible"
# ratio_values = [(1024, 1024), (1280, 720), (672, 1024)]
# seed = 12

# generated_images = []

# # Generate image using only a text prompt.
# for index, ratio in enumerate(ratio_values):
#     body = json.dumps(
#         {
#             "taskType": "TEXT_IMAGE",
#             "textToImageParams": {"text": text},  # A description of what to generate
#             "imageGenerationConfig": {
#                 "numberOfImages": 1,  # Number of images to generate, up to 5.
#                 "width": ratio[0],
#                 "height": ratio[1],
#                 "cfgScale": 6.5,  # How closely the prompt will be followed
#                 "seed": seed,  # Any number from 0 through 858,993,459
#                 "quality": "standard",  # Either "standard" or "premium".
#             },
#         }
#     )

#     print(f"Generating image {index + 1} of {len(ratio_values)}...")

#     response = bedrock_runtime_client.invoke_model(
#         body=body,
#         modelId=image_generation_model_id,
#         accept="application/json",
#         contentType="application/json",
#     )

#     response_body = json.loads(response.get("body").read())

#     base64_images = response_body.get("images")
#     image_path = f"{output_dir}/01-text-to-image_resolution-{ratio[0]}x{ratio[1]}.png"
#     save_image(base64_images[0], image_path)

#     print(f"Saved to {image_path}")

#     generated_img = [
#         Image.open(io.BytesIO(base64.b64decode(base64_image)))
#         for base64_image in base64_images
#     ]
#     generated_images.append(generated_img[0])

# # Plot comparison images
# plot_images_for_comparison(
#     generated_images=generated_images,
#     labels=ratio_values,
#     prompt=text,
#     comparison_mode=True,
#     title_prefix="Ratio",
# )


# Exploring the "cfgScale" parameter ///////////////////////

# Define the main input parameters.
text = "A collared white t-shirt with a dog image in the center, the T-shirt is displayed on a headless white mannequin in an skate shop"
cfg_scale = [1.1, 6.5, 10]
seed = 42

generated_images = []

# Generate image without reference
for index, cfg in enumerate(cfg_scale):
    body = json.dumps(
        {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {"text": text},
            "imageGenerationConfig": {
                "numberOfImages": 1,  # Number of images to generate, up to 5.
                "width": 1024,
                "height": 1024,
                "cfgScale": cfg,  # How closely the prompt will be followed
                "seed": seed,  # Any number from 0 through 858,993,459
                "quality": "standard",  # Either "standard" or "premium".
            },
        }
    )

    print(f"Generating image {index + 1} of {len(cfg_scale)}...")

    response = bedrock_runtime_client.invoke_model(
        body=body,
        modelId=image_generation_model_id,
        accept="application/json",
        contentType="application/json",
    )

    response_body = json.loads(response.get("body").read())

    base64_images = response_body.get("images")
    image_path = f"{output_dir}/01-text-to-image_cfgScale-{cfg}.png"
    save_image(base64_images[0], image_path)

    print(f"Saved to {image_path}")

    generated_img = [
        Image.open(io.BytesIO(base64.b64decode(base64_image)))
        for base64_image in base64_images
    ]
    generated_images.append(generated_img[0])

# Plot comparison images
plot_images_for_comparison(
    generated_images=generated_images,
    labels=cfg_scale,
    prompt=text,
    comparison_mode=True,
    title_prefix="Strength",
)

# Inpainting with a mask prompt ///////////////////////

import io
import json
import base64
import boto3
from botocore.config import Config
from PIL import Image
from utils import save_image, plot_images

bedrock_runtime_client = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    config=Config(
        read_timeout=5 * 60
    ),  # IMPORTANT: Increase the read timeout to 5 minutes to support longer operations.
)
image_generation_model_id = "amazon.nova-canvas-v1:0"
output_dir = "output"


# Define the main input parameters.
reference_image_path = "data/text-to-image_seed-1.png"
mask_prompt = "dog image"

text = "a white tshirt with a palm tree graphic"
negative_text = (
    "colorful"  # We're using a negative prompt to encourage a monochromatic graphic
)

seed = 0

#/////////////////////////////////////////


with open(reference_image_path, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Generate image condition on reference image
body = json.dumps(
    {
        "taskType": "INPAINTING",
        "inPaintingParams": {
            "text": text,  # What to generate in the masked area
            "negativeText": negative_text,  # What to avoid generating inside the mask
            "image": reference_image_base64,  # The image to edit
            "maskPrompt": mask_prompt,  # A description of the area(s) of the image to change
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,  # Number of images to generate, up to 5.
            "cfgScale": 6.5,  # How closely the prompt will be followed
            "seed": seed,  # Any number from 0 through 858,993,459
            "quality": "standard",  # Either "standard" or "premium". Defaults to "standard".
        },
    }
)

print("Generating image...")

response = bedrock_runtime_client.invoke_model(
    body=body,
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body = json.loads(response.get("body").read())

base64_images = response_body.get("images")
image_path = f"{output_dir}/02-inpainting-with-mask-prompt.png"
save_image(base64_images[0], image_path)

print(f"Image saved to {image_path}")

response_images = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in base64_images
]

plot_images(response_images, ref_image_path=reference_image_path)


# Inpainting with a mask image ///////////////////////

# Define the main input parameters.
reference_image_path = "data/text-to-image_seed-1.png"
mask_image_path = "data/text-to-image_seed-1_mask.png"

text = "a white tshirt with a palm tree graphic"
negative_text = "colorful"

seed = 100






with open(reference_image_path, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

with open(mask_image_path, "rb") as image_file:
    image_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Generate image condition on reference image
body = json.dumps(
    {
        "taskType": "INPAINTING",
        "inPaintingParams": {
            "text": text,  # What to generate in the masked area
            "negativeText": negative_text,  # What to avoid generating inside the mask
            "image": reference_image_base64,  # The image to edit
            "maskImage": image_image_base64,  # A black and white image defining the mask
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,  # Number of images to generate, up to 5
            "cfgScale": 6.5,  # How closely the prompt will be followed
            "seed": seed,  # Any number from 0 through 858,993,459
            "quality": "standard",  # Either "standard" or "premium". Defaults to "standard".
        },
    }
)

print("Generating image...")

response = bedrock_runtime_client.invoke_model(
    body=body,
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body = json.loads(response.get("body").read())

base64_images = response_body.get("images")
image_path = f"{output_dir}/02-inpainting-with-mask-image.png"
save_image(base64_images[0], image_path)

print(f"Image saved to {image_path}")

response_images = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body.get("images")
]

plot_images(response_images, ref_image_path=reference_image_path)

# Replace background with mask prompt ///////////////////////

# Define the main input parameters.
reference_image_path = "data/tshirt_palm_tree.png"
mask_prompt = "shirt"

text = "a man with tanned skin stands on a beautiful sandy beach wearing a t-shirt, clear sky and surf in the background"
outpainting_mode = "PRECISE"  # Either "DEFAULT" or "PRECISE"

seed = 97






with open(reference_image_path, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Generate image condition on reference image
body = json.dumps(
    {
        "taskType": "OUTPAINTING",
        "outPaintingParams": {
            "text": text,  # A description of the final desired image
            "image": reference_image_base64,  # The image to edit
            "maskPrompt": mask_prompt,  # One of "maskImage" or "maskPrompt" is required
            "outPaintingMode": outpainting_mode,  # Either "DEFAULT" or "PRECISE"
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,  # Number of images to generate, up to 5.
            "cfgScale": 6.5,  # How closely the prompt will be followed
            "seed": seed,  # Any number from 0 through 858,993,459
            "quality": "standard",  # Either "standard" or "premium". Defaults to "standard".
        },
    }
)

print("Generating image...")

response = bedrock_runtime_client.invoke_model(
    body=body,
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body = json.loads(response.get("body").read())

base64_images = response_body.get("images")
image_path = f"{output_dir}/03-outpainting_mask-prompt.png"
save_image(base64_images[0], image_path)

print(f"Image saved to {image_path}")

response_images = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in base64_images
]

plot_images(response_images, ref_image_path=reference_image_path)


# Image extension ///////////////////////

# Define the main input parameters.
reference_image_path = "data/tshirt_beach_1024x1024.png"
text = "a man with tanned skin stands on a beautiful sandy beach wearing a t-shirt, clear sky and surf in the background"
seed = 95

# Extension settings
target_width = 2048
target_height = 1024
horizontal_position_percent = 1.0  # Position the original image at far right
vertical_position_percent = 0.5  # Center vertically







def convertImageToPngBase64(image):
    """
    Converts an image to PNG format and returns the base64-encoded
    representation of that PNG.
    """
    mem_file = io.BytesIO()
    image.save(mem_file, format="PNG")
    mem_file.seek(0)
    png_bytes = mem_file.read()

    return base64.b64encode(png_bytes).decode("utf-8")


# Load reference image
original_image = Image.open(reference_image_path)
original_width, original_height = original_image.size

# Calculate the position of the original image on the expanded canvas.
position = (
    int((target_width - original_width) * horizontal_position_percent),
    int((target_height - original_height) * vertical_position_percent),
)

# Create an input image which contains the original image with an expanded
# canvas. Save it for future reference.
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
input_image = Image.new("RGB", (target_width, target_height), (230, 230, 230))
input_image.paste(original_image, position)
expanded_image_base64 = convertImageToPngBase64(input_image)

# Create mask that matches the canvas size and masks the place where the
# original image is positioned.
mask_image = Image.new("RGB", (target_width, target_height), WHITE)
original_image_shape = Image.new("RGB", (original_width, original_height), BLACK)
mask_image.paste(original_image_shape, position)
mask_image_base64 = convertImageToPngBase64(mask_image)

# Save the expanded image and image mask for demonstratoin.
input_image.save("output/03-outpainting_extension-source.png")
mask_image.save("output/03-outpainting_extension-mask.png")

# Generate image condition on reference image
body = json.dumps(
    {
        "taskType": "OUTPAINTING",
        "outPaintingParams": {
            "text": text,
            "image": expanded_image_base64,
            "maskImage": mask_image_base64,
            "outPaintingMode": "DEFAULT",
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,
            "seed": seed,
            "quality": "standard",
            "cfgScale": 6.5,
        },
    }
)

print("Generating image...")

response = bedrock_runtime_client.invoke_model(
    body=body,
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body = json.loads(response.get("body").read())

base64_images = response_body.get("images")
image_path = f"{output_dir}/03-outpainting_extended-image.png"
save_image(base64_images[0], image_path)

print(f"Image saved to {image_path}")

response_images = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body.get("images")
]

plot_images(response_images, ref_image_path=reference_image_path)

# Creating variants of an input image ///////////////////////

# Define the main input parameters.
reference_image_path = "data/wedding_dress.png"
similarity_strength = (
    0.7  # How strongly the input images influence the output. From 0.2 through 1.
)

text = "A pink wedding dress"

seed = 1






# Encode the reference image
with open(reference_image_path, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

print("Generating image without a reference image...")

# Generate image without reference
response_without_ref = bedrock_runtime_client.invoke_model(
    body=json.dumps(
        {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {"text": text},
            "imageGenerationConfig": {
                "numberOfImages": 1,  # Number of images to generate, up to 5.
                "cfgScale": 6.5,  # How closely the prompt will be followed
                "seed": seed,  # Any number from 0 through 858,993,459
                "quality": "standard",  # Either "standard" or "premium". Defaults to "standard".
            },
        }
    ),
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body_without_ref = json.loads(response_without_ref.get("body").read())

images_without_ref = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body_without_ref.get("images")
]

# Save output
image_without_reference_path = f"{output_dir}/05-image-variation_no-reference.png"
save_image(response_body_without_ref.get("images")[0], image_without_reference_path)
print(f"Saved image without reference to {image_without_reference_path}")

print("Generating image with a reference image...")

# Generate image with referece (Image variation feature)
response_with_ref = bedrock_runtime_client.invoke_model(
    body=json.dumps(
        {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": text,
                "images": [
                    reference_image_base64
                ],  # May provide up to 5 reference images here
                "similarityStrength": similarity_strength,  # How strongly the input images influence the output. From 0.2 through 1.
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,  # Number of images to generate, up to 5.
                "cfgScale": 6.5,  # How closely the prompt will be followed
                "seed": seed,  # Any number from 0 through 858,993,459
                "quality": "standard",  # Either "standard" or "premium". Defaults to "standard".
            },
        }
    ),
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body_with_ref = json.loads(response_with_ref.get("body").read())

images_with_ref = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body_with_ref.get("images")
]

# Save output
image_with_reference_path = f"{output_dir}/05-image-variation_with-reference.png"
save_image(response_body_with_ref.get("images")[0], image_with_reference_path)
print(f"Saved image with reference to {image_with_reference_path}")

# Plot output
plot_images_for_comparison(
    ref_image_path=reference_image_path,
    base_images=images_without_ref,
    custom_images=images_with_ref,
    prompt=text,
)





# Using image variation for style transfer ///////////////////////

# Define the main input parameters.
reference_image_path = "data/designer_sketch_dress.png"
similarity_strength = (
    0.5  # How strongly the input images influence the output. From 0.2 through 1.
)

text = "a wedding tuxedo for groom"

seed = 1



# Encode the reference image
with open(reference_image_path, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

print("Generating image without a reference image...")

# Generate image without reference
response_without_ref = bedrock_runtime_client.invoke_model(
    body=json.dumps(
        {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {"text": text},
            "imageGenerationConfig": {
                "numberOfImages": 1,  # Number of images to generate, up to 5
                "width": 1024,
                "height": 1024,
                "cfgScale": 6.5,  # How closely the prompt will be followed
                "seed": seed,
                "quality": "standard",  # Quality of either "standard" or "premium"
            },
        }
    ),
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body_without_ref = json.loads(response_without_ref.get("body").read())

images_without_ref = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body_without_ref.get("images")
]

# Save output
image_without_reference_path = (
    f"{output_dir}/05-image-variation_style-transfer_no-reference.png"
)
save_image(response_body_without_ref.get("images")[0], image_without_reference_path)
print(f"Saved image without reference to {image_without_reference_path}")

print("Generating image with a reference image...")

# Generate image with referece (Image variation feature)
response_with_ref = bedrock_runtime_client.invoke_model(
    body=json.dumps(
        {
            "taskType": "IMAGE_VARIATION",
            "imageVariationParams": {
                "text": text,
                "images": [reference_image_base64],  # Up to 5 reference images
                "similarityStrength": similarity_strength,  # How strongly the input images influence the output. From 0.2 through 1.
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,  # Number of images to generate, up to 5
                "width": 1024,
                "height": 1024,
                "cfgScale": 6.5,  # How closely the prompt will be followed
                "seed": seed,
                "quality": "standard",  # Quality of either "standard" or "premium"
            },
        }
    ),
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body_with_ref = json.loads(response_with_ref.get("body").read())

images_with_ref = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body_with_ref.get("images")
]

# Save output
image_with_reference_path = (
    f"{output_dir}/05-image-variation_style-transfer_with-reference.png"
)
save_image(response_body_with_ref.get("images")[0], image_with_reference_path)
print(f"Saved image with reference to {image_with_reference_path}")

# Plot output
plot_images_for_comparison(
    ref_image_path=reference_image_path,
    base_images=images_without_ref,
    custom_images=images_with_ref,
    prompt=text,
)



# Adjusting the Similarity Strength Parameter ///////////////////////

# Define the main input parameters.
reference_image_path = "data/cartoon_wedding.png"
similarity_strength_values = [0.2, 0.65, 1.0]  # Values can range from 0.2 through 1.0

text = "An elegant white wedding dress displayed in a glass showcase"

seed = 30





# Encode the reference image
with open(reference_image_path, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Generate image with different similarityStrength values
generated_images = []
for index, similarity_strength in enumerate(similarity_strength_values):
    print(f"Generating image {index+1} of {len(similarity_strength_values)}...")

    response = bedrock_runtime_client.invoke_model(
        body=json.dumps(
            {
                "taskType": "IMAGE_VARIATION",
                "imageVariationParams": {
                    "text": text,
                    "images": [reference_image_base64],  # Up to 5 reference images
                    "similarityStrength": similarity_strength,  # How strongly the input images influence the output. From 0.2 through 1.
                },
                "imageGenerationConfig": {
                    "numberOfImages": 1,  # Number of images to generate, up to 5
                    "cfgScale": 6.5,  # How closely the prompt will be followed
                    "seed": seed,
                    "quality": "standard",  # Quality of either "standard" or "premium"
                },
            }
        ),
        modelId=image_generation_model_id,
        accept="application/json",
        contentType="application/json",
    )

    response_body = json.loads(response.get("body").read())

    base64_images = response_body.get("images")
    image_path = f"{output_dir}/05-image-variation_similarity-{similarity_strength}.png"
    save_image(base64_images[0], image_path)
    print(f"Saving to {image_path}")

    generated_img = [
        Image.open(io.BytesIO(base64.b64decode(base64_image)))
        for base64_image in base64_images
    ]
    generated_images.append(generated_img[0])

# Plot comparison images
plot_images_for_comparison(
    generated_images=generated_images,
    labels=similarity_strength_values,
    prompt=text,
    comparison_mode=True,
    title_prefix="Similarity Strength",
)











# Exploring the "SEGMENTATION" control mode ///////////////////////

# Conditioning parameters
condition_image = "data/designer_sketch_dress.png"
control_mode = "SEGMENTATION"
control_strength = 0.4  # Range: 0.2 to 1.0

prompt = "fashion photo of a woman in an elegant wedding dress, coastal backdrop"

# The output width and height should match the aspect ratio of the condition
# image for best results
width = 1024
height = 1024

seed = 102






# Encode the reference image
with open(condition_image, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Generate image condition on reference image
body = json.dumps(
    {
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": prompt,  # Required
            "conditionImage": reference_image_base64,  # Optional
            "controlMode": control_mode,  # Optional: CANNY_EDGE | SEGMENTATION
            "controlStrength": control_strength,  # Range: 0.2 to 1.0,
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,  # Number of images to generate, up to 5
            "width": width,
            "height": height,
            "cfgScale": 6.5,  # How closely the prompt will be followed
            "seed": seed,
            "quality": "premium",  # Quality of either "standard" or "premium"
        },
    }
)

print("Generating image...")

response = bedrock_runtime_client.invoke_model(
    body=body,
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body = json.loads(response.get("body").read())
response_images = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body.get("images")
]

# save output
output_image_path = f"{output_dir}/06-image-conditioning.png"
save_image(response_body.get("images")[0], output_image_path)
print(f"Image saved to {output_image_path}")

# plot output
plot_image_conditioning(condition_image, response_images, prompt)



# Exploring "CANNY_EDGE" conditioning ///////////////////////

# Conditioning parameters
condition_image = "data/wedding_dress_details.png"
control_mode = "CANNY_EDGE"
control_strength = 0.9  # Range: 0 through 1.0

# The output width and height should match the aspect ratio of the condition
# image for best results
width = 720
height = 1024

prompt = "A light blue dress with elegant details"

seed = 99  # Can be any number between 0 to 214783647





# Encode the reference image
with open(condition_image, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Generate image condition on reference image
body = json.dumps(
    {
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {
            "text": prompt,
            "conditionImage": reference_image_base64,
            "controlMode": control_mode,  # "CANNY_EDGE" or "SEGMENTATION"
            "controlStrength": control_strength,  # Range: 0 to 1.0,
        },
        "imageGenerationConfig": {
            "numberOfImages": 1,  # Number of images to generate, up to 5
            "cfgScale": 6.5,  # How closely the prompt will be followed
            "width": width,
            "height": height,
            "seed": seed,
            "quality": "standard",  # Quality of either "standard" or "premium"
        },
    }
)

print("Generating image...")

response = bedrock_runtime_client.invoke_model(
    body=body,
    modelId=image_generation_model_id,
    accept="application/json",
    contentType="application/json",
)

response_body = json.loads(response.get("body").read())
response_images = [
    Image.open(io.BytesIO(base64.b64decode(base64_image)))
    for base64_image in response_body.get("images")
]

# Save output
output_image_path = f"{output_dir}/06-image-conditioning_canny-edge.png"
save_image(response_body.get("images")[0], output_image_path)
print(f"Image saved to {output_image_path}")

# Plot output
plot_image_conditioning(condition_image, response_images, prompt)





# Exploring the "controlStrength" parameter ///////////////////////

# Conditioning parameters
condition_image = "data/evening_gown.png"
control_mode = "CANNY_EDGE"
control_strength_values = [0, 0.25, 1.0]  # Range: 0 through 1.0

prompt = "a women's T-shirt and short jeans showcased in a shopping window"

# The output width and height should match the aspect ratio of the condition
# image for best results
width = 1024
height = 1024

seed = 102  # 100  # Can be any random number between 0 to 214783647





# Encode the reference image
with open(condition_image, "rb") as image_file:
    reference_image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Generate image with different similarityStrength values
generated_images = []
for index, control_strength in enumerate(control_strength_values):
    print(f"Generating image {index+1} of {len(control_strength_values)}...")

    response = bedrock_runtime_client.invoke_model(
        body=json.dumps(
            {
                "taskType": "TEXT_IMAGE",
                "textToImageParams": {
                    "text": prompt,  # Required
                    "conditionImage": reference_image_base64,  # Optional
                    "controlMode": control_mode,  # Optional: CANNY_EDGE | SEGMENTATION
                    "controlStrength": control_strength,  # Range: 0.2 to 1.0,
                },
                "imageGenerationConfig": {
                    "numberOfImages": 1,  # Number of images to generate, up to 5
                    "cfgScale": 6.5,  # How closely the prompt will be followed
                    "width": width,
                    "height": height,
                    "seed": seed,
                    "quality": "standard",  # Quality of either "standard" or "premium"
                },
            }
        ),
        modelId=image_generation_model_id,
        accept="application/json",
        contentType="application/json",
    )

    response_body = json.loads(response.get("body").read())

    # Save the image
    output_image_path = (
        f"{output_dir}/06-image-conditioning_controlStrength_{control_strength}.png"
    )
    base64_images = response_body.get("images")
    save_image(base64_images[0], output_image_path)
    print(f"Image saved to {output_image_path}")

    generated_img = [
        Image.open(io.BytesIO(base64.b64decode(base64_image)))
        for base64_image in response_body.get("images")
    ]
    generated_images.append(generated_img[0])

# plot comparison images
plot_image_conditioning(
    condition_image,
    generated_images=generated_images,
    control_strength_values=control_strength_values,
    prompt=prompt,
    comparison_mode=True,
)







# Color conditioning with color values ///////////////////////

# Define a prompt template and a set of "pattern" values that will be used with the template.
prompt_template = Template("a patterned bowtie, $pattern, on solid white background")
patterns = ["paisley", "striped", "floral"]

# Define the main input parameters.
colors = ["#FFFFFF", "#FF9900", "#F2F2F2", "#232F3E"]
seed = 35





generated_images = []

# Generate images for each pattern.
for index, pattern in enumerate(patterns):

    # Generate image condition on color palette
    body = json.dumps(
        {
            "taskType": "COLOR_GUIDED_GENERATION",
            "colorGuidedGenerationParams": {
                "text": prompt_template.substitute({"pattern": pattern}),
                "colors": colors,
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,  # Number of images to generate, up to 5
                "cfgScale": 6.5,  # How closely the prompt will be followed
                "width": 1024,
                "height": 1024,
                "seed": seed,
                "quality": "standard",  # Quality of either "standard" or "premium"
            },
        }
    )

    print(f"Generating image {index + 1} of {len(patterns)}...")

    response = bedrock_runtime_client.invoke_model(
        body=body,
        modelId=image_generation_model_id,
        accept="application/json",
        contentType="application/json",
    )

    response_body = json.loads(response.get("body").read())

    base64_images = response_body.get("images")
    image_path = f"{output_dir}/07-color-conditioning_pattern-{pattern}.png"
    save_image(base64_images[0], image_path)
    print(f"Saved image to {image_path}")

    generated_img = [
        Image.open(io.BytesIO(base64.b64decode(base64_image)))
        for base64_image in base64_images
    ]
    generated_images.append(generated_img[0])

# Display the color palette.
color_palette_image = create_color_palette_image(
    colors, width=400, height=50, border_color="#cccccc", border_width=2
)
display(color_palette_image)

# Plot comparison images
plot_images_for_comparison(
    generated_images=generated_images,
    labels=patterns,
    prompt=prompt_template.substitute({"pattern": "#pattern"}),
    comparison_mode=True,
    title_prefix="Pattern:",
)























