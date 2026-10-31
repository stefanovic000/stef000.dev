---
title: Extracting Google Earth data
date: 2025-07-07
tag: journey
tags: [3D, Blender, RenderDoc]
excerpt: Turning a rendered Google Earth frame into a usable 3D model, with the exact tool versions that work and the traps that cost me two days.
---
## Journey
I needed the model of our city for a new game. After some research, I found out that the best way to do this is using the RenderDoc program, made by Baldur Karlsson.

After going through many versions of RenderDoc, Blender and browsers, I found the exact versions and the browser that work for me. I am making this tutorial for the same versions that worked for me.

## Requirements
To extract 3D data we are going to need the following:
- RenderDoc v1.19[^1]
- Blender v2.93.0[^2]
- Microsoft Edge v138.0.3351.65[^3]
- MapsModelsImporter v0.4.1[^4]

## Steps

### 1. Create a Microsoft Edge shortcut.

You need to make a shortcut of Microsoft Edge with some specific parameters. We are going to assume you have Microsoft Edge in the default Windows location:

```bash
C:\Windows\System32\cmd.exe /c "SET RENDERDOC_HOOK_EGL=0 && START "" ^"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe^" --disable-gpu-sandbox --disable_direct_composition=1 --gpu-startup-dialog"
```

You can do this by creating a shortcut on your desktop:

 ![creation of a shortcut](/assets/images/create_shortcut.png)
 
And paste the location from above:

 ![creation of a shortcut](/assets/images/shortcut_location.png)
 ![creation of a shortcut](/assets/images/shortcut_name.png)

> If you make the shortcut this way, it is going to have the icon of cmd.exe.
> If you make the shortcut from the Microsoft Edge exe file and edit its properties, it is going to have the Microsoft Edge icon. Not relevant to our objective, but so you don't get confused by the icon.
{: .prompt-tip }

### 2. Open RenderDoc and do the setup.

First, we need to enable process injection.

You are going to do this by going to Tools and Settings:

 ![creation of a shortcut](/assets/images/renderdoc_settings.png)

Check this option on the General tab:

 ![creation of a shortcut](/assets/images/renderdoc_injection.png)

**And restart the program.**

### 3. Injecting into the Microsoft Edge process.

Open your Microsoft Edge shortcut:

 ![creation of a shortcut](/assets/images/edge_icon.png)

And you are going to get a white window, alongside a small window with some number:

 ![creation of a shortcut](/assets/images/edge_popup.png)

Don't close it yet.

Go back to RenderDoc and go to File → Inject to Process:

 ![creation of a shortcut](/assets/images/renderdoc_injectWindow.png)

In the filter box, type the number (PID) you got earlier from opening Microsoft Edge, then click Refresh:

 ![creation of a shortcut](/assets/images/renderdoc_injectWindow2.png)

Select msedge.exe with your number (PID). The correct Window Title is Microsoft Edge GPU.

Click the Inject button:

 ![creation of a shortcut](/assets/images/renderdoc_injectButton.png)

You can now close the small Microsoft Edge popup from earlier.

### 4. Choosing a location.

In your previously opened Microsoft Edge, open Google Earth:

[https://earth.google.com/](https://earth.google.com/)


Pick your location and move to it.

For this example we are going to Zürich, Switzerland:

![zurich picture](/assets/images/zurich.png)

In my experience, the closer you zoom in, the more details you get. But you will get less area in your extracted model.

After some research, I found out a little trick for getting more detail without zooming in so much, so you can get more area:

When using Microsoft Edge, you can click the three dots in the top right corner and set zoom to 25%. This will load more details, like when you get closer.

### 5. Extracting 3D data.

Go back to RenderDoc, and you will see this section:

![capture options](/assets/images/capture_options.png)

There are multiple ways to capture data using RenderDoc. In my experience the most reliable way is to use the "Trigger after delay" option. Set it to 5–10 seconds (more if you need more time).

You are going to click the "Trigger after delay" button, and the capture will happen after the amount of time that was previously set.

Click the button and switch the window to Microsoft Edge. After the previously set time has passed, you can switch the window back to RenderDoc. You will see a capture looking similar to this:

![capture example](/assets/images/capture_example.png)

If your file is a lot smaller, there is a possibility that there is no actual 3D (polygon) data. In my experience it happens sometimes, **but you can try moving your map after clicking "Trigger after delay", and stopping before the actual capture happens.**

> Before realizing that a capture can happen without catching 3D data, I thought the problem was in this combination of program versions. I thought there was a problem in this version of RenderDoc. After that I thought the problem was in the MapsModelsImporter or Blender version, because I got an error when importing the capture into Blender. But sometimes the capture doesn't contain an important part of the data. (When the file size is too small, that can give you a hint). Also you can use the Texture Viewer tab to be sure, but that is a little bit more advanced.
{: .prompt-tip }

### 6. Saving the capture to your computer.

Right-click on your capture and click Save:

![capture save](/assets/images/capture_save.png)

Save it to a folder of your choice. (I am not sure if a specific file location can be problematic for the Blender extension accessing the file.) The file extension will be **.rdc**

### 7. Installing the Blender add-on.

Open the Blender that you previously installed, and open a new empty General file.

Find the Edit section and click "Preferences":

![edit preference](/assets/images/edit_pref.png)

Click on the Add-ons section on the left side of the newly opened window. After that, click the Install button in the top right of the window.

![addon install](/assets/images/addon_install.png)

Find your MapsModelsImporter download; it should have a **.zip** extension. Click Install Add-on.

![addon downloaded](/assets/images/addon_downloaded.png)

To find your newly installed add-on more easily, you can use the search option.

Activate the add-on by clicking on the checkbox.

![addon check](/assets/images/addon_check.png)

You have now installed the add-on. You can close the "Preferences" window.

### 8. Loading the .rdc model into Blender.

After you have installed the extension, it's time to load the .rdc into Blender.

First, if you have loaded the default Blender project, you should delete the cube first, so it doesn't annoy us. You can do that by clicking on the Cube and pressing **'x'** and confirming it.

To import the **.rdc** file, go to File → Import and select **Google Maps Capture (.rdc)**:

![import rdc](/assets/images/import_rdc.png)

Find your **.rdc** file and select it. After clicking the Import button, depending on the size of your model, you can wait a long time for it to load.

> This is the part where most errors show up. If one does, you should check if your **.rdc** file actually captured map data. You should also check if you have the correct versions of all previously used programs and the correct version of the extension.
{: .prompt-warning}

![zurich rendered](/assets/images/zurich_rendered.png)

Now that it has loaded, you can press **'z'** and select "Rendered" or "Material preview" to see the model colors.

### 9. (Optional) Export the model into a different file format.

You can export your model into a different format by going to File → Export and choosing the file extension type you need.

![exporting](/assets/images/exporting.png)

## The end.

Congrats — you have now done in 30 minutes something that took me 2 days.

Feel free to ask questions below.


[^1]: You can download the exact version of RenderDoc from their website:

	[https://renderdoc.org/builds](https://renderdoc.org/builds)

	Or you can use the direct link from their website (1.19 64-bit):

	[https://renderdoc.org/stable/1.19/RenderDoc_1.19_64.msi](https://renderdoc.org/stable/1.19/RenderDoc_1.19_64.msi)

	You can also use the portable version of this program.

[^2]: You can download the exact version of Blender from their website:

	[https://download.blender.org/release/](https://download.blender.org/release/)

	Or you can use the direct link from their website (2.93.0):

	[https://download.blender.org/release/Blender2.93/](https://download.blender.org/release/Blender2.93/)

	You will need this on a Windows 64-bit system:

	**blender-2.93.0-windows-x64.msi**

[^3]: You can download the exact Microsoft Edge version at the bottom of this page:

	[https://www.microsoft.com/en-us/edge/business/download?form=MA13FJ](https://www.microsoft.com/en-us/edge/business/download?form=MA13FJ)

	The version used is the latest version at the moment I am writing this, and it is the version that worked. There is a possibility that the version of Microsoft Edge is not important.

	Previously I tried using Google Chrome, but it didn't work.

[^4]: You can download the exact MapsModelsImporter version at the bottom of this page:

	[https://github.com/eliemichel/MapsModelsImporter/releases/tag/v0.4.1-rc1](https://github.com/eliemichel/MapsModelsImporter/releases/tag/v0.4.1-rc1)

	Keep the file in .zip format. You will load it directly into Blender.

*Only for educational purposes*
