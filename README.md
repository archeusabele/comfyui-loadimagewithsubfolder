# comfyui-loadimagewithsubfolder

## Changes in This Fork

This is a fork of [@liangt/comfyui-loadimagewithsubfolder](https://github.com/liangt/comfyui-loadimagewithsubfolder) with enhanced image file type support.

Pulling from the original repository, I was not able to see any image file type other than JPG. Now, in addition to the original owner's support for JPG, PNG, and WEBP formats, the extended list of file types is completely supported by the node.

### Added Image File Types

Extended support for additional image formats beyond the standard PNG/JPG/WEBP:

- **BMP** - Windows bitmap format
- **GIF** - Graphics Interchange Format (animated support)
- **TIFF** - Tagged Image File Format (high quality, lossless)
- **TGA** - Truevision TGA/TARGA format

**Supported formats:** JPG, JPEG, PNG, WEBP, BMP, GIF, TIFF, TGA (both lowercase and uppercase extensions)

---

## Original Description

Extend comfyui LoadImage node with subfolder support.

It allows you to select images from folders in the input directory.

* the default value of subfolder is a empty string, which means to load the images in the input directory
![image](https://liangt.github.io/assets/comfyui-loadimagewithsubfolder/image1.png)
* you can input a subfolder name (or a path) to load the images in the subfolder
![image](https://liangt.github.io/assets/comfyui-loadimagewithsubfolder/image2.png)
* if the input subfolder doesn't exist or no images in it, you will get a result as follow
![image](https://liangt.github.io/assets/comfyui-loadimagewithsubfolder/image3.png)
