import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js"


// Load Image With Subfolder (Advanced)
app.registerExtension({
	name: "LoadImageWithSubfolderAdvanced",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "LoadImageWithSubfolder") {
			if (nodeData?.input?.required?.image?.[1]?.image_upload === true) {
				nodeData.input.required.upload = ["IMAGELOADER"];
			}
		}
	},

	async nodeCreated(node) {
		if (node.comfyClass === "LoadImageWithSubfolder") {
			// Store reference for workflow restoration
			node._loadImageWithSubfolderInitialized = false;

			const originalOnConfigure = node.onConfigure;
			node.onConfigure = function(info) {
				if (originalOnConfigure) {
					originalOnConfigure.call(this, info);
				}
				// Re-initialize after configuration to handle workflow loading
				setTimeout(() => {
					if (!this._loadImageWithSubfolderInitialized) {
						this._loadImageWithSubfolderInitialized = true;
						const subfolderWidget = this.widgets.find((w) => w.name === "subfolder");
						const imageWidget = this.widgets.find((w) => w.name === "image");
						
						if (subfolderWidget && imageWidget && imageWidget.value && imageWidget.value !== "undefined") {
							// Store the current image value for this specific node
							const currentImageValue = imageWidget.value;
							const currentSubfolderValue = subfolderWidget.value;
							
							console.log(`LoadImageWithSubfolder-Advanced: Restoring node ${this.id} with image: ${currentImageValue}, subfolder: ${currentSubfolderValue}`);
							
							// Trigger a refresh to restore the image picker for this specific node
							getImages(currentSubfolderValue || "", true, currentImageValue).then(() => {
								// Double-check that this specific node's image value is correctly restored
								if (imageWidget.options.values.includes(currentImageValue)) {
									imageWidget.value = currentImageValue;
									showImage(currentImageValue);
									console.log(`LoadImageWithSubfolder-Advanced: Successfully restored node ${this.id} with image: ${currentImageValue}`);
								} else {
									console.warn(`LoadImageWithSubfolder-Advanced: Image ${currentImageValue} not found in subfolder ${currentSubfolderValue} for node ${this.id}`);
								}
							});
						}
					}
				}, 100 + Math.random() * 100); // Add small random delay to prevent race conditions
			};
		}
	},

	async getCustomWidgets(app) {
		return {
			IMAGELOADER(node, inputName, inputData, app) {
				const subfolderWidget = node.widgets.find((w) => w.name === (inputData[1]?.widget ?? "subfolder"));
				const imageWidget = node.widgets.find((w) => w.name === (inputData[1]?.widget ?? "image"));
				let uploadWidget;
		
				function showImage(name) {
					const img = new Image();
					img.onload = () => {
						node.imgs = [img];
						app.graph.setDirtyCanvas(true);
					};
					img.onerror = () => {
						console.warn("LoadImageWithSubfolder-Advanced: Failed to load image:", name);
						node.imgs = [];
						app.graph.setDirtyCanvas(true);
					};

					if (name && name !== "undefined") {
						let subfolder = subfolderWidget.value ?? "";
						img.src = api.apiURL(`/view?filename=${encodeURIComponent(name)}&type=input&subfolder=${subfolder}${app.getPreviewFormatParam()}${app.getRandParam()}`);
						node.setSizeForImage?.();
					}
					else {
						node.imgs = [];
						app.graph.setDirtyCanvas(true);
					}
				}

				async function getImages(subfolder, preserveCurrentValue = false, targetImageValue = null) {
					const currentValue = targetImageValue || imageWidget.value;
					console.log(`LoadImageWithSubfolder-Advanced: Node ${node.id} - Getting images for subfolder: "${subfolder}", preserveCurrentValue: ${preserveCurrentValue}, targetImageValue: "${targetImageValue}"`);
					
					const resp = await api.fetchApi("/images_in_directory", {
						method: "POST",
						body: JSON.stringify({
							filetype: "input",
							subfolder: subfolder,
							suffix: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'tiff', 'tga', 'JPG', 'JPEG', 'PNG', 'WEBP', 'BMP', 'GIF', 'TIFF', 'TGA']
						})
					});

					if (resp.status === 200) {
						const data = await resp.json();
						console.log(`LoadImageWithSubfolder-Advanced: Node ${node.id} - API response data:`, data);
						imageWidget.options.values = [];
						for (const name of data.images) {
							imageWidget.options.values.push(name);
						}
						console.log(`LoadImageWithSubfolder-Advanced: Node ${node.id} - Available images:`, imageWidget.options.values);
						
						// Preserve the current value if it exists in the new list and preserveCurrentValue is true
						if (preserveCurrentValue && currentValue && currentValue !== "undefined" && imageWidget.options.values.includes(currentValue)) {
							imageWidget.value = currentValue;
							console.log(`LoadImageWithSubfolder-Advanced: Node ${node.id} - Preserved image value: ${currentValue}`);
						} else if (imageWidget.options.values.length > 0) {
							imageWidget.value = imageWidget.options.values[0];
							console.log(`LoadImageWithSubfolder-Advanced: Node ${node.id} - Set to first available image: ${imageWidget.value}`);
						} else {
							imageWidget.value = undefined;
							console.log(`LoadImageWithSubfolder-Advanced: Node ${node.id} - No images available, set to undefined`);
						}
						showImage(imageWidget.value);
					} else {
						console.error(`LoadImageWithSubfolder-Advanced: Node ${node.id} - Failed to fetch images:`, resp.status, resp.statusText);
						// Don't clear the options if the API call fails
						if (!preserveCurrentValue) {
							imageWidget.options.values = [];
							imageWidget.value = undefined;
							showImage(imageWidget.value);
						}
					}
				}

				// Initial load - preserve current value if it exists (for workflow restoration)
				getImages(subfolderWidget.value ?? "", true);

				const cb = node.callback;
				imageWidget.callback = function () {
					showImage(imageWidget.value);
					if (cb) {
						return cb.apply(this, arguments);
					}
				};

				// Store the original serialize method to ensure proper state saving
				const originalSerialize = node.serialize;
				node.serialize = function() {
					const data = originalSerialize ? originalSerialize.call(this) : {};
					// Ensure the current subfolder and image values are saved for this specific node
					data.widgets_values = data.widgets_values || [];
					const subfolderIndex = this.widgets.findIndex(w => w.name === 'subfolder');
					const imageIndex = this.widgets.findIndex(w => w.name === 'image');
					if (subfolderIndex !== -1) {
						data.widgets_values[subfolderIndex] = subfolderWidget.value;
					}
					if (imageIndex !== -1) {
						data.widgets_values[imageIndex] = imageWidget.value;
					}
					console.log(`LoadImageWithSubfolder-Advanced: Node ${this.id} - Serializing with subfolder: "${subfolderWidget.value}", image: "${imageWidget.value}"`);
					return data;
				};

				subfolderWidget.callback = function () {
					// When subfolder changes, don't preserve the current image value
					getImages(subfolderWidget.value ?? "", false);
					if (cb) {
						return cb.apply(this, arguments);
					}
				}

				// On load if we have a value then render the image
				// The value isnt set immediately so we need to wait a moment
				// No change callbacks seem to be fired on initial setting of the value
				requestAnimationFrame(() => {
					// Re-fetch images to ensure they're loaded, preserving current value for workflow restoration
					if (imageWidget.value && imageWidget.value !== "undefined") {
						const currentImageValue = imageWidget.value;
						const currentSubfolderValue = subfolderWidget.value;
						console.log(`LoadImageWithSubfolder-Advanced: Node ${node.id} - requestAnimationFrame restoring image: ${currentImageValue}, subfolder: ${currentSubfolderValue}`);
						getImages(currentSubfolderValue ?? "", true, currentImageValue);
					}
				});

				async function uploadFile(file, updateNode) {
					try {
						// Wrap file in formdata so it includes filename
						const body = new FormData();
						body.append("image", file);
						if (subfolderWidget.value) body.append("subfolder", subfolderWidget.value);
						const resp = await api.fetchApi("/upload/image", {
							method: "POST",
							body,
						});

						if (resp.status === 200) {
							const data = await resp.json();
							// Add the file to the dropdown list and update the widget value
							let path = data.name;		
							if (!imageWidget.options.values.includes(path)) {
								imageWidget.options.values.push(path);
							}

							if (updateNode) {
								showImage(path);
								imageWidget.value = path;
							}
						} else {
							alert(resp.status + " - " + resp.statusText);
						}
					} catch (error) {
						alert(error);
					}
				}

				const fileInput = document.createElement("input");
				Object.assign(fileInput, {
					type: "file",
					accept: "image/jpeg,image/jpg,image/png,image/webp,image/bmp,image/gif,image/tiff",
					style: "display: none",
					onchange: async () => {
						if (fileInput.files.length) {
							await uploadFile(fileInput.files[0], true);
						}
					},
				});
				document.body.append(fileInput);

				// Create the button widget for selecting the files
				uploadWidget = node.addWidget("button", inputName, "image", () => {
					fileInput.click();
				});
				uploadWidget.label = "choose file to upload";
				uploadWidget.serialize = false;

				return { widget: uploadWidget };
			}
		}
	},
});
