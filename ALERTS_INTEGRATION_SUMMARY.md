# Video Analysis → Alerts Integration Summary

## What's Connected

**Flow:**
```
VIDEO UPLOAD
    ↓
Ollama AI Analysis (mood, energy, behavior, confidence)
    ↓
Little Language Enrichment (optional semantic rules)
    ↓
Alert Rules Engine
    ↓
Generate Alerts Based on Analysis Results
    ↓
Display in AlertsWindow Component
```

## Key Files

### 1. **Video Analysis Service** - [src/services/geminiAPI.ts](src/services/geminiAPI.ts)
- Calls Ollama for pet analysis
- Applies little language rules for enrichment
- **NEW:** Generates alerts from analysis results
- Returns: `{ behavior, mood, energy, confidence, alerts }`

### 2. **Alert Rules DSL** - [src/dsl/AlertRulesDSL.ts](src/dsl/AlertRulesDSL.ts)
- Domain-specific language for defining alert rules
- Tokenizer → Parser → AST → Interpreter
- Supports: conditions (AND/OR), comparisons, actions

### 3. **Alerts Component** - [src/components/dashboard/AlertsWindow.tsx](src/components/dashboard/AlertsWindow.tsx)
- Displays alerts with icons, colors, actions
- Dismissible alerts
- Type-based styling (success, warning, error, info)

### 4. **Hooks** - [src/hooks/useAlertRules.ts](src/hooks/useAlertRules.ts)
- `useAlertRules()` - Evaluate and manage alert rules
- `useAnalysisLanguage()` - Run semantic analysis

### 5. **Dashboard** - [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx)
- Shows stats **only after analysis** (no placeholder data)
- Displays alerts when analysis completes
- Integrates AlertsWindow component

## Alert Types Generated

Based on video analysis:

```typescript
// Low Energy Alert
{
  type: "warning",
  title: "Low Energy Detected",
  message: "Your pet appears to have low energy levels...",
  action: "Monitor"
}

// Stress Detection
{
  type: "warning",
  title: "Stress Detected",
  message: "Your pet shows signs of stress...",
  action: "Create Safe Space"
}

// Happy & Healthy
{
  type: "success",
  title: "Happy & Active",
  message: "Your pet is happy and active! Great signs...",
}
```

## How It Works

### Step 1: User uploads video
```tsx
<input type="file" accept="video/*" onChange={handleVideoUpload} />
```

### Step 2: Analysis runs
```tsx
const analysis = await analyzeVideoWithGemini(videoFile);
// Returns: { mood, energy, behavior, confidence, alerts }
```

### Step 3: Alerts extracted
```tsx
if (analysis.alerts && analysis.alerts.length > 0) {
  setAlertsFromAnalysis(analysis.alerts);
}
```

### Step 4: Display in UI
```tsx
<AlertsWindow
  alerts={alertsFromAnalysis}
  onDismiss={(id) => { /* remove alert */ }}
/>
```

## Dashboard Changes

**BEFORE:**
- Showed placeholder stats always (misleading)
- Stats: Happy, 8.2k steps, 8.5h sleep, 92% health

**AFTER:**
- No stats until video analyzed (clean UI)
- Stats updated with **actual analysis results**
- Shows real: mood, behavior, energy, confidence
- Displays alerts immediately after analysis
- User can dismiss alerts individually

## Architecture Highlights

### Week 12-14: Little Languages
- [x] Tokenizer (lexical analysis)
- [x] Parser (syntax analysis, AST)
- [x] Interpreter (semantic analysis)
- [x] Error handling with line/column info

### Week 16: DSL for Alerts
- [x] Grammar-driven rule definitions
- [x] No code changes needed to add rules
- [x] Rules are data (can be loaded from DB)
- [x] Composable conditions (AND/OR)

## Example Alert Rules

**Current rules in code:**
```javascript
IF analysis.energy = "Low" → Alert: warning "Low Energy"
IF analysis.mood = "stressed" → Alert: warning "Stress Detected"
IF analysis.energy = "High" AND mood = "happy" → Alert: success "Happy & Active"
```

**To add new rules:**
```typescript
const engine = getAlertRulesEngine();
engine.addRuleFromDSL(
  'RULE "Very Active" WHEN pet.energy = "High" THEN CREATE_ALERT success "Pet is very active!"'
);
```

## Testing

1. Start servers: `npm run start:all`
2. Go to Dashboard
3. Upload a pet video
4. Analysis runs (10-30 seconds)
5. Alerts appear below stats
6. Stats update with real data (no placeholders)
7. Click X to dismiss alerts

## Files Modified

- ✅ `src/services/geminiAPI.ts` - Added alert generation
- ✅ `src/pages/Dashboard.tsx` - Added AlertsWindow, removed placeholder stats
- ✅ `src/components/dashboard/AlertsWindow.tsx` - NEW
- ✅ `src/hooks/useAlertRules.ts` - NEW
- ✅ `src/services/analysisLanguage.ts` - Little language implementation
- ✅ `src/dsl/AlertRulesDSL.ts` - Alert rules DSL (user provided)

## Next Steps

1. ✅ Alerts appear after analysis
2. ⏳ Connect AlertRulesEngine to Pet ADT (when ready)
3. ⏳ Add database persistence for custom rules
4. ⏳ Create UI for defining custom alert rules
5. ⏳ Add more sophisticated alert conditions

---

**Status:** ✅ Alerts fully integrated with video analysis and displaying in Dashboard
