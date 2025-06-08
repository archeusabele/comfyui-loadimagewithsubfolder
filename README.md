# comfyui-loadimagewithsubfolder

## Changes in This Fork

This is a fork of [@liangt/comfyui-loadimagewithsubfolder](https://github.com/liangt/comfyui-loadimagewithsubfolder) with enhanced image file type support.

Pulling from the original repository, I was not able to see any image file type other than JPG. Now, in addition to the original owner's support for JPG, PNG, and WEBP formats, the extended list of file types is completely supported by the node.

### Enhanced Features

#### 1. Added Image File Types

Extended support for additional image formats beyond the standard PNG/JPG/WEBP:

- **BMP** - Windows bitmap format
- **GIF** - Graphics Interchange Format (animated support)
- **TIFF** - Tagged Image File Format (high quality, lossless)
- **TGA** - Truevision TGA/TARGA format

**Supported formats:** JPG, JPEG, PNG, WEBP, BMP, GIF, TIFF, TGA (both lowercase and uppercase extensions)

#### 2. Fixed Workflow Persistence Issues

Resolved critical issues with workflow restoration after ComfyUI restarts:

- **Image Selection Preserved**: Selected images are now properly restored when reloading workflows
- **Node Functionality Maintained**: Nodes remain fully functional after ComfyUI restart - no need to recreate them
- **Independent Node State**: Multiple node instances each maintain their own separate image selections
- **Smart Restoration Logic**: Prevents cross-node interference during workflow loading
- **Improved Error Handling**: Better handling of missing files and API failures
- **Enhanced State Management**: Robust serialization ensures all node state is properly saved and restored

**Key improvements:**
- Subfolder paths and selected images persist across ComfyUI sessions
- Image picker dropdown is automatically repopulated on workflow load
- No more "undefined" values after restart
- Nodes can be reused indefinitely without recreation
- Multiple node instances maintain independent state - each node remembers its own image selection
- Smart restoration logic prevents nodes from interfering with each other during workflow loading
- Robust error handling for missing files and network issues

*The fixes are backward compatible and don't change the node's API or user interface. Simply restart ComfyUI after these changes, and your existing workflows should work perfectly with full persistence support!*

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
