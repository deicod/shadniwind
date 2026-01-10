# Breadcrumb

Displays the path to the current resource using a hierarchy of links.

## Installation

```bash
npx shadniwind@latest add breadcrumb
```

## Usage

```tsx
import { Breadcrumb } from "~/components/ui/breadcrumb"
import { useRouter } from "expo-router"

const router = useRouter()

<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumb", current: true },
  ]}
  onItemPress={(item) => {
    if (item.href) {
      router.push(item.href)
    }
  }}
/>
```

## API Reference

### Breadcrumb

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | `BreadcrumbItem[]` | - | An array of breadcrumb items. |
| `onItemPress` | `(item: BreadcrumbItem, index: number) => void` | - | Callback called when an item is pressed. |
| `separator` | `React.ReactNode` | `"/"` | The separator to display between items. |

### BreadcrumbItem

| Prop | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | The text to display for the item. |
| `href` | `string` | The URL to navigate to when pressed. |
| `current` | `boolean` | Whether the item is the current page. |
