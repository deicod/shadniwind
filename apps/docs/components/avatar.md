# Avatar

An image element with a fallback for representing the user.

## Installation

```bash
npx shadcn@latest add @shadniwind/avatar
```

## Usage

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"

<Avatar>
  <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
  <AvatarFallback name="Shad Cn" />
</Avatar>
```

## API Reference

### Avatar

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | The size of the avatar. |

### AvatarImage

Accepts all standard `Image` props.

### AvatarFallback

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | - | Used to generate initials if children are not provided. |
| `delayMs` | `number` | `0` | Delay in ms before showing the fallback. |
