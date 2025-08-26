"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  Image as ImageIcon,
  Download,
  Settings,
  Type,
  X,
  Plus,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/database";
import html2canvas from "html2canvas";

type Workout = Tables<"workouts">;

// Font options
const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Poppins", label: "Poppins" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
];

type SampleImage = Tables<"workout_sample_images">;

// Text elements configuration
interface TextElement {
  id: string;
  type: "title" | "difficulty" | "duration" | "stretch-sessions" | "custom";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  rotation?: number;
  opacity: number;
  textAlign: "left" | "center" | "right";
  textShadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
}

export default function WorkoutPreviewGeneratorPage() {
  const [selectedWorkout, setSelectedWorkout] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(
    null
  );
  const [showImageGrid, setShowImageGrid] = useState(false);
  const [availableImages, setAvailableImages] = useState<SampleImage[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [matchingImage, setMatchingImage] = useState(false);
  const [savingCoverPhoto, setSavingCoverPhoto] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [imageSettings, setImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    scale: 1,
    rotation: 0,
    crop: { x: 0, y: 0, width: 100, height: 100 },
  });
  const [textElements, setTextElements] = useState<TextElement[]>([
    {
      id: "title",
      type: "title",
      text: "WORKOUT TITLE",
      x: 50,
      y: 20,
      fontSize: 32,
      fontFamily: "Inter",
      fontWeight: "bold",
      color: "#ffffff",
      backgroundColor: "#3b82f6",
      padding: 16,
      borderRadius: 8,
      rotation: 0,
      opacity: 1,
      textAlign: "left",
      textShadow: { x: 0, y: 0, blur: 0, color: "transparent" },
    },
    {
      id: "difficulty",
      type: "difficulty",
      text: "DIFFICULTY",
      x: 50,
      y: 35,
      fontSize: 16,
      fontFamily: "Inter",
      fontWeight: "600",
      color: "#ffffff",
      backgroundColor: "#ef4444",
      padding: 8,
      borderRadius: 6,
      rotation: 0,
      opacity: 1,
      textAlign: "left",
    },
    {
      id: "duration",
      type: "duration",
      text: "-4 WORKOUTS/WEEK",
      x: 50,
      y: 50,
      fontSize: 18,
      fontFamily: "Inter",
      fontWeight: "500",
      color: "#1f2937",
      rotation: 0,
      opacity: 1,
      textAlign: "left",
    },
    {
      id: "stretch-sessions",
      type: "stretch-sessions",
      text: "-2 STATIC STRETCH SESSIONS/WEEK",
      x: 50,
      y: 65,
      fontSize: 18,
      fontFamily: "Inter",
      fontWeight: "500",
      color: "#1f2937",
      rotation: 0,
      opacity: 1,
      textAlign: "left",
    },
  ]);
  const [layoutSettings, setLayoutSettings] = useState({
    imagePosition: "right" as "left" | "right",
    backgroundColor: "#ffffff",
    padding: 20,
    aspectRatio: "16:9" as "16:9" | "4:3" | "1:1" | "3:2",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch workouts and sample images from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workouts
        const { data: workoutsData, error: workoutsError } = await supabase
          .from("workouts")
          .select("*")
          .order("lastModified", { ascending: false });

        if (workoutsError) {
          console.error("Error fetching workouts:", workoutsError);
        } else {
          setWorkouts(workoutsData || []);
        }

        // Fetch sample images
        const { data: imagesData, error: imagesError } = await supabase
          .from("workout_sample_images")
          .select("*")
          .or(
            "is_global.eq.true,coach_id.eq." +
              (
                await supabase.auth.getUser()
              ).data.user?.id
          )
          .order("created_at", { ascending: false });

        if (imagesError) {
          console.error("Error fetching sample images:", imagesError);
        } else {
          setAvailableImages(imagesData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGridImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);

        const response = await fetch("/api/upload-workout-image", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setAvailableImages((prev) => [...prev, result.image]);
          setSelectedImage(result.url);
          setShowImageGrid(false);
        } else {
          const error = await response.json();
          alert(`Upload failed: ${error.error}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleWorkoutSelect = async (workoutId: string) => {
    setSelectedWorkout(workoutId);
    const workout = workouts.find((w) => w.id === workoutId);
    if (workout) {
      setTextElements((prev) =>
        prev.map((element) => {
          if (element.type === "title") {
            return { ...element, text: (workout.name || "").toUpperCase() };
          }
          if (element.type === "difficulty") {
            return {
              ...element,
              text: (workout.difficulty || "").toUpperCase(),
            };
          }
          if (element.type === "duration") {
            return {
              ...element,
              text: `-${(workout.duration || "").toUpperCase()}`,
            };
          }
          return element;
        })
      );

      // Automatically select the best matching image
      setMatchingImage(true);
      try {
        const response = await fetch("/api/match-workout-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workoutId }),
        });

        if (response.ok) {
          const result = await response.json();
          setSelectedImage(result.selectedImage.image_url);

          // Show a toast or notification about the automatic selection
          console.log("AI selected image:", result.selectedImage.name);
          console.log("Match reason:", result.matchReason);
        } else {
          console.log("No suitable image found, keeping current selection");
        }
      } catch (error) {
        console.error("Error matching workout image:", error);
      } finally {
        setMatchingImage(false);
      }
    }
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      )
    );
  };

  const addCustomText = () => {
    const newElement: TextElement = {
      id: `custom-${Date.now()}`,
      type: "custom",
      text: "Custom Text",
      x: 50,
      y: 70,
      fontSize: 18,
      fontFamily: "Inter",
      fontWeight: "500",
      color: "#1f2937",
      rotation: 0,
      opacity: 1,
      textAlign: "left",
    };
    setTextElements((prev) => [...prev, newElement]);
    setSelectedTextElement(newElement.id);
  };

  const deleteTextElement = (id: string) => {
    setTextElements((prev) => prev.filter((element) => element.id !== id));
    setSelectedTextElement(null);
  };

  const handleSaveAsCoverPhoto = async () => {
    if (!selectedWorkout) {
      alert("Please select a workout first");
      return;
    }

    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    if (!previewRef.current) {
      alert("Preview element not found");
      return;
    }

    setSavingCoverPhoto(true);
    try {
      // Ensure the image is fully loaded before capturing
      if (selectedImage) {
        console.log("Pre-loading image:", selectedImage);
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              console.log("Image pre-loaded successfully");
              resolve(true);
            };
            img.onerror = (error) => {
              console.error("Image pre-load failed:", error);
              // Don't reject, just log the error and continue
              console.log("Continuing without pre-loaded image...");
              resolve(false);
            };
            img.src = selectedImage;
          });
        } catch (error) {
          console.log("Image pre-load error, continuing...", error);
        }
      }

      // Wait a bit more to ensure everything is rendered
      console.log("Waiting for render...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Starting capture...");

      // Capture the preview as an image
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true, // Re-enable CORS
        allowTaint: false, // Don't allow tainted canvas
        backgroundColor: layoutSettings.backgroundColor || "#ffffff",
        scale: 2, // Higher quality
        logging: false,
        onclone: async (clonedDoc) => {
          // Fix oklch color issues in the cloned document
          const elements = clonedDoc.querySelectorAll("*");
          elements.forEach((element) => {
            const el = element as HTMLElement;
            const computedStyle = window.getComputedStyle(el);

            // Check and fix color
            if (computedStyle.color && computedStyle.color.includes("oklch")) {
              el.style.setProperty("color", "#000000", "important");
            }

            // Check and fix background-color
            if (
              computedStyle.backgroundColor &&
              computedStyle.backgroundColor.includes("oklch")
            ) {
              el.style.setProperty("background-color", "#ffffff", "important");
            }

            // Check and fix border-color
            if (
              computedStyle.borderColor &&
              computedStyle.borderColor.includes("oklch")
            ) {
              el.style.setProperty("border-color", "#000000", "important");
            }
          });

          // Ensure images in the cloned document are properly loaded
          const images = clonedDoc.querySelectorAll("img");
          console.log("Found", images.length, "images in cloned document");

          // Wait for all images to load
          const imagePromises = Array.from(images).map((img, index) => {
            return new Promise<void>((resolve) => {
              const imgElement = img as HTMLImageElement;
              console.log(`Image ${index}:`, imgElement.src);

              // Set crossOrigin for CORS support
              imgElement.crossOrigin = "anonymous";

              if (imgElement.complete && imgElement.naturalHeight !== 0) {
                console.log(`Image ${index} already loaded`);
                resolve();
              } else {
                imgElement.onload = () => {
                  console.log(`Image ${index} loaded successfully`);
                  resolve();
                };
                imgElement.onerror = () => {
                  console.log(`Image ${index} failed to load, continuing...`);
                  resolve();
                };
                // Force reload the image to ensure it's captured
                if (imgElement.src) {
                  console.log(`Reloading image ${index}:`, imgElement.src);
                  imgElement.src = imgElement.src;
                }
              }
            });
          });

          // Wait for all images to load before continuing
          await Promise.all(imagePromises);
          console.log("All images processed");

          // Additional debugging: check if images are visible
          images.forEach((img, index) => {
            const imgElement = img as HTMLImageElement;
            console.log(`Image ${index} final state:`, {
              src: imgElement.src,
              complete: imgElement.complete,
              naturalWidth: imgElement.naturalWidth,
              naturalHeight: imgElement.naturalHeight,
              offsetWidth: imgElement.offsetWidth,
              offsetHeight: imgElement.offsetHeight,
              style: {
                display: imgElement.style.display,
                visibility: imgElement.style.visibility,
                opacity: imgElement.style.opacity,
              },
            });

            // Ensure image is visible and properly sized
            if (imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) {
              imgElement.style.display = "block";
              imgElement.style.visibility = "visible";
              imgElement.style.opacity = "1";
              imgElement.style.width = "100%";
              imgElement.style.height = "100%";
              imgElement.style.objectFit = "cover";
            }
          });
        },
      });

      // Convert canvas to blob
      let blob: Blob;
      try {
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create blob"));
              }
            },
            "image/png",
            0.95
          );
        });
      } catch (error) {
        console.error("Canvas to blob failed:", error);
        // Fallback: create a simple text-only image
        alert(
          "Image capture failed due to CORS restrictions. Please configure GCS CORS settings or try again."
        );
        return;
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", blob, "workout-preview.png");
      formData.append("workoutId", selectedWorkout);

      // Upload the generated image
      const response = await fetch("/api/generate-workout-preview", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert("Cover photo saved successfully!");
        console.log("Cover photo saved:", result.coverPhotoUrl);

        // Optionally refresh the workouts list to show the updated cover photo
        // You might want to add a callback to refresh the parent component
      } else {
        const error = await response.json();
        alert(`Failed to save cover photo: ${error.error}`);
      }
    } catch (error) {
      console.error("Error saving cover photo:", error);
      alert("Failed to save cover photo. Please try again.");
    } finally {
      setSavingCoverPhoto(false);
    }
  };

  const selectedElement = textElements.find(
    (el) => el.id === selectedTextElement
  );

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Advanced Workout Preview Generator
        </h1>
        <p className="text-gray-600">
          Create beautiful workout preview images with advanced customization
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Panel - Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* Workout Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Workout Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Select Workout
                  {matchingImage && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      AI Matching...
                    </div>
                  )}
                </div>
                <Select
                  value={selectedWorkout}
                  onValueChange={handleWorkoutSelect}
                  disabled={loading || matchingImage}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loading ? "Loading workouts..." : "Choose a workout..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {workouts.map((workout) => (
                      <SelectItem key={workout.id} value={workout.id}>
                        {workout.name || "Unnamed Workout"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  Workout Image
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowImageGrid(true)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Sample
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Advanced Editor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="effects">Effects</TabsTrigger>
                </TabsList>

                {/* Text Editor */}
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Text Elements
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {textElements.map((element) => (
                        <div
                          key={element.id}
                          className={`p-2 rounded border cursor-pointer text-sm ${
                            selectedTextElement === element.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedTextElement(element.id)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate">{element.text}</span>
                            {element.type === "custom" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTextElement(element.id);
                                }}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addCustomText}
                      className="w-full"
                    >
                      + Add Custom Text
                    </Button>
                  </div>

                  {selectedElement && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Text Content
                        </div>
                        <Input
                          value={selectedElement.text}
                          onChange={(e) =>
                            updateTextElement(selectedElement.id, {
                              text: e.target.value,
                            })
                          }
                          placeholder="Enter text..."
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Font Family
                        </div>
                        <Select
                          value={selectedElement.fontFamily}
                          onValueChange={(value) =>
                            updateTextElement(selectedElement.id, {
                              fontFamily: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fontOptions.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                {font.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Font Size: {selectedElement.fontSize}px
                        </div>
                        <Slider
                          value={[selectedElement.fontSize]}
                          onValueChange={(values: number[]) =>
                            updateTextElement(selectedElement.id, {
                              fontSize: values[0],
                            })
                          }
                          min={8}
                          max={72}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Font Weight
                        </div>
                        <Select
                          value={selectedElement.fontWeight}
                          onValueChange={(value) =>
                            updateTextElement(selectedElement.id, {
                              fontWeight: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="500">Medium</SelectItem>
                            <SelectItem value="600">Semi Bold</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                            <SelectItem value="900">Black</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Text Color
                        </div>
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) =>
                            updateTextElement(selectedElement.id, {
                              color: e.target.value,
                            })
                          }
                          className="w-full h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Background Color (Optional)
                        </div>
                        <Input
                          type="color"
                          value={selectedElement.backgroundColor || "#000000"}
                          onChange={(e) =>
                            updateTextElement(selectedElement.id, {
                              backgroundColor: e.target.value,
                            })
                          }
                          className="w-full h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Opacity: {Math.round(selectedElement.opacity * 100)}%
                        </div>
                        <Slider
                          value={[selectedElement.opacity]}
                          onValueChange={(values: number[]) =>
                            updateTextElement(selectedElement.id, {
                              opacity: values[0],
                            })
                          }
                          min={0}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Text Alignment
                        </div>
                        <Select
                          value={selectedElement.textAlign}
                          onValueChange={(value: "left" | "center" | "right") =>
                            updateTextElement(selectedElement.id, {
                              textAlign: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Image Editor */}
                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Brightness: {imageSettings.brightness}%
                    </div>
                    <Slider
                      value={[imageSettings.brightness]}
                      onValueChange={(values: number[]) =>
                        setImageSettings((prev) => ({
                          ...prev,
                          brightness: values[0],
                        }))
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Contrast: {imageSettings.contrast}%
                    </div>
                    <Slider
                      value={[imageSettings.contrast]}
                      onValueChange={(values: number[]) =>
                        setImageSettings((prev) => ({
                          ...prev,
                          contrast: values[0],
                        }))
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Saturation: {imageSettings.saturation}%
                    </div>
                    <Slider
                      value={[imageSettings.saturation]}
                      onValueChange={(values: number[]) =>
                        setImageSettings((prev) => ({
                          ...prev,
                          saturation: values[0],
                        }))
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Blur: {imageSettings.blur}px
                    </div>
                    <Slider
                      value={[imageSettings.blur]}
                      onValueChange={(values: number[]) =>
                        setImageSettings((prev) => ({
                          ...prev,
                          blur: values[0],
                        }))
                      }
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Scale: {Math.round(imageSettings.scale * 100)}%
                    </div>
                    <Slider
                      value={[imageSettings.scale]}
                      onValueChange={(values: number[]) =>
                        setImageSettings((prev) => ({
                          ...prev,
                          scale: values[0],
                        }))
                      }
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Rotation: {imageSettings.rotation}°
                    </div>
                    <Slider
                      value={[imageSettings.rotation]}
                      onValueChange={(values: number[]) =>
                        setImageSettings((prev) => ({
                          ...prev,
                          rotation: values[0],
                        }))
                      }
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </TabsContent>

                {/* Layout Settings */}
                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Image Position
                    </div>
                    <Select
                      value={layoutSettings.imagePosition}
                      onValueChange={(value: "left" | "right") =>
                        setLayoutSettings((prev) => ({
                          ...prev,
                          imagePosition: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Aspect Ratio
                    </div>
                    <Select
                      value={layoutSettings.aspectRatio}
                      onValueChange={(value: "16:9" | "4:3" | "1:1" | "3:2") =>
                        setLayoutSettings((prev) => ({
                          ...prev,
                          aspectRatio: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Background Color
                    </div>
                    <Input
                      type="color"
                      value={layoutSettings.backgroundColor}
                      onChange={(e) =>
                        setLayoutSettings((prev) => ({
                          ...prev,
                          backgroundColor: e.target.value,
                        }))
                      }
                      className="w-full h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Padding: {layoutSettings.padding}px
                    </div>
                    <Slider
                      value={[layoutSettings.padding]}
                      onValueChange={(values: number[]) =>
                        setLayoutSettings((prev) => ({
                          ...prev,
                          padding: values[0],
                        }))
                      }
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </TabsContent>

                {/* Effects */}
                <TabsContent value="effects" className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Advanced effects and filters will be available here.
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Save as Cover Photo Button */}
          <Button
            onClick={handleSaveAsCoverPhoto}
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={!selectedWorkout || !selectedImage || savingCoverPhoto}
          >
            {savingCoverPhoto ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Save as Workout Cover Photo
              </>
            )}
          </Button>
        </div>

        {/* Center Panel - Preview */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={previewRef}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative"
                style={{
                  backgroundColor: layoutSettings.backgroundColor,
                  aspectRatio:
                    layoutSettings.aspectRatio === "16:9"
                      ? "16/9"
                      : layoutSettings.aspectRatio === "4:3"
                      ? "4/3"
                      : layoutSettings.aspectRatio === "1:1"
                      ? "1/1"
                      : "3/2",
                }}
              >
                {selectedImage ? (
                  <div className="w-full h-full flex">
                    {/* Text Content */}
                    <div
                      className={`flex-1 p-8 flex flex-col justify-center ${
                        layoutSettings.imagePosition === "right"
                          ? "order-1"
                          : "order-2"
                      }`}
                    >
                      <div className="space-y-6">
                        {/* Title */}
                        <div
                          className={`inline-block px-6 py-3 rounded-lg cursor-pointer transition-all ${
                            selectedTextElement === "title"
                              ? "ring-2 ring-blue-500 ring-offset-2"
                              : "hover:ring-1 hover:ring-gray-300"
                          }`}
                          onClick={() => setSelectedTextElement("title")}
                          style={{
                            backgroundColor:
                              textElements.find((el) => el.type === "title")
                                ?.backgroundColor || "#3b82f6",
                            fontFamily:
                              textElements.find((el) => el.type === "title")
                                ?.fontFamily || "Inter",
                            fontSize: `${
                              textElements.find((el) => el.type === "title")
                                ?.fontSize || 32
                            }px`,
                            fontWeight:
                              textElements.find((el) => el.type === "title")
                                ?.fontWeight || "bold",
                            color:
                              textElements.find((el) => el.type === "title")
                                ?.color || "#ffffff",
                            textAlign: "center",
                          }}
                        >
                          {textElements.find((el) => el.type === "title")
                            ?.text || "WORKOUT TITLE"}
                        </div>

                        {/* Difficulty Badge */}
                        <div
                          className={`block px-4 py-2 rounded-md cursor-pointer transition-all ${
                            selectedTextElement === "difficulty"
                              ? "ring-2 ring-blue-500 ring-offset-2"
                              : "hover:ring-1 hover:ring-gray-300"
                          }`}
                          onClick={() => setSelectedTextElement("difficulty")}
                          style={{
                            backgroundColor:
                              textElements.find(
                                (el) => el.type === "difficulty"
                              )?.backgroundColor || "#ef4444",
                            fontFamily:
                              textElements.find(
                                (el) => el.type === "difficulty"
                              )?.fontFamily || "Inter",
                            fontSize: `${
                              textElements.find(
                                (el) => el.type === "difficulty"
                              )?.fontSize || 16
                            }px`,
                            fontWeight:
                              textElements.find(
                                (el) => el.type === "difficulty"
                              )?.fontWeight || "600",
                            color:
                              textElements.find(
                                (el) => el.type === "difficulty"
                              )?.color || "#ffffff",
                            textAlign: "center",
                            width: "fit-content",
                            margin: "0 auto",
                          }}
                        >
                          {textElements.find((el) => el.type === "difficulty")
                            ?.text || "DIFFICULTY"}
                        </div>

                        {/* Program Details */}
                        <div className="space-y-2 mt-4">
                          <p
                            className={`font-medium cursor-pointer transition-all ${
                              selectedTextElement === "duration"
                                ? "ring-2 ring-blue-500 ring-offset-1"
                                : "hover:ring-1 hover:ring-gray-300"
                            }`}
                            onClick={() => setSelectedTextElement("duration")}
                            style={{
                              fontFamily:
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.fontFamily || "Inter",
                              fontSize: `${
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.fontSize || 18
                              }px`,
                              fontWeight:
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.fontWeight || "500",
                              color:
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.color || "#1f2937",
                              textAlign: "center",
                            }}
                          >
                            {textElements.find((el) => el.type === "duration")
                              ?.text || "-4 WORKOUTS/WEEK"}
                          </p>
                          <p
                            className={`font-medium cursor-pointer transition-all ${
                              selectedTextElement === "stretch-sessions"
                                ? "ring-2 ring-blue-500 ring-offset-1"
                                : "hover:ring-1 hover:ring-gray-300"
                            }`}
                            onClick={() =>
                              setSelectedTextElement("stretch-sessions")
                            }
                            style={{
                              fontFamily:
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.fontFamily || "Inter",
                              fontSize: `${
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.fontSize || 18
                              }px`,
                              fontWeight:
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.fontWeight || "500",
                              color:
                                textElements.find(
                                  (el) => el.type === "duration"
                                )?.color || "#1f2937",
                              textAlign: "center",
                            }}
                          >
                            {textElements.find(
                              (el) => el.type === "stretch-sessions"
                            )?.text || "-2 STATIC STRETCH SESSIONS/WEEK"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Image */}
                    <div
                      className={`flex-1 ${
                        layoutSettings.imagePosition === "right"
                          ? "order-2"
                          : "order-1"
                      }`}
                    >
                      <img
                        src={selectedImage}
                        alt="Workout preview"
                        className="w-full h-full object-cover"
                        style={{
                          filter: `brightness(${imageSettings.brightness}%) contrast(${imageSettings.contrast}%) saturate(${imageSettings.saturation}%) blur(${imageSettings.blur}px)`,
                          transform: `scale(${imageSettings.scale}) rotate(${imageSettings.rotation}deg)`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                      <p>
                        Select a workout and upload an image to see the preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Grid Modal */}
      {showImageGrid && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Select Sample Image
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageGrid(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Upload New Image Card */}
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center transition-colors min-h-[200px] ${
                  uploading
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-gray-400"
                }`}
                onClick={() => !uploading && gridFileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                    <p className="text-sm text-gray-600 text-center">
                      Uploading & Analyzing...
                    </p>
                  </>
                ) : (
                  <>
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 text-center">
                      Upload New Image
                    </p>
                  </>
                )}
                <input
                  ref={gridFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGridImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {/* Sample Images */}
              {availableImages.map((image) => (
                <div
                  key={image.id}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => {
                    setSelectedImage(image.image_url);
                    setShowImageGrid(false);
                  }}
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.image_url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.name}
                    </p>
                    {image.ai_analysis && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">
                          AI Analyzed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
