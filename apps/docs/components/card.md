# Card

Displays a card with header, content, and footer.

## Installation

```bash
npx shadcn@latest add @shadniwind/card
```

## Usage

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Text } from "react-native"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <Text>Card Content</Text>
  </CardContent>
  <CardFooter>
    <Text>Card Footer</Text>
  </CardFooter>
</Card>
```

## API Reference

### Card

The main container. Accepts all `View` props.

### CardHeader

Header section. Accepts all `View` props.

### CardTitle

Bold title text. Accepts all `Text` props.

### CardDescription

Muted description text. Accepts all `Text` props.

### CardContent

Main content area. Accepts all `View` props.

### CardFooter

Footer section. Accepts all `View` props.
