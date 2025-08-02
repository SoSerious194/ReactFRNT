# Everfit PDF Integration Plan

## Overview
This plan outlines the implementation of a feature that allows users to upload Everfit PDF workouts, process them through AI, and automatically create workouts in our workout builder system.

## Current Everfit PDF Structure Analysis

Based on the provided screenshots, Everfit PDFs contain:

### 1. Workout Metadata
- **Title**: "Full Body EMOM 5x4 - Demo"
- **Creator**: "Hozefa Khety" 
- **Date**: "Aug 2, 2025"
- **Description**: "Four rounds of five exercises. One minute of workout, no rest between exercises. 45 seconds of recovery between each round."

### 2. Workout Structure
- **Multiple Sections**: Warm-up, Main workout, Cool-down
- **Section Types**: 
  - AMRAP (As Many Rounds As Possible)
  - EMOM (Every Minute On the Minute)
  - Regular intervals
- **Duration Tracking**: Each section has total duration (e.g., "3:45 mins", "5:45 mins")

### 3. Exercise Details
- **Exercise Name**: "Elevated Back Lunge", "Front Box Jump", etc.
- **Duration**: "1 min", "30 min" (likely seconds for stretches)
- **Instructions**: "Right leg only", "Left leg only", "Each side"
- **Rest Periods**: "REST", "45s" (recovery between rounds)

## Implementation Plan

### Phase 1: PDF Upload & Processing Infrastructure

#### 1.1 PDF Upload Component
**File**: `src/components/PdfUploadSection.tsx`
- Drag & drop interface for PDF upload
- File validation (PDF only, size limits)
- Upload progress indicator
- Error handling for invalid files

#### 1.2 PDF Text Extraction
**File**: `src/lib/pdfProcessor.ts`
- Extract raw text from PDF
- Handle different PDF formats and structures
- Preserve formatting and structure
- Error handling for corrupted PDFs

#### 1.3 AI Processing Service
**File**: `src/lib/aiWorkoutProcessor.ts`
- Send extracted text to AI service
- Parse workout structure and metadata
- Extract exercises, sets, durations, instructions
- Return structured workout data

### Phase 2: Data Mapping & Transformation

#### 2.1 Workout Structure Mapping
**File**: `src/lib/workoutMapper.ts`

**AI-Driven Workout Type Detection:**

Instead of hardcoding workout type mappings, we use AI to intelligently determine the workout type based on patterns observed in the PDF:

**Workout Type Detection Patterns:**
```
AI analyzes the exercise structure to determine type:

1. "normal" type detected when:
   - Each exercise appears only once in the section
   - Exercises are done sequentially without repetition
   - Time-based intervals (like EMOM)
   - Standard exercises with rest periods

2. "circuit" type detected when:
   - Same exercises repeat in rounds/cycles
   - AMRAP (As Many Rounds As Possible) structure
   - Interval workouts with repeating patterns
   - Fixed work/rest intervals with exercise repetition
   - Multiple rounds of the same exercise sequence

3. "superset" type detected when:
   - Two exercises are paired together
   - Exercises done back-to-back with no rest between
   - Alternating between two exercises
   - Paired exercise patterns
```

**Example Patterns AI Will Recognize:**
- **EMOM**: Time-based (1 min per exercise) → `normal`
- **AMRAP**: Repetition-based (do all, repeat) → `circuit`
- **Interval**: Fixed work/rest with repetition → `circuit`
- **Circuit**: Repeating exercise sequences → `circuit`
- **Regular**: Standard exercises with rest → `normal`
- **Superset**: Paired exercises → `superset`

**Exercise Set Mapping:**
```
Everfit Exercise → Our Exercise Set
- Exercise name → exercise_sets.exercise_name
- Duration → exercise_sets.rest_seconds (for time-based exercises)
- Instructions → exercise_sets.notes
- Rest periods → exercise_sets.rest_seconds
- Set type → exercise_sets.set_type (work/warmup/burnout/dropset)
```

**Key Differences by Workout Type:**

**EMOM (Every Minute On the Minute):**
- Time-based (1 minute per exercise) → Map as `normal` with time durations
- No rest between exercises within EMOM
- Rest only between EMOM rounds

**Interval (Fixed Work/Rest):**
- Fixed work/rest intervals (40s work, 20s rest) → Map as `circuit`
- Exercises repeat in rounds
- Each exercise appears multiple times in the workout

**AMRAP (As Many Rounds As Possible):**
- Repetition-based (do all exercises, repeat) → Map as `circuit`
- No fixed rest periods
- Do as many rounds as possible

**Regular:**
- Standard exercises with rest → Map as `normal`
- Each exercise done once with rest between

**Circuit (Repeating Sequence):**
- Multiple exercises in sequence, then repeat → Map as `circuit`
- Can have fixed work/rest intervals
- Exercises appear multiple times in the workout

**Special Handling for Instructions:**
- "switch side each round" → Add to exercise notes
- "Single leg - switch side each round" → Add to exercise notes
- "Each side" → Add to exercise notes
- "hold the fifth rep for 20 seconds" → Add to exercise notes

#### 2.2 Exercise Matching System
**File**: `src/lib/exerciseMatcher.ts`

**Matching Strategies:**
1. **Exact Match**: Direct name comparison
2. **Fuzzy Match**: Handle variations and abbreviations
3. **Synonym Match**: "BB Bench Press" → "Barbell Bench Press"
4. **Equipment Match**: "Assisted Tricep Dip" → "Tricep Dip" + equipment note

**Exercise Name Variations to Handle:**
- "BB" → "Barbell"
- "DB" → "Dumbbell"
- "BW" → "Bodyweight"
- "Assisted" → Add to notes
- "Each side" → Add to instructions

### Phase 3: User Interface Components

#### 3.1 PDF Upload Interface
**File**: `src/components/PdfUploadModal.tsx`
```typescript
interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutProcessed: (workoutData: ProcessedWorkout) => void;
}
```

**Features:**
- Drag & drop zone
- File validation
- Processing status
- Preview of extracted data

#### 3.2 Exercise Matching Modal
**File**: `src/components/ExerciseMatchingModal.tsx`
```typescript
interface ExerciseMatchingModalProps {
  isOpen: boolean;
  unmatchedExercises: UnmatchedExercise[];
  onMatch: (exerciseId: string, matchedExerciseId: string) => void;
  onAddNew: (exercise: NewExercise) => void;
}
```

**Features:**
- List of unmatched exercises from PDF
- Search existing exercises
- Option to add new exercise
- Preview of exercise details
- Batch matching capabilities

#### 3.3 Workout Preview Component
**File**: `src/components/WorkoutPreviewSection.tsx`
```typescript
interface WorkoutPreviewSectionProps {
  processedWorkout: ProcessedWorkout;
  onConfirm: () => void;
  onEdit: (workoutData: ProcessedWorkout) => void;
}
```

**Features:**
- Preview of mapped workout structure
- Show matched vs unmatched exercises
- Allow manual adjustments
- Confirm and create workout

### Phase 4: Data Models & Types

#### 4.1 Processed Workout Types
**File**: `src/types/workoutImport.ts`
```typescript
interface ProcessedWorkout {
  metadata: WorkoutMetadata;
  blocks: ProcessedWorkoutBlock[];
  unmatchedExercises: UnmatchedExercise[];
}

interface WorkoutMetadata {
  title: string;
  creator?: string;
  date?: string;
  description?: string;
  difficulty?: string;
  equipment?: string[];
  duration?: string;
}

interface ProcessedWorkoutBlock {
  name: string;
  type: 'normal' | 'superset' | 'circuit'; // Updated to match our system
  duration?: string;
  exercises: ProcessedExercise[];
}

interface ProcessedExercise {
  name: string;
  duration?: string;
  instructions?: string;
  rest?: string;
  matchedExerciseId?: string;
  isMatched: boolean;
}

interface UnmatchedExercise {
  name: string;
  instructions?: string;
  suggestedMatches: Exercise[];
}
```

### Phase 5: Integration with Workout Builder

#### 5.1 Workout Builder Enhancement
**File**: `src/components/WorkoutBuilderSection.tsx` (enhancement)

**New Features:**
- Import from PDF button
- Pre-populate builder with processed data
- Handle unmatched exercises
- Preserve original structure

#### 5.2 Import Workflow
1. **Upload PDF** → Extract text
2. **AI Processing** → Parse structure
3. **Exercise Matching** → Match with existing exercises
4. **Preview & Edit** → Review mapped workout
5. **Create Workout** → Save to database

### Phase 6: AI Processing Implementation

#### 6.1 AI Service Integration
**File**: `src/lib/aiService.ts`
```typescript
interface AiWorkoutProcessor {
  processWorkoutText(text: string): Promise<ProcessedWorkout>;
  extractMetadata(text: string): WorkoutMetadata;
  extractBlocks(text: string): ProcessedWorkoutBlock[];
  extractExercises(blockText: string): ProcessedExercise[];
}
```

#### 6.2 Prompt Engineering
**Structured prompts for:**
- Workout metadata extraction
- Section/block identification
- Exercise parsing
- Duration and rest period extraction
- Instruction parsing

### Phase 7: Error Handling & Edge Cases

#### 7.1 PDF Processing Errors
- Corrupted PDFs
- Unsupported formats
- Text extraction failures
- AI processing timeouts

#### 7.2 Exercise Matching Edge Cases
- No exact matches found
- Multiple potential matches
- Exercises with equipment variations
- Custom/unique exercises

#### 7.3 Data Validation
- Required fields validation
- Duration format validation
- Exercise name sanitization
- Duplicate exercise detection

### Phase 8: User Experience Flow

#### 8.1 Complete User Journey
1. **User clicks "Import from PDF"** in workout builder
2. **Upload modal opens** with drag & drop
3. **PDF uploads** and processing begins
4. **AI processes** the workout structure
5. **Exercise matching modal** shows unmatched exercises
6. **User matches** exercises or adds new ones
7. **Preview modal** shows final workout structure
8. **User confirms** and workout is created
9. **Workout builder** opens with pre-populated data

#### 8.2 Error Recovery
- Retry PDF processing
- Manual exercise matching
- Partial workout creation
- Save draft functionality

### Phase 9: Testing Strategy

#### 9.1 Test Cases
- Various PDF formats and structures
- Different workout types (EMOM, AMRAP, etc.)
- Exercise name variations
- Error scenarios
- Performance testing with large PDFs

#### 9.2 Mock Data
- Sample Everfit PDFs
- Expected parsed results
- Edge case scenarios

### Phase 10: Performance & Optimization

#### 10.1 Performance Considerations
- PDF processing timeouts
- AI service rate limits
- Large file handling
- Caching strategies

#### 10.2 Optimization Strategies
- Progressive loading
- Background processing
- Result caching
- Batch operations

## Implementation Priority

### High Priority (MVP)
1. PDF upload component
2. Basic text extraction
3. Simple exercise matching
4. Workout preview
5. Basic integration with builder

### Medium Priority
1. AI processing service
2. Advanced exercise matching
3. Error handling
4. User experience improvements

### Low Priority
1. Advanced features
2. Performance optimizations
3. Additional PDF formats
4. Batch processing

## Success Metrics
- PDF processing success rate
- Exercise matching accuracy
- User satisfaction with import process
- Time saved vs manual creation
- Error rate and recovery success

## Future Enhancements
- Support for other fitness app PDFs
- Batch import functionality
- Template creation from imports
- AI-powered workout suggestions
- Community workout sharing 