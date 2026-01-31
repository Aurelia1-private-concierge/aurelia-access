
# Update LinkedIn Button to Direct Profile Link

## Overview
Update the existing LinkedIn social media button in the footer to link directly to your personal LinkedIn profile instead of the current "follow member" discovery page.

## What Will Change

The LinkedIn button in the footer currently links to:
```
https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=tyrone-mitchell-730a253a4
```

This will be updated to link directly to your profile:
```
https://www.linkedin.com/in/tyrone-m-730a253a4
```

## Implementation

**File to modify:** `src/components/Footer.tsx`

Update line 29 in the `socialLinks` array to use the direct profile URL:
```typescript
{
  icon: Linkedin,
  href: "https://www.linkedin.com/in/tyrone-m-730a253a4",
  label: "LinkedIn",
  isInternal: false
}
```

## Result
Visitors who click the LinkedIn icon in the footer will be taken directly to your LinkedIn profile page, providing a cleaner and more direct connection experience.
