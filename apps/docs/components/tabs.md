# Tabs

A set of layered sections of content—known as tab panels—that are displayed one at a time.

## Installation

```bash
npx shadcn@latest add @shadniwind/tabs
```

## Usage

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Text, View } from "react-native"

<Tabs defaultValue="account" style={{ width: 400 }}>
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <Text>Make changes to your account here.</Text>
  </TabsContent>
  <TabsContent value="password">
    <Text>Change your password here.</Text>
  </TabsContent>
</Tabs>
```

## API Reference

### Tabs

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The controlled value of the active tab. |
| `defaultValue` | `string` | - | The initial value of the active tab. |
| `onValueChange` | `(value: string) => void` | - | Event handler when value changes. |

### TabsList

Container for triggers.

### TabsTrigger

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The unique value of the tab. |
| `disabled` | `boolean` | `false` | Prevents user interaction. |

### TabsContent

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | - | The unique value of the content. |
