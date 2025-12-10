# VS Code Debugging Guide

Complete guide to debugging and tasks in VS Code for TropiGo.

## What Are Tasks and Debugging?

### Tasks
**Tasks are automated commands that VS Code runs for you.**

Instead of typing `bun run dev:ui` in the terminal every time, you can create a task that VS Code runs automatically (especially before debugging).

**Defined in:** `.vscode/tasks.json`

**Example:**
```json
{
  "label": "Start UI Dev Server",  // Name of the task
  "command": "bun run dev:ui",     // Command to run
  "isBackground": true             // Keep running in background
}
```

### Debugging
**Debugging lets you pause code and inspect it line by line.**

Instead of using `console.log` everywhere, you:
1. Set a breakpoint (click left of line number)
2. Press `F5` to start debugger
3. Code pauses when it hits the breakpoint
4. Inspect variables, step through code

**Defined in:** `.vscode/launch.json`

### How They Work Together
Tasks can run automatically before debugging using `preLaunchTask`:

```json
{
  "name": "Debug UI (Chrome)",
  "preLaunchTask": "Start UI Dev Server"  // ← Runs task before debugging
}
```

**What happens when you press F5:**
1. VS Code runs the task (starts dev server)
2. Waits for it to be ready
3. Starts the debugger
4. You can now debug!

## Setup

VS Code configuration files are already set up in `.vscode/`:
- `launch.json` - Debug configurations
- `tasks.json` - Task definitions
- `settings.json` - Project settings
- `extensions.json` - Recommended extensions

## Recommended Extensions

Install these extensions for the best experience:
- **Bun for Visual Studio Code** (`oven.bun-vscode`) - Required for debugging Bun apps
- **ESLint** (`dbaeumer.vscode-eslint`) - Linting
- **Prettier** (`esbenp.prettier-vscode`) - Code formatting
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - If using Tailwind

VS Code will prompt you to install these when you open the project.

## Available Debug Configurations

### 1. Debug API (Bun)
**Use this to debug the backend API**

- Sets breakpoints in API code
- Step through Hono routes
- Inspect database queries
- Auto-restarts on file changes (watch mode)

**How to use:**
1. Open `apps/api/src/index.ts`
2. Set a breakpoint (click left of line number)
3. Press `F5` or go to Run & Debug panel
4. Select "Debug API (Bun)"
5. Click the green play button

The API will start at `http://localhost:8060` with debugger attached.

### 2. Debug UI (Chrome)
**Use this to debug the React frontend**

- Sets breakpoints in React components
- Step through UI logic
- Inspect component state
- View network requests

**How to use:**
1. Open `apps/ui/src/App.tsx`
2. Set a breakpoint
3. Press `F5` and select "Debug UI (Chrome)"
4. The dev server starts automatically (preLaunchTask)
5. Chrome opens with debugger attached

### 3. Debug Full Stack
**Debug both API and UI at the same time**

This is a compound configuration that starts both debuggers.

**How to use:**
1. Press `F5` and select "Debug Full Stack"
2. Both API and UI debuggers will start
3. Set breakpoints in either codebase
4. Debug end-to-end flows

**Example:** Debug a full request flow:
- Set breakpoint in `apps/ui/src/App.tsx` where you fetch data
- Set breakpoint in `apps/api/src/index.ts` in the API route
- Trigger the request from UI
- Step through both client and server code

### 4. Attach to Bun API
**Attach to an already-running Bun process**

Use this if you started the API separately and want to attach the debugger.

## Debugging Tips

### Setting Breakpoints

**Regular breakpoint:**
- Click left of line number (red dot appears)
- Code will pause when this line is reached

**Conditional breakpoint:**
- Right-click in the gutter
- Select "Add Conditional Breakpoint"
- Enter condition: `userId === '123'`
- Only pauses when condition is true

**Logpoint:**
- Right-click in the gutter
- Select "Add Logpoint"
- Enter message: `User: {user.name}`
- Logs without stopping execution

### Debug Console

When paused at a breakpoint, use the Debug Console to:

```javascript
// Inspect variables
user

// Call functions
formatPrice(experience.price)

// Modify values
experience.title = "New Title"

// Run queries
await db.select().from(users)
```

### Watch Expressions

Add expressions to watch panel:
1. Open "Watch" panel in debug sidebar
2. Click "+"
3. Add expression: `experiences.length`
4. Value updates as you step through code

### Call Stack

View the call stack to see:
- Where the current function was called from
- Navigate up/down the stack
- Inspect variables at each level

## Debugging Common Scenarios

### Debug API Endpoint

1. Set breakpoint in route handler:
```typescript
app.get('/api/experiences', async (c) => {
  // Set breakpoint here
  const experiences = await db.select().from(experiences)
  return c.json({ success: true, data: experiences })
})
```

2. Start "Debug API (Bun)"
3. Make request from browser or UI
4. Debugger pauses, inspect `experiences` variable

### Debug React Component

1. Set breakpoint in component:
```typescript
function App() {
  const [experiences, setExperiences] = useState<Experience[]>([])

  useEffect(() => {
    // Set breakpoint here
    fetch('http://localhost:3000/api/experiences')
      .then(res => res.json())
      .then(data => {
        // And here
        setExperiences(data.data)
      })
  }, [])
```

2. Start "Debug UI (Chrome)"
3. Reload page
4. Step through the fetch and state update

### Debug Database Query

1. Set breakpoint before query:
```typescript
// Set breakpoint here
const users = await db.select().from(users).where(eq(users.role, 'host'))
// And here to inspect results
console.log(users)
```

2. Start debugger
3. Hover over variables to inspect
4. Check if query returns expected data

### Debug Full Request Flow

1. Set breakpoint in UI fetch:
```typescript
// apps/ui/src/App.tsx
fetch('http://localhost:3000/api/experiences') // Breakpoint here
```

2. Set breakpoint in API route:
```typescript
// apps/api/src/index.ts
app.get('/api/experiences', async (c) => {
  // Breakpoint here
})
```

3. Start "Debug Full Stack"
4. Reload UI
5. Step through:
   - UI makes request → pauses
   - Continue → API receives request → pauses
   - Continue → API returns data
   - Continue → UI receives response

## Keyboard Shortcuts

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Start/Continue | `F5` | `F5` |
| Step Over | `F10` | `F10` |
| Step Into | `F11` | `F11` |
| Step Out | `Shift+F11` | `Shift+F11` |
| Restart | `Cmd+Shift+F5` | `Ctrl+Shift+F5` |
| Stop | `Shift+F5` | `Shift+F5` |
| Toggle Breakpoint | `F9` | `F9` |

## Troubleshooting

### "Bun debugger not found"
- Install the Bun extension: `oven.bun-vscode`
- Restart VS Code

### Breakpoints not hitting in API
- Make sure you're running the debugger, not `bun run dev:api`
- Check that source maps are enabled
- Verify breakpoint is in executed code path

### Breakpoints not hitting in UI
- Make sure dev server is running first
- Check Chrome is launched by VS Code (not manual)
- Clear browser cache and reload

### "Cannot connect to runtime process"
- Ensure no other process is using the port
- Kill existing Bun processes: `pkill -f bun`
- Restart debugger

## Pro Tips

1. **Use "Debug Full Stack"** for end-to-end debugging
2. **Add console.log** as a quick check, then add breakpoints
3. **Watch expressions** for values you check frequently
4. **Conditional breakpoints** to pause only when conditions match
5. **Step Over** for quick execution, **Step Into** to dive deep
6. **Debug Console** is powerful - you can run any code there
7. **Restart is faster** than stop + start

## Next Steps

- [Drizzle Debugging](./drizzle/03-common-operations.md) - Debug database queries
- [Common Issues](#troubleshooting) - Solutions to common problems
