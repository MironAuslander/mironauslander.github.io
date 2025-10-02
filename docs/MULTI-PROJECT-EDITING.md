# Multi-Project Editing Workflow

## Problem Solved

Previously, when editing multiple projects in the Project Studio, you had to:
1. Edit Project A
2. Save (download JSON file #1)
3. Edit Project B
4. Save (download JSON file #2)
5. Manually merge both JSON files
6. Replace `projects-data.json` with merged file

**This was inefficient and error-prone.**

## New Workflow (Auto-Save on Switch)

The Project Studio now automatically saves changes to memory when you switch between projects, allowing you to edit multiple projects before saving once.

### How It Works:

1. **Edit Multiple Projects Freely**
   - Select a project from the Edit view sidebar
   - Make changes to project details and media configuration
   - Switch to another project - changes are **automatically saved to memory**
   - Edit as many projects as you need

2. **Visual Feedback**
   - Projects with unsaved changes show a **pulsing orange dot (●)** in the sidebar
   - A **yellow border** appears on the left side of modified projects
   - A **summary count** shows how many projects have pending changes
   - The main **"Changes pending"** indicator at the bottom shows overall status

3. **Single Save Operation**
   - Click **"Save All Changes"** button once
   - All organization changes + all edited projects are saved together
   - Single JSON file download with everything included
   - No manual merging needed!

### Example Usage:

```
1. Switch to Edit view
2. Click on "Project-1798" → Edit description and media
3. Click on "Project-1537" → Auto-saves 1798, loads 1537
4. Edit 1537 details
5. Click on "Project-1270" → Auto-saves 1537, loads 1270
6. Edit 1270 media configuration
7. Click "Save All Changes" → Downloads one JSON file with all 3 projects updated
```

### Visual Indicators:

#### In Edit View Sidebar:
- **Normal project**: Clean appearance
- **Modified project**:
  - Orange pulsing dot (●) in top-right corner
  - Yellow left border
  - Tooltip: "Has unsaved changes"

#### Summary Section:
```
┌─────────────────────────────┐
│  🔍 Search to edit...       │
│  ┌─────────────────────────┐│
│  │  3 project(s) modified  ││ ← Appears when changes exist
│  └─────────────────────────┘│
└─────────────────────────────┘
```

#### Success Message:
```
✅ All changes saved! (3 projects edited) Download started.
```

## Technical Implementation

### Data Structures:
```javascript
// Tracks which projects have been modified
this.modifiedProjects = new Set(); // ['1798', '1537', '1270']

// All project data in memory (always up-to-date)
this.projectsData = { projects: [...] }
```

### Auto-Save Trigger:
When you click a new project in the Edit view:
1. `selectProjectForEdit()` is called
2. First, `savePendingProjectChanges()` runs
3. Current project's form data is extracted
4. Data is merged into `this.projectsData.projects[index]`
5. Project ID is added to `modifiedProjects` Set
6. Visual indicator is updated
7. New project is loaded

### Save Operation:
When you click "Save All Changes":
1. Organization data is updated (featured, visible, hidden)
2. Current editing project (if any) is auto-saved
3. **Entire `projectsData` object** is saved (includes ALL modified projects)
4. Single JSON download contains everything
5. All indicators are cleared

## Benefits

✅ **No manual JSON merging** - Single save for all changes
✅ **Better UX** - Edit multiple projects without interruption
✅ **Clear feedback** - Visual indicators show what's been modified
✅ **Safe workflow** - Changes stay in memory until you save
✅ **Efficient** - One download instead of multiple files

## Important Notes

1. **Changes are in memory only** until you click "Save All Changes"
2. **Refreshing the page** will lose all unsaved changes
3. **Warning prompt** appears if you try to reload with unsaved changes
4. **Organization changes** (drag-drop) are also tracked and saved together
5. **All edits persist** when switching between Organize/Details/Media tabs

## Comparison

### Before (Old Workflow):
```
Edit Project A → Save (file1.json)
Edit Project B → Save (file2.json)
Edit Project C → Save (file3.json)
Manually merge file1 + file2 + file3
Replace projects-data.json
```

### After (New Workflow):
```
Edit Project A
Edit Project B
Edit Project C
Save All Changes (single file with A, B, C changes)
Replace projects-data.json
```

---

**Last Updated**: 2025-10-02
**Version**: Project Studio v2.1 with Multi-Project Support
