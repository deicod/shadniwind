# Empty

Displays an empty state with an icon, title, description, and action.

## Installation

```bash
npx shadcn@latest add @shadniwind/empty
```

## Usage

```tsx
import { Empty, EmptyAction, EmptyDescription, EmptyIcon, EmptyTitle } from "~/components/ui/empty"
import { Button } from "~/components/ui/button"
import { Text } from "react-native"

<Empty>
  <EmptyIcon>
    <Text>Icon</Text>
  </EmptyIcon>
  <EmptyTitle>No data found</EmptyTitle>
  <EmptyDescription>You can create a new item to get started.</EmptyDescription>
  <EmptyAction>
    <Button>Create Item</Button>
  </EmptyAction>
</Empty>
```

## API Reference

### Empty

Main container. Accepts all `View` props.

### EmptyIcon

Container for the icon.

### EmptyTitle

Title text.

### EmptyDescription

Description text.

### EmptyAction

Container for action buttons.
