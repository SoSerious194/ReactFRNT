import { ArrowLeftIcon, Search, SparklesIcon } from "lucide-react";
import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";

export const ExerciseFormSection = (): JSX.Element => {
  // Form field data
  const formFields = {
    leftColumn: [
      { id: "exerciseName", label: "Exercise Name", type: "input" },
      {
        id: "videoUrl1",
        label: "Video URL 1",
        type: "input",
        helperText: "Paste YouTube or Vimeo URL",
      },
      {
        id: "videoUrl2",
        label: "Video URL 2",
        type: "input",
        helperText: "Paste YouTube or Vimeo URL (optional)",
      },
    ],
    middleColumn: [
      { id: "musclesTrained", label: "Muscles Trained", type: "select" },
      { id: "defaultUnit", label: "Default Unit", type: "select" },
      { id: "exerciseType", label: "Exercise Type", type: "select" },
      { id: "targetGoal", label: "Target Goal", type: "select" },
      { id: "difficulty", label: "Difficulty", type: "select" },
      { id: "equipment", label: "Equipment", type: "select" },
    ],
    rightColumn: [
      {
        id: "exerciseProgressions",
        label: "Exercise Progressions",
        type: "search",
        helperText: "Harder variations of this exercise",
      },
      {
        id: "exerciseRegressions",
        label: "Exercise Regressions",
        type: "search",
        helperText: "Easier variations of this exercise",
      },
      { id: "instructions", label: "Instructions", type: "textarea" },
    ],
  };

  return (
    <div className="w-full p-6">
      <Card className="w-full rounded-lg border shadow-sm">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center h-[82px] border-b">
            <Button
              variant="ghost"
              className="ml-6 flex items-center gap-2 text-gray-600"
            >
              <ArrowLeftIcon size={15} />
              <span className="font-medium text-[17px]">Back</span>
            </Button>
            <h1 className="ml-8 font-normal text-gray-900 text-[21px]">
              Exercise Builder
            </h1>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="flex gap-9">
              {/* Left Column */}
              <div className="w-1/3 bg-green-50 rounded-lg p-7 space-y-7">
                {formFields.leftColumn.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block font-medium text-gray-700 text-[15.7px]">
                      {field.label}
                    </label>
                    {field.helperText && (
                      <p className="text-gray-500 text-[13.5px]">
                        {field.helperText}
                      </p>
                    )}
                    <Input className="h-[47px] bg-white" />
                  </div>
                ))}

                {/* AI Autofill Card */}
                <Card className="border-green-200 bg-white">
                  <CardContent className="p-7 space-y-5">
                    <h3 className="font-medium text-gray-900 text-[20px]">
                      AI Autofill
                    </h3>
                    <p className="font-normal text-gray-600 text-[15.7px]">
                      Add exercise data in seconds
                    </p>
                    <Button className="h-[45px] w-[164px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      <SparklesIcon size={18} className="mr-2" />
                      AI Autofill
                    </Button>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-500 text-[13.5px]">
                        RECOMMENDED FLOW:
                      </p>
                      <p className="font-medium text-gray-500 text-[13.5px]">
                        Enter Exercise Name and/or Video
                      </p>
                      <p className="font-medium text-gray-500 text-[13.5px]">
                        URL and let our AI fill in the rest.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column */}
              <div className="w-1/3 space-y-[26px]">
                {formFields.middleColumn.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block font-medium text-gray-700 text-[15.7px]">
                      {field.label}
                    </label>
                    <Select>
                      <SelectTrigger className="h-[47px] bg-white">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="w-1/3 space-y-[26px]">
                {/* Exercise Progressions */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">
                    {formFields.rightColumn[0].label}
                  </label>
                  <p className="text-gray-500 text-[13.5px]">
                    {formFields.rightColumn[0].helperText}
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-[18px] w-[18px] text-gray-400" />
                    <Input
                      className="h-[47px] pl-12 bg-white"
                      placeholder="Search exercise library"
                    />
                  </div>
                </div>

                {/* Exercise Regressions */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">
                    {formFields.rightColumn[1].label}
                  </label>
                  <p className="text-gray-500 text-[13.5px]">
                    {formFields.rightColumn[1].helperText}
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 h-[18px] w-[18px] text-gray-400" />
                    <Input
                      className="h-[47px] pl-12 bg-white"
                      placeholder="Search exercise library"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-[15.7px]">
                    {formFields.rightColumn[2].label}
                  </label>
                  <Textarea className="h-[236px] bg-white" />
                </div>

                {/* Save Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="h-[74px] w-[160px] flex flex-col py-2.5 text-gray-700"
                  >
                    <span>Save as</span>
                    <span>Draft</span>
                  </Button>
                  <Button className="h-[72px] w-[163px] flex flex-col py-2.5 bg-green-500 hover:bg-green-600">
                    <span>Save</span>
                    <span>Exercise</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
