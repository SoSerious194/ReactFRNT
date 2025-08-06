"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
  ToggleLeft,
  ChevronDown,
  CheckSquare,
  List,
  Sliders,
  X,
  GripVertical,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { FormService } from "@/lib/formServices";
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

interface FormBuilderProps {
  initialForm?: {
    id?: string;
    title: string;
    description: string;
    elements: FormElement[];
  };
  onSave: (formData: {
    title: string;
    description: string;
    elements: FormElement[];
  }) => void;
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

export default function FormBuilder({
  initialForm,
  onSave,
  mode = "create",
}: FormBuilderProps) {
  const [formTitle, setFormTitle] = useState(
    initialForm?.title || "Untitled Form"
  );
  const [formDescription, setFormDescription] = useState(
    initialForm?.description || ""
  );
  const [formElements, setFormElements] = useState<FormElement[]>(
    initialForm?.elements || []
  );
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const formService = new FormService();

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
      setFormElements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order_index for each element
        return newItems.map((item, index) => ({
          ...item,
          orderIndex: index,
        }));
      });
    }
  };

  const formElementTypes = [
    {
      category: "Text & Input",
      elements: [
        { type: "short_text", label: "Short Text", icon: Type },
        { type: "paragraph", label: "Paragraph", icon: Type },
        { type: "numeric", label: "Numeric Input", icon: Hash },
        { type: "date", label: "Date Picker", icon: Calendar },
      ],
    },
    {
      category: "Selection & Choices",
      elements: [
        { type: "toggle", label: "Toggle Switch", icon: ToggleLeft },
        { type: "dropdown", label: "Dropdown Menu", icon: ChevronDown },
        { type: "radio", label: "Radio Button Group", icon: CheckSquare },
        { type: "checklist", label: "Checklist Group", icon: List },
        { type: "range", label: "Range Slider", icon: Sliders },
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
      orderIndex: formElements.length,
      dropdownOptions:
        elementType === "dropdown" ? ["Option 1", "Option 2"] : undefined,
      checklistOptions:
        elementType === "checklist" ? ["Option 1", "Option 2"] : undefined,
      radioOptions:
        elementType === "radio" ? ["Option 1", "Option 2"] : undefined,
      rangeMin: elementType === "range" ? 0 : undefined,
      rangeMax: elementType === "range" ? 100 : undefined,
      rangeStep: elementType === "range" ? 1 : undefined,
    };

    setFormElements([...formElements, newElement]);
    setSelectedElement(newElement);
  };

  const updateElement = (elementId: string, updates: Partial<FormElement>) => {
    setFormElements((elements) =>
      elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element
      )
    );

    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const deleteElement = (elementId: string) => {
    setFormElements((elements) => elements.filter((el) => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const addDropdownOption = (elementId: string) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element) {
      const newOptions = [
        ...(element.dropdownOptions || []),
        `Option ${(element.dropdownOptions?.length || 0) + 1}`,
      ];
      updateElement(elementId, { dropdownOptions: newOptions });
    }
  };

  const removeDropdownOption = (elementId: string, index: number) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element && element.dropdownOptions) {
      const newOptions = element.dropdownOptions.filter((_, i) => i !== index);
      updateElement(elementId, { dropdownOptions: newOptions });
    }
  };

  const updateDropdownOption = (
    elementId: string,
    index: number,
    value: string
  ) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element && element.dropdownOptions) {
      const newOptions = [...element.dropdownOptions];
      newOptions[index] = value;
      updateElement(elementId, { dropdownOptions: newOptions });
    }
  };

  const addChecklistOption = (elementId: string) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element) {
      const newOptions = [
        ...(element.checklistOptions || []),
        `Option ${(element.checklistOptions?.length || 0) + 1}`,
      ];
      updateElement(elementId, { checklistOptions: newOptions });
    }
  };

  const removeChecklistOption = (elementId: string, index: number) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element && element.checklistOptions) {
      const newOptions = element.checklistOptions.filter((_, i) => i !== index);
      updateElement(elementId, { checklistOptions: newOptions });
    }
  };

  const updateChecklistOption = (
    elementId: string,
    index: number,
    value: string
  ) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element && element.checklistOptions) {
      const newOptions = [...element.checklistOptions];
      newOptions[index] = value;
      updateElement(elementId, { checklistOptions: newOptions });
    }
  };

  const addRadioOption = (elementId: string) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element) {
      const newOptions = [
        ...(element.radioOptions || []),
        `Option ${(element.radioOptions?.length || 0) + 1}`,
      ];
      updateElement(elementId, { radioOptions: newOptions });
    }
  };

  const removeRadioOption = (elementId: string, index: number) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element && element.radioOptions) {
      const newOptions = element.radioOptions.filter((_, i) => i !== index);
      updateElement(elementId, { radioOptions: newOptions });
    }
  };

  const updateRadioOption = (
    elementId: string,
    index: number,
    value: string
  ) => {
    const element = formElements.find((el) => el.id === elementId);
    if (element && element.radioOptions) {
      const newOptions = [...element.radioOptions];
      newOptions[index] = value;
      updateElement(elementId, { radioOptions: newOptions });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure elements are in the correct order
      const orderedElements = formElements
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((element, index) => ({
          ...element,
          orderIndex: index, // Ensure orderIndex is sequential
        }));

      await onSave({
        title: formTitle,
        description: formDescription,
        elements: orderedElements,
      });
    } catch (error) {
      console.error("Error saving form:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderFormElement = (element: FormElement) => {
    switch (element.type) {
      case "short_text":
        return (
          <Input
            placeholder={element.placeholder || "Enter text..."}
            disabled
            className="text-sm"
          />
        );

      case "paragraph":
        return (
          <Textarea
            placeholder={element.placeholder || "Enter text..."}
            disabled
            className="text-sm min-h-[80px]"
          />
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

      case "date":
        return <Input type="date" disabled className="text-sm" />;

      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
              <div className="absolute left-1 h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform"></div>
            </div>
            <span className="text-sm text-gray-500">Toggle option</span>
          </div>
        );

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

      case "range":
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={element.rangeMin || 0}
              max={element.rangeMax || 100}
              step={element.rangeStep || 1}
              defaultValue={element.rangeMin || 0}
              disabled
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{element.rangeMin || 0}</span>
              <span>{element.rangeMax || 100}</span>
            </div>
          </div>
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
            <Link href="/training-hub/forms">
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
            {/* Form Title */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-2xl font-bold border-none p-2 mb-2 focus:ring-0"
                placeholder="Form Title"
              />
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Add a description..."
                className="border-none p-2 resize-none focus:ring-0"
                rows={2}
              />
            </div>

            {/* Form Elements */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formElements.map((element) => element.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {formElements
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
                    <option value="short_text">Short Text</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="numeric">Numeric Input</option>
                    <option value="date">Date Picker</option>
                    <option value="dropdown">Dropdown Menu</option>
                    <option value="toggle">Toggle Switch</option>
                    <option value="checkbox">Single Checkbox</option>
                    <option value="checklist">Checklist Group</option>
                    <option value="range">Range Slider</option>
                    <option value="section_break">Section Break</option>
                    <option value="data_table">Data Table</option>
                  </select>
                </div>

                {selectedElement.type !== "section_break" && (
                  <>
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
                        Default Value
                      </label>
                      <Input
                        value={selectedElement.defaultValue || ""}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            defaultValue: e.target.value,
                          })
                        }
                        placeholder="Enter a default value"
                      />
                    </div>

                    {selectedElement.type === "range" && (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min
                          </label>
                          <Input
                            type="number"
                            value={selectedElement.rangeMin || 0}
                            onChange={(e) =>
                              updateElement(selectedElement.id, {
                                rangeMin: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max
                          </label>
                          <Input
                            type="number"
                            value={selectedElement.rangeMax || 100}
                            onChange={(e) =>
                              updateElement(selectedElement.id, {
                                rangeMax: parseInt(e.target.value) || 100,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Step
                          </label>
                          <Input
                            type="number"
                            value={selectedElement.rangeStep || 1}
                            onChange={(e) =>
                              updateElement(selectedElement.id, {
                                rangeStep: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {selectedElement.type === "dropdown" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dropdown Options
                        </label>
                        <div className="space-y-2">
                          {selectedElement.dropdownOptions?.map(
                            (option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    updateDropdownOption(
                                      selectedElement.id,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option text"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeDropdownOption(
                                      selectedElement.id,
                                      index
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              addDropdownOption(selectedElement.id)
                            }
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedElement.type === "radio" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Radio Options
                        </label>
                        <div className="space-y-2">
                          {selectedElement.radioOptions?.map(
                            (option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    updateRadioOption(
                                      selectedElement.id,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option text"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeRadioOption(selectedElement.id, index)
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addRadioOption(selectedElement.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedElement.type === "checklist" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Checklist Options
                        </label>
                        <div className="space-y-2">
                          {selectedElement.checklistOptions?.map(
                            (option, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={option}
                                  onChange={(e) =>
                                    updateChecklistOption(
                                      selectedElement.id,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Option text"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeChecklistOption(
                                      selectedElement.id,
                                      index
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              addChecklistOption(selectedElement.id)
                            }
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Characters
                        </label>
                        <Input
                          type="number"
                          value={selectedElement.minLength || ""}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              minLength: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Characters
                        </label>
                        <Input
                          type="number"
                          value={selectedElement.maxLength || ""}
                          onChange={(e) =>
                            updateElement(selectedElement.id, {
                              maxLength: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="100"
                        />
                      </div>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom CSS Class
                      </label>
                      <Input
                        value={selectedElement.cssClass || ""}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            cssClass: e.target.value,
                          })
                        }
                        placeholder="custom-field-class"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="required"
                        checked={selectedElement.required}
                        onChange={(e) =>
                          updateElement(selectedElement.id, {
                            required: e.target.checked,
                          })
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor="required"
                        className="text-sm text-gray-700"
                      >
                        Required Field
                      </label>
                    </div>
                  </>
                )}
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
