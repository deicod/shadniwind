# Sidebar

A composable, responsive sidebar component.

## Installation

```bash
npx shadcn@latest add @shadniwind/sidebar
```

## Usage

```tsx
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar"
import { Text } from "react-native"

export default function SidebarDemo() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Text>My App</Text>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Text>Dashboard</Text>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
```

## API Reference

### SidebarProvider

The root provider that manages the sidebar state.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultOpen` | `boolean` | `true` | Default open state on desktop. |
| `open` | `boolean` | - | Controlled open state. |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes. |

### Sidebar

The main sidebar container.

### SidebarTrigger

A button to toggle the sidebar.

### SidebarContent

Scrollable content area.

### SidebarGroup

Grouping for menu items.

### SidebarMenu

A list of menu items.

### SidebarMenuButton

A button within a menu item.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `boolean` | `false` | Whether the button is active. |
| `asChild` | `boolean` | `false` | Render as child component. |
