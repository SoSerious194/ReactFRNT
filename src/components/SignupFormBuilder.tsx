"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  Type,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  List,
  X,
  GripVertical,
  DollarSign,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  orderIndex: number;
  options?: any;
  validationRules?: any;
  defaultValue?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  cssClass?: string;
  helpText?: string;
  dropdownOptions?: string[];
  checklistOptions?: string[];
  radioOptions?: string[];
  rangeMin?: number;
  rangeMax?: number;
  rangeStep?: number;
}

interface SignupFormData {
  id?: string;
  title: string;
  description: string;
  pricing_type: "monthly" | "yearly";
  price: number;
  is_active: boolean;
  elements: FormElement[];
}

interface SignupFormBuilderProps {
  initialForm?: SignupFormData;
  mode?: "create" | "edit";
}

// Sortable Form Element Component
function SortableFormElement({
  element,
  isSelected,
  onSelect,
  onDelete,
  renderFormElement,
}: {
  element: FormElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  renderFormElement: (element: FormElement) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`cursor-pointer transition-all ${
          isSelected
            ? "ring-2 ring-orange-500 border-orange-500"
            : "hover:border-gray-300"
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors"
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {element.label}
                  </span>
                  {element.required && <span className="text-red-500">*</span>}
                </div>
                {renderFormElement(element)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupFormBuilder({
  initialForm,
  mode = "create",
}: SignupFormBuilderProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    title: initialForm?.title || "New Signup Form",
    description: initialForm?.description || "",
    pricing_type: initialForm?.pricing_type || "monthly",
    price: initialForm?.price || 0,
    is_active: initialForm?.is_active ?? true,
    elements: initialForm?.elements || [],
  });
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const supabase = createClient();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormData((prev) => {
        const oldIndex = prev.elements.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = prev.elements.findIndex(
          (item) => item.id === over?.id
        );

        const newElements = arrayMove(prev.elements, oldIndex, newIndex);

        // Update order_index for each element
        const updatedElements = newElements.map((item, index) => ({
          ...item,
          orderIndex: index,
        }));

        return { ...prev, elements: updatedElements };
      });
    }
  };

  const formElementTypes = [
    {
      category: "Personal Information",
      elements: [
        { type: "full_name", label: "Full Name", icon: Users },
        { type: "email", label: "Email Address", icon: Type },
        { type: "password", label: "Password", icon: Hash },
        { type: "phone", label: "Phone Number", icon: Hash },
        { type: "date_of_birth", label: "Date of Birth", icon: Calendar },
      ],
    },
    {
      category: "Fitness Information",
      elements: [
        { type: "fitness_goals", label: "Fitness Goals", icon: Type },
        {
          type: "current_fitness_level",
          label: "Current Fitness Level",
          icon: List,
        },
        {
          type: "preferred_workout_time",
          label: "Preferred Workout Time",
          icon: Calendar,
        },
        {
          type: "injuries_limitations",
          label: "Injuries/Limitations",
          icon: Type,
        },
      ],
    },
    {
      category: "Additional Fields",
      elements: [
        { type: "short_text", label: "Short Text", icon: Type },
        { type: "paragraph", label: "Paragraph", icon: Type },
        { type: "numeric", label: "Numeric Input", icon: Hash },
        { type: "dropdown", label: "Dropdown Menu", icon: ChevronDown },
        { type: "radio", label: "Radio Button Group", icon: CheckSquare },
        { type: "checklist", label: "Checklist Group", icon: List },
      ],
    },
  ];

  const addElement = (elementType: string, label: string) => {
    const newElement: FormElement = {
      id: `element_${Date.now()}_${Math.random()}`,
      type: elementType,
      label: label,
      placeholder: "",
      required: false,
      orderIndex: formData.elements.length,
      dropdownOptions:
        elementType === "dropdown" ? ["Option 1", "Option 2"] : undefined,
      checklistOptions:
        elementType === "checklist" ? ["Option 1", "Option 2"] : undefined,
      radioOptions:
        elementType === "radio" ? ["Option 1", "Option 2"] : undefined,
    };

    setFormData((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElement(newElement);
  };

  const updateElement = (elementId: string, updates: Partial<FormElement>) => {
    setFormData((prev) => ({
      ...prev,
      elements: prev.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element
      ),
    }));

    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = (elementId: string) => {
    setFormData((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== elementId),
    }));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Ensure elements are in the correct order
      const orderedElements = formData.elements
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((element, index) => ({
          ...element,
          orderIndex: index,
        }));

      const formToSave = {
        ...formData,
        elements: orderedElements,
        coach_id: user.id,
      };

      let result;
      if (mode === "edit" && initialForm?.id) {
        result = await supabase
          .from("signup_forms")
          .update(formToSave)
          .eq("id", initialForm.id);
      } else {
        result = await supabase.from("signup_forms").insert(formToSave);
      }

      if (result.error) throw result.error;

      addToast({
        type: "success",
        message: "Your signup form has been saved successfully",
      });

      // Redirect to forms list
      window.location.href = "/onboard-users";
    } catch (error) {
      console.error("Error saving form:", error);
      addToast({
        type: "error",
        message: "Failed to save form",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderFormElement = (element: FormElement) => {
    switch (element.type) {
      case "full_name":
      case "email":
      case "phone":
      case "short_text":
        return (
          <Input
            placeholder={element.placeholder || "Enter text..."}
            disabled
            className="text-sm"
          />
        );

      case "password":
        return (
          <Input
            type="password"
            placeholder={element.placeholder || "Enter password..."}
            disabled
            className="text-sm"
          />
        );

      case "fitness_goals":
      case "injuries_limitations":
      case "paragraph":
        return (
          <Textarea
            placeholder={element.placeholder || "Enter text..."}
            disabled
            className="text-sm min-h-[80px]"
          />
        );

      case "date_of_birth":
      case "preferred_workout_time":
        return <Input type="date" disabled className="text-sm" />;

      case "current_fitness_level":
      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {element.dropdownOptions?.map((option, index) => (
                <SelectItem key={index} value={option || `option-${index}`}>
                  {option || `Option ${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {element.radioOptions?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`radio-${element.id}`}
                  disabled
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">{option}</span>
              </div>
            ))}
          </div>
        );

      case "checklist":
        return (
          <div className="space-y-2">
            {element.checklistOptions?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox disabled />
                <span className="text-sm text-gray-500">{option}</span>
              </div>
            ))}
          </div>
        );

      case "numeric":
        return (
          <Input
            type="number"
            placeholder={element.placeholder || "Enter number..."}
            disabled
            className="text-sm"
          />
        );

      default:
        return (
          <Input
            placeholder="Unknown field type"
            disabled
            className="text-sm"
          />
        );
    }
  };

  const filteredElementTypes = formElementTypes
    .map((category) => ({
      ...category,
      elements: category.elements.filter((element) =>
        element.label.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.elements.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/onboard-users">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Forms
              </Button>
            </Link>
          </div>

          <Button
            className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save & Publish"}
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Form Elements */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-4">
            <Input
              placeholder="Search field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-6">
            {filteredElementTypes.map((category) => (
              <div key={category.category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.elements.map((element) => {
                    const Icon = element.icon;
                    return (
                      <div
                        key={element.type}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors"
                        onClick={() => addElement(element.type, element.label)}
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {element.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Form Canvas */}
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* Section 1: Form Title and Description */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Form Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter form title"
                    className="text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what this signup form is for..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: checked as boolean,
                      }))
                    }
                  />
                  <label htmlFor="is-active" className="text-sm text-gray-700">
                    Form is active and can accept submissions
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Signup Form Builder */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Signup Form Fields
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formData.elements.map((element) => element.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {formData.elements
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((element) => (
                          <SortableFormElement
                            key={element.id}
                            element={element}
                            isSelected={selectedElement?.id === element.id}
                            onSelect={() => setSelectedElement(element)}
                            onDelete={() => deleteElement(element.id)}
                            renderFormElement={renderFormElement}
                          />
                        ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <Button
                  variant="outline"
                  className="w-full mt-6 border-dashed border-gray-300"
                  onClick={() => addElement("short_text", "New Field")}
                >
                  + Add Field
                </Button>
              </CardContent>
            </Card>

            {/* Section 3: Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pricing Type
                    </label>
                    <Select
                      value={formData.pricing_type}
                      onValueChange={(value: "monthly" | "yearly") =>
                        setFormData((prev) => ({
                          ...prev,
                          pricing_type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($
                      {formData.pricing_type === "monthly" ? "/month" : "/year"}
                      )
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Field Settings */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          {selectedElement ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Field Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Label
                  </label>
                  <Input
                    value={selectedElement.label}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        label: e.target.value,
                      })
                    }
                    placeholder="Enter field label"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Type
                  </label>
                  <select
                    value={selectedElement.type}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        type: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                                         <option value="full_name">Full Name</option>
                     <option value="email">Email Address</option>
                     <option value="password">Password</option>
                     <option value="phone">Phone Number</option>
                     <option value="date_of_birth">Date of Birth</option>
                    <option value="fitness_goals">Fitness Goals</option>
                    <option value="current_fitness_level">
                      Current Fitness Level
                    </option>
                    <option value="preferred_workout_time">
                      Preferred Workout Time
                    </option>
                    <option value="injuries_limitations">
                      Injuries/Limitations
                    </option>
                    <option value="short_text">Short Text</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="numeric">Numeric Input</option>
                    <option value="dropdown">Dropdown Menu</option>
                    <option value="radio">Radio Button Group</option>
                    <option value="checklist">Checklist Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholder Text
                  </label>
                  <Input
                    value={selectedElement.placeholder || ""}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        placeholder: e.target.value,
                      })
                    }
                    placeholder="Enter placeholder text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Help Text
                  </label>
                  <Textarea
                    value={selectedElement.helpText || ""}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        helpText: e.target.value,
                      })
                    }
                    placeholder="Give users a helpful tip"
                    rows={2}
                  />
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="required"
                    checked={selectedElement.required}
                    onCheckedChange={(checked) =>
                      updateElement(selectedElement.id, {
                        required: checked as boolean,
                      })
                    }
                  />
                  <label
                    htmlFor="required"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Required Field
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a field to edit its settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
