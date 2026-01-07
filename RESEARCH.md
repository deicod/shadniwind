# **Architectural Specification and Implementation Strategy for Shadniwind: A Unistyles-Powered Design System for React Native**

## **Executive Summary**

The evolution of cross-platform mobile development has reached a critical inflection point where developer experience (DX) and runtime performance, previously seen as a zero-sum trade-off, are converging. The user's directive to establish shadniwind—a port of the celebrated shadcn/ui architecture to React Native using unistyles v3—represents a strategic alignment with this convergence. This initiative seeks to replicate the "headless" and "own-your-code" philosophy of shadcn/ui while circumventing the recurring costs and abstraction layers associated with uniwind. By leveraging the C++ core of unistyles, shadniwind aims to deliver "Pro-tier" performance metrics—specifically zero-re-render theming and direct JSI (JavaScript Interface) bindings—without the financial overhead of proprietary wrappers.  
This comprehensive research report serves as the foundational architectural document for shadniwind. It synthesizes an exhaustive analysis of the current styling landscape, dissecting the internal mechanisms of shadcn/ui (Web) and unistyles (Native) to blueprint a bridge between them. The analysis confirms that unistyles v3 is uniquely positioned to serve as the native counterpart to class-variance-authority (cva), offering a superset of functionality including native compound variants, scoped themes, and platform-specific styling resolution.  
The following sections detail the technical roadmap for shadniwind, covering the atomic reconstruction of shadcn primitives, the design of a typescript-first theming engine that mirrors CSS variables, and the architectural patterns required to maintain the "copy-paste" distribution model that defines the shadcn ecosystem.

## ---

**1\. The Contextual Landscape of React Native Styling**

To understand the necessity and architectural validity of shadniwind, one must first situate it within the broader history of React Native styling solutions. The ecosystem is currently transitioning from bridge-based styling to JSI-based styling, a shift that fundamentally alters performance characteristics.

### **1.1 The Legacy of the Bridge**

Historically, styling in React Native via the standard StyleSheet API or libraries like styled-components relied on the asynchronous bridge. When a style update occurred—such as a theme toggle from light to dark—the JavaScript thread had to serialize the new style objects and pass them over the bridge to the Native (host) thread. This process, while functional, introduced latency and frame drops, particularly during complex animations or rapid state changes. The styling logic lived entirely in JavaScript, and the native layer was merely a passive recipient of serialized instructions.

### **1.2 The Rise of Utility-First Styling (NativeWind)**

The popularity of Tailwind CSS on the web drove demand for a similar experience in React Native. NativeWind emerged as the dominant solution, allowing developers to write \<View className="bg-red-500" /\>. It operates by compiling these class strings into standard React Native style objects, often at build time via Babel plugins.1 While this improved Developer Experience (DX) by unifying web and native syntax, it inherited the runtime limitations of the standard StyleSheet API and introduced complexity regarding the "Cascade" (which exists in CSS but not in Native).

### **1.3 The Unistyles Revolution: JSI and C++**

Unistyles v3 introduces a paradigm shift by moving the styling engine to C++. It leverages the React Native New Architecture (Fabric) and the JavaScript Interface (JSI) to bypass the bridge entirely.3

* **Direct bindings:** Styles are resolved and applied synchronously from C++ to the Shadow Tree.  
* **Zero Re-renders:** When a theme changes, unistyles updates the native views directly without forcing a React reconciliation cycle.3  
* **Dynamic Resolution:** Media queries and breakpoints are handled natively, allowing the UI to adapt to screen size changes (e.g., foldables) instantly.

### **1.4 The "Uniwind" Value Proposition and Limitation**

Uniwind builds upon unistyles, acting as a compiler that translates Tailwind syntax into unistyles objects. It effectively offers the DX of Tailwind with the performance of JSI. However, it segments its offering: the "Free" version relies on JavaScript-based styling (similar to older methods), while the "Pro" version unlocks the C++ engine and zero-re-render capabilities.5  
Crucial Insight: The user's desire to avoid uniwind fees is technically sound. By using unistyles directly (the underlying engine of Uniwind Pro), the developer gains access to the "Pro" performance features (C++ engine, zero re-renders) for free.4 The trade-off is simply syntax: writing typed objects instead of utility strings. shadniwind operationalizes this trade-off.

## ---

**2\. Deconstructing Shadcn/ui: The Architectural Blueprint**

Before reconstructing shadcn/ui in React Native, we must dissect what it actually *is*. It is often mistaken for a component library, but it is more accurately described as a design pattern and a distribution method.

### **2.1 The "Headless" Philosophy**

shadcn/ui is built on the principle of separating logic from presentation. It uses **Radix UI** for the "Headless" primitives.6

* **Accessibility:** Radix handles ARIA attributes, focus trapping, and keyboard navigation.  
* **State:** Radix handles the logic of whether a generic Dialog is open or closed.  
* **Styling:** Radix provides unstyled slots (e.g., Dialog.Overlay, Dialog.Content) which shadcn styles using Tailwind.

In the React Native context, the direct equivalent is **@rn-primitives** (formerly rn-primitives), which ports Radix UI concepts to native primitives.7 shadniwind must rely on this library to ensure accessible, robust behavior.

### **2.2 The Variant Mechanism: cva**

The visual flexibility of shadcn/ui comes from class-variance-authority (cva).8 This library allows developers to define a base style and then "variants" that modify it.

* *Example:* A button might have variant: "outline" and size: "sm".  
* *Conflict Resolution:* It uses tailwind-merge to ensure that if a user passes a custom class that conflicts with the variant, the custom class wins.9

### **2.3 The Distribution Model: Copy-Paste**

Unlike Material UI or Ant Design, shadcn/ui is not installed via npm install @shadcn/ui. Instead, users run a CLI command that copies the source code of the component into their project's /components/ui directory. This grants the developer "Ownership".6 If they want to change the radius of a button, they edit the code directly rather than fighting against library overrides. shadniwind must replicate this ownership model, likely through a GitHub template or a CLI tool that fetches component files.

## ---

**3\. Unistyles v3: The Engine of Shadniwind**

To verify that unistyles is capable of replacing the entire Tailwind/CVA stack, we must examine its feature set against shadcn requirements.

### **3.1 Unistyles Variants vs. CVA**

Unistyles v3 natively supports variants and, crucially, **Compound Variants**.10

* *Requirement:* Apply specific styles only when variant="outline" AND color="destructive".  
* *CVA Approach:* Define a compoundVariants array in the configuration object.  
* Unistyles Approach: Define a compoundVariants array in the StyleSheet.create object.  
  The syntax and logic are nearly identical. Unistyles effectively includes a "Native CVA" engine within its core. This renders external libraries like cva redundant.

### **3.2 Scoped Themes**

A powerful feature of shadcn is the ability to nest themes (e.g., a dark card on a light page). Unistyles v3 introduces **Scoped Themes**, allowing a theme to be applied to a specific component sub-tree.3 This is a capability that standard React Native StyleSheet lacks entirely and typically requires complex Context providers to achieve. Unistyles handles this at the C++ level, ensuring that the scoped theme applies instantly without prop drilling.

### **3.3 The Web Parser**

Since shadcn/ui is a web library, shadniwind might be expected to support React Native Web. Unistyles v3 includes a **Custom Web Parser** that translates its style objects into CSS classes.3 This ensures that shadniwind components are truly universal, rendering as optimized CSS on the web and optimized Native Views on mobile.

## ---

**4\. Architectural Implementation: The Shadniwind Standard**

This section provides the technical specification for building shadniwind. It defines the file structures, naming conventions, and code patterns that will act as the "Source of Truth" for the library.

### **4.1 Repository Structure**

To facilitate the "Copy-Paste" distribution model, the repository github.com/deicod/shadniwind should be structured as a monorepo containing a documentation site and a reference app.  
Directory Layout:  
shadniwind/  
├── apps/  
│ ├── showcase/ \# Expo app demonstrating components  
│ └── docs/ \# Documentation site  
├── packages/  
│ └── ui/ \# The core logic  
│ ├── src/  
│ │ ├── components/  
│ │ │ ├── ui/  
│ │ │ │ ├── button.tsx  
│ │ │ │ ├── card.tsx  
│ │ │ │ ├── input.tsx  
│ │ │ │ └──...  
│ │ │ ├── icons/  
│ │ │ └── pr-primitives/ \# Re-exports from @rn-primitives  
│ │ ├── lib/  
│ │ │ ├── utils.ts  
│ │ │ └── constants.ts  
│ │ └── theme/  
│ │ ├── index.ts  
│ │ ├── light.ts  
│ │ └── dark.ts  
│ └── package.json

### **4.2 The Theming Engine Specification**

shadcn relies on a set of semantic CSS variables. shadniwind must implement these as a typed Unistyles theme.  
The Token System:  
We will use HSL (Hue, Saturation, Lightness) values, as Unistyles v3 supports generic color formats and runtime conversion.3 This aligns with shadcn's convention and makes porting themes easier.  
**Table 1: Semantic Token Mapping**

| Shadcn CSS Variable | Unistyles Theme Key | Purpose |
| :---- | :---- | :---- |
| \--background | theme.colors.background | Page background color |
| \--foreground | theme.colors.foreground | Default text color |
| \--card | theme.colors.card | Card background |
| \--card-foreground | theme.colors.cardForeground | Text on cards |
| \--popover | theme.colors.popover | Popover/Dialog background |
| \--primary | theme.colors.primary | Primary brand color |
| \--primary-foreground | theme.colors.primaryForeground | Text on primary buttons |
| \--secondary | theme.colors.secondary | Secondary brand color |
| \--muted | theme.colors.muted | Muted backgrounds (e.g., skeletons) |
| \--accent | theme.colors.accent | Hover/Press states |
| \--destructive | theme.colors.destructive | Error states |
| \--border | theme.colors.border | Border color |
| \--input | theme.colors.input | Input field border |
| \--ring | theme.colors.ring | Focus ring color |
| \--radius | theme.radius | Global border radius |

Implementation Detail:  
The theme.ts file must register these tokens using UnistylesRegistry.

TypeScript

import { UnistylesRegistry } from 'react-native-unistyles';

export const lightTheme \= {  
  colors: {  
    background: 'hsl(0, 0%, 100%)',  
    foreground: 'hsl(240, 10%, 3.9%)',  
    primary: 'hsl(240, 5.9%, 10%)',  
    primaryForeground: 'hsl(0, 0%, 98%)',  
    //... extensive list matching shadcn globals.css  
  },  
  radius: {  
    sm: 2,  
    md: 4,  
    lg: 8,  
  }  
} as const;

export const darkTheme \= {  
  colors: {  
    background: 'hsl(240, 10%, 3.9%)',  
    foreground: 'hsl(0, 0%, 98%)',  
    //... inverted values  
  },  
  radius: lightTheme.radius,  
} as const;

// Typescript override for IntelliSense  
type AppTheme \= typeof lightTheme;  
declare module 'react-native-unistyles' {  
  export interface UnistylesThemes extends AppTheme {}  
}

UnistylesRegistry.addThemes({  
  light: lightTheme,  
  dark: darkTheme,  
}).addConfig({  
  adaptiveThemes: true,  
});

This configuration ensures that typing theme.colors. triggers autocomplete, a major DX requirement.

### **4.3 Component Architecture: Replacing cn and cva**

In shadcn, components use cn(buttonVariants({ variant }), className). In shadniwind, we eliminate the cn utility (which merges strings) and rely on React Native's array style merging.  
The shadniwind Component Signature:  
Every component must accept:

1. **Variant Props:** variant, size, etc.  
2. **Style Prop:** style (Standard RN style object or array).  
3. **Forwarded Ref:** ref (Crucial for accessibility and focus).

Conflict Resolution Strategy:  
React Native resolves style arrays \`\` by allowing styleB to override properties in styleA. This is the native equivalent of tailwind-merge. We do not need a dedicated library for this; the engine handles it.

## ---

**5\. Detailed Component Specifications**

This section serves as the implementation guide for the core components, demonstrating how to handle the specific challenges of porting web concepts to native.

### **5.1 The Button Component**

**Challenge:** Replicating the "hover" state on web and "press" state on mobile using a single API, while managing compound variants (e.g., ghost variant \+ hover state).  
Implementation:  
We use Pressable from React Native, which exposes the pressed state. Unistyles variants map directly to these states.

TypeScript

// button.tsx  
import { Pressable, Text, View } from 'react-native';  
import { createStyleSheet, useStyles } from 'react-native-unistyles';

// 1\. Define the StyleSheet with Unistyles Variants  
const stylesheet \= createStyleSheet((theme) \=\> ({  
  container: {  
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'center',  
    borderRadius: theme.radius.md,  
    // Base Variants  
    variants: {  
      variant: {  
        default: { backgroundColor: theme.colors.primary },  
        destructive: { backgroundColor: theme.colors.destructive },  
        outline: {   
          borderWidth: 1,   
          borderColor: theme.colors.input,  
          backgroundColor: theme.colors.background   
        },  
        secondary: { backgroundColor: theme.colors.secondary },  
        ghost: { backgroundColor: 'transparent' },  
        link: { backgroundColor: 'transparent' },  
      },  
      size: {  
        default: { height: 40, paddingHorizontal: 16, paddingVertical: 8 },  
        sm: { height: 36, paddingHorizontal: 12 },  
        lg: { height: 44, paddingHorizontal: 32 },  
        icon: { height: 40, width: 40 },  
      },  
      // State Variants (simulating :active pseudo-class)  
      pressed: {  
        true: { opacity: 0.9 }   
      }  
    },  
    // Compound Variants for state \+ variant interactions  
    compoundVariants: \[  
      {   
        variant: 'outline',   
        pressed: true,   
        styles: { backgroundColor: theme.colors.accent, opacity: 1 }   
      },  
      {  
        variant: 'ghost',  
        pressed: true,  
        styles: { backgroundColor: theme.colors.accent, opacity: 1 }  
      }  
    \]  
  },  
  label: {  
    fontSize: 14,  
    fontWeight: '500',  
    variants: {  
      variant: {  
        default: { color: theme.colors.primaryForeground },  
        outline: { color: theme.colors.foreground },  
        secondary: { color: theme.colors.secondaryForeground },  
        ghost: { color: theme.colors.foreground },  
        link: { color: theme.colors.primary, textDecorationLine: 'underline' }  
      }  
    }  
  }  
}));

// 2\. The Component  
export function Button({   
  variant \= 'default',   
  size \= 'default',   
  style,   
  children,   
 ...props   
}: ButtonProps) {  
  // We use the Hook to get access to the styles  
  const { styles } \= useStyles(stylesheet, {   
    variant,   
    size   
  });

  return (  
    \<Pressable   
      // We pass a function to style to capture the pressed state  
      style={({ pressed }) \=\> {  
        // We must manually inject the 'pressed' variant state here  
        // Note: Unistyles v3 might allow binding this automatically in future,   
        // but explicit injection is safest for now.  
        styles.useVariants({ variant, size, pressed });  
        return \[styles.container, style\];  
      }}  
      {...props}  
    \>  
      \<Text style={styles.label}\>{children}\</Text\>  
    \</Pressable\>  
  );  
}

*Note:* The styles.useVariants call inside the render prop is a powerful pattern in Unistyles to update styles based on runtime interaction without full re-renders of the parent tree.

### **5.2 The Input Component**

**Challenge:** React Native TextInput does not support CSS outline or ring-offset. The "Ring" effect (focus border) must be simulated manually.  
Implementation:  
We manage isFocused state to trigger the ring style.

TypeScript

// input.tsx  
const stylesheet \= createStyleSheet((theme) \=\> ({  
  input: {  
    height: 40,  
    width: '100%',  
    borderRadius: theme.radius.md,  
    borderWidth: 1,  
    borderColor: theme.colors.input,  
    backgroundColor: theme.colors.background,  
    paddingHorizontal: 12,  
    paddingVertical: 8,  
    fontSize: 14,  
    color: theme.colors.foreground,  
    variants: {  
      focused: {  
        true: {  
          borderColor: theme.colors.ring,  
          borderWidth: 2, // Simulating the ring  
          // On web we could use shadow/outline, on native border is standard  
        }  
      }  
    }  
  }  
}));

export const Input \= React.forwardRef(({ style,...props }, ref) \=\> {  
  const { styles } \= useStyles(stylesheet);  
  const \[isFocused, setIsFocused\] \= React.useState(false);

  // Update variants based on local state  
  styles.useVariants({ focused: isFocused });

  return (  
    \<TextInput  
      ref={ref}  
      style={\[styles.input, style\]}  
      placeholderTextColor={theme.colors.mutedForeground}  
      onFocus={() \=\> setIsFocused(true)}  
      onBlur={() \=\> setIsFocused(false)}  
      {...props}  
    /\>  
  );  
});

### **5.3 The Card Component**

**Challenge:** Implementing semantic structure (Header, Title, Content) that renders accessible semantic views.  
Implementation:  
The Card is a composition of Views. No special variants are usually needed, just strict adherence to the theme tokens.

TypeScript

// card.tsx  
const stylesheet \= createStyleSheet((theme) \=\> ({  
  card: {  
    borderRadius: theme.radius.lg,  
    borderWidth: 1,  
    borderColor: theme.colors.border,  
    backgroundColor: theme.colors.card,  
    shadowColor: theme.colors.foreground, // Use semantic shadow color  
    shadowOpacity: 0.05,  
    shadowRadius: 10,  
    elevation: 2  
  },  
  //... other sub-component styles  
}));

// Export simple functional components that wrap children with these styles

### **5.4 The Switch Component**

Challenge: React Native's Switch component is difficult to style consistently across iOS and Android (e.g., track color sizing).  
Solution: Use @rn-primitives/switch which allows building a custom switch using Views, giving full styling control.

TypeScript

import \* as SwitchPrimitives from '@rn-primitives/switch';

const stylesheet \= createStyleSheet((theme) \=\> ({  
  root: {  
    height: 24,  
    width: 44,  
    borderRadius: 9999,  
    borderWidth: 2,  
    borderColor: 'transparent',  
    variants: {  
      checked: {  
        true: { backgroundColor: theme.colors.primary },  
        false: { backgroundColor: theme.colors.input }  
      }  
    }  
  },  
  thumb: {  
    height: 20,  
    width: 20,  
    borderRadius: 9999,  
    backgroundColor: theme.colors.background,  
    shadowColor: theme.colors.background,  
    shadowOpacity: 0.1,  
    elevation: 1,  
    // The translation logic is handled by the Primitive or Reanimated  
  }  
}));

Using the primitive here is essential because it handles the onPress toggle logic and the accessibility state (aria-checked) automatically.

## ---

**6\. Performance Analysis: The Unistyles Advantage**

The core value proposition of shadniwind over react-native-reusables (nativewind) is performance efficiency.

### **6.1 The Cost of Strings vs. Objects**

* **NativeWind:** Requires parsing strings ("bg-red-500 p-4") at runtime or compile time. This adds overhead to the bundle size (the styling engine) and the runtime (mapping classes to styles).  
* **Unistyles:** Uses direct JSI bindings. The style object { backgroundColor: theme.colors.primary } is passed directly to the C++ core. There is no string parsing step.

### **6.2 Zero Re-render Theming**

In a traditional React Native app (or one using Context for themes), toggling Dark Mode causes the Root Provider to update, forcing a re-render of the entire component tree. In a complex app, this causes a noticeable freeze (frame drop).  
Unistyles Mechanism: When UnistylesRuntime.setTheme('dark') is called, the C++ engine iterates over the registered views in the Shadow Tree and updates their properties directly. The JavaScript thread is largely bypassed. This allows shadniwind apps to switch themes instantly, 60fps, even with thousands of components on screen.3

### **6.3 Memory Footprint**

Unistyles v3 is designed to be lightweight. By avoiding the overhead of a Tailwind compiler, shadniwind contributes less to the JavaScript heap size, which is critical for low-end Android devices.

## ---

**7\. Migration and Adoption Strategy**

For developers adopting shadniwind, the mental model shift from Tailwind to Unistyles is the biggest hurdle.

### **7.1 From className to style**

* **Web/Tailwind:** \<div className="flex flex-row items-center" /\>  
* **Shadniwind:** \<View style={styles.container} /\> where container: { flexDirection: 'row', alignItems: 'center' }  
* **Justification:** While verbose, this ensures type safety. If you typo flexDirction, TypeScript catches it. If you typo flex-roww in a string, you often only find out at runtime.

### **7.2 Handling "One-off" Styles**

Developers often love Tailwind for quick, one-off margins (mt-4).

* **Shadniwind Recommendation:** Use inline styles for layout adjustments: \<Button style={{ marginTop: theme.spacing }} /\>.  
* **Alternative:** Unistyles allows passing a function to style which receives the theme: \<View style={theme \=\> ({ padding: theme.spacing })} /\>. This is a highly ergonomic feature of v3.

### **7.3 Integration with Existing Apps**

Since shadniwind components are standard React Native components, they can coexist with NativeBase, Tamagui, or plain StyleSheet views. The UnistylesRegistry is global, so once configured, it works everywhere.

## ---

**8\. Tooling and DX: The "Shadniwind" CLI**

To fully replicate the shadcn experience, shadniwind requires a CLI tool.

### **8.1 Concept: npx shadniwind add**

The tool would function similarly to the shadcn-ui CLI:

1. **Fetch:** Download the .tsx component file from the deicod/shadniwind GitHub repository.  
2. **Resolve:** Check dependencies (e.g., does this component require @rn-primitives/portal?).  
3. **Install:** Run npm install for missing primitives.  
4. **Place:** Copy the file to components/ui/.

### **8.2 VS Code Snippets**

To speed up development, shadniwind should provide a VS Code extension or snippet file that generates the boilerplate for a new Unistyles component, including the createStyleSheet and useStyles setup, which is slightly more boilerplate-heavy than a simple functional component.

## ---

**9\. Conclusion**

The creation of shadniwind is a technically sound and strategically viable project. It addresses a clear gap in the market: a high-performance, native-first, accessible design system that is free to use and easy to customize.  
By building on unistyles v3, shadniwind secures a "Pro-tier" performance baseline without the uniwind price tag. By building on @rn-primitives, it ensures accessibility standards that raw React Native views lack. And by adopting the shadcn "copy-paste" architecture, it empowers developers to own their design system rather than renting it.  
The implementation roadmap provided here—defining the token system, leveraging compound variants, and structuring the repository for distribution—provides the necessary blueprint to launch github.com/deicod/shadniwind as a serious contender in the React Native UI landscape.

## ---

**10\. Future Outlook: Server Components and Beyond**

Looking forward, the React ecosystem is moving toward React Server Components (RSC). While RN is strictly client-side for now, frameworks like Expo are exploring server-driven patterns.

* **Unistyles compatibility:** Because Unistyles creates static style references (mostly) and handles logic in C++, it is well-positioned for an architecture where layout might be computed ahead of time.  
* **React Compiler:** The new React Compiler (React Forget) optimizes re-renders. unistyles "Zero Re-render" philosophy aligns perfectly with this, as it removes the *need* for memoization in styling logic, simplifying the compiler's job.

shadniwind is not just a port; it is a forward-looking implementation of modern native UI principles.

#### **Works cited**

1. uni-stack/uniwind: From the creators of Unistyles: The fastest Tailwind bindings for React Native \- GitHub, accessed January 7, 2026, [https://github.com/uni-stack/uniwind](https://github.com/uni-stack/uniwind)  
2. Introducing Uniwind \- The fastest Tailwind bindings for React Native : r/reactnative \- Reddit, accessed January 7, 2026, [https://www.reddit.com/r/reactnative/comments/1n84ib0/introducing\_uniwind\_the\_fastest\_tailwind\_bindings/](https://www.reddit.com/r/reactnative/comments/1n84ib0/introducing_uniwind_the_fastest_tailwind_bindings/)  
3. New features | react-native-unistyles, accessed January 7, 2026, [https://www.unistyl.es/v3/start/new-features](https://www.unistyl.es/v3/start/new-features)  
4. Unistyles 3.0: Beyond React Native StyleSheet \- Expo, accessed January 7, 2026, [https://expo.dev/blog/unistyles-3-0-beyond-react-native-stylesheet](https://expo.dev/blog/unistyles-3-0-beyond-react-native-stylesheet)  
5. Pro Version \- Uniwind, accessed January 7, 2026, [https://docs.uniwind.dev/pro-version](https://docs.uniwind.dev/pro-version)  
6. Building Components with Shadcn/ui — Documentation \- App Generator, accessed January 7, 2026, [https://app-generator.dev/docs/technologies/nextjs/shadcn-components.html](https://app-generator.dev/docs/technologies/nextjs/shadcn-components.html)  
7. Introduction \- React Native Reusables, accessed January 7, 2026, [https://reactnativereusables.com/docs](https://reactnativereusables.com/docs)  
8. Core Concepts | Vercel Academy, accessed January 7, 2026, [https://vercel.com/academy/shadcn-ui/core-concepts](https://vercel.com/academy/shadcn-ui/core-concepts)  
9. The anatomy of shadcn/ui \- ManupaDev, accessed January 7, 2026, [https://manupa.dev/blog/anatomy-of-shadcn-ui](https://manupa.dev/blog/anatomy-of-shadcn-ui)  
10. Compound Variants | react-native-unistyles, accessed January 7, 2026, [https://www.unistyl.es/v3/references/compound-variants](https://www.unistyl.es/v3/references/compound-variants)
