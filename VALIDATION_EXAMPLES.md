# Create Room Form - Validation Examples

## Visual Examples of Inline Validation

### Example 1: Empty Room Name Field
```
┌─────────────────────────────────────────┐
│ Room Name *                             │
│ ┌─────────────────────────────────────┐ │
│ │                                     │ │ ← User clicks away without typing
│ └─────────────────────────────────────┘ │
│ ⚠️ Room name is required                │ ← Error appears immediately
└─────────────────────────────────────────┘
```

### Example 2: Valid Room Name
```
┌─────────────────────────────────────────┐
│ Room Name *                             │
│ ┌─────────────────────────────────────┐ │
│ │ Deluxe Ocean View Suite             │ │ ← User types valid name
│ └─────────────────────────────────────┘ │
│ ℹ️ Enter a unique name for the room     │ ← Helpful guidance text
└─────────────────────────────────────────┘
```

### Example 3: Invalid Price
```
┌─────────────────────────────────────────┐
│ Price Per Night ($) *                   │
│ ┌─────────────────────────────────────┐ │
│ │ 0                                   │ │ ← User enters 0
│ └─────────────────────────────────────┘ │
│ ⚠️ Price must be greater than $0        │ ← Error appears immediately
└─────────────────────────────────────────┘
```

### Example 4: Valid Price
```
┌─────────────────────────────────────────┐
│ Price Per Night ($) *                   │
│ ┌─────────────────────────────────────┐ │
│ │ 250                                 │ │ ← User enters valid price
│ └─────────────────────────────────────┘ │
│ ℹ️ Enter the nightly rate in dollars    │ ← Helpful guidance text
└─────────────────────────────────────────┘
```

### Example 5: Description with Character Counter
```
┌─────────────────────────────────────────────────────────┐
│ Description                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Spacious room with ocean view, king-size bed,      │ │
│ │ and modern amenities including WiFi, AC, and TV... │ │
│ └─────────────────────────────────────────────────────┘ │
│ ℹ️ Describe the room features... (127/2000 characters) │ ← Live counter
└─────────────────────────────────────────────────────────┘
```

### Example 6: Capacity Exceeds Maximum
```
┌─────────────────────────────────────────┐
│ Capacity (Guests) *                     │
│ ┌─────────────────────────────────────┐ │
│ │ 25                                  │ │ ← User enters 25
│ └─────────────────────────────────────┘ │
│ ⚠️ Capacity cannot exceed 20 guests     │ ← Error appears immediately
└─────────────────────────────────────────┘
```

### Example 7: Valid Capacity
```
┌─────────────────────────────────────────┐
│ Capacity (Guests) *                     │
│ ┌─────────────────────────────────────┐ │
│ │ 4                                   │ │ ← User enters valid capacity
│ └─────────────────────────────────────┘ │
│ ℹ️ Maximum number of guests (1-20)      │ ← Helpful guidance
└─────────────────────────────────────────┘
```

### Example 8: Invalid Image URL
```
┌─────────────────────────────────────────────────────────┐
│ Main Image URL                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ not-a-valid-url                                     │ │ ← Invalid URL
│ └─────────────────────────────────────────────────────┘ │
│ ⚠️ Please enter a valid URL (e.g., https://...)        │ ← Error message
└─────────────────────────────────────────────────────────┘
```

### Example 9: Valid Image URL
```
┌─────────────────────────────────────────────────────────┐
│ Main Image URL                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://hotel.com/images/room-deluxe.jpg           │ │ ← Valid URL
│ └─────────────────────────────────────────────────────┘ │
│ ℹ️ Enter a valid URL for the main room image (optional)│ ← Guidance
└─────────────────────────────────────────────────────────┘
```

### Example 10: Submit Button States

#### Disabled (Has Errors)
```
┌──────────────────────────────────────┐
│  Cancel  │ [Create Room] (grayed)   │ ← Button disabled
└──────────────────────────────────────┘
   ℹ️ Fix validation errors to enable
```

#### Enabled (All Valid)
```
┌──────────────────────────────────────┐
│  Cancel  │ [Create Room] (blue)     │ ← Button enabled
└──────────────────────────────────────┘
   ✅ Ready to submit
```

#### Loading State
```
┌──────────────────────────────────────┐
│  Cancel  │ [Creating...] (loading)  │ ← Submitting
└──────────────────────────────────────┘
   ⏳ Please wait...
```

## Validation Timing

### Real-Time Validation Flow

```
User Action                    System Response
─────────────────────────────────────────────────────────
1. User clicks on field        → Shows placeholder/helper text
2. User types characters       → No validation yet (typing)
3. User clicks away (blur)     → Validates immediately
   OR continues typing         → Validates on each keystroke
4. Error detected              → Shows red border + error message
5. User corrects input         → Error clears immediately
6. All fields valid            → Submit button enables
7. User clicks submit          → Final validation + submission
```

## Complete Form Example

### Form with Multiple Validation States
```
┌─────────────────────────────────────────────────────────────┐
│                    Create New Room                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Room Name *              │  │ Room Type *              │ │
│ │ Deluxe Ocean Suite       │  │ DELUXE ▼                 │ │
│ │ ✓ Valid name             │  │                          │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Price Per Night ($) *    │  │ Description              │ │
│ │ 0                        │  │ Spacious room with...    │ │
│ │ ⚠️ Must be greater than $0│  │ ✓ 85/2000 characters    │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Capacity (Guests) *      │  │ Floor Number *           │ │
│ │ 4                        │  │ 12                       │ │
│ │ ✓ Valid (1-20)           │  │ ✓ Valid (1-200)          │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ ┌──────────────────────────┐  ┌──────────────────────────┐ │
│ │ Size (sq ft)             │  │ Total Rooms *            │ │
│ │ 450                      │  │ 10                       │ │
│ │ ✓ Valid (0-10,000)       │  │ ✓ Valid (1-1000)         │ │
│ └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Main Image URL                                        │  │
│ │ https://hotel.com/deluxe-ocean.jpg                    │  │
│ │ ✓ Valid URL                                           │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ⚠️ Please fix all validation errors before submitting      │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │  Cancel  │  [Create Room] (disabled - has errors)   │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Error Message Reference

| Field | Validation | Error Message |
|-------|-----------|---------------|
| Room Name | Empty | "Room name is required" |
| Room Name | Too long | "Room name must be between 1 and 200 characters" |
| Price | Empty/Zero | "Price must be greater than $0" |
| Price | Negative | "Price must be a positive number" |
| Price | Too high | "Price cannot exceed $1,000,000 per night" |
| Description | Too long | "Description must not exceed 2000 characters" |
| Capacity | Less than 1 | "Capacity must be at least 1 guest" |
| Capacity | More than 20 | "Capacity cannot exceed 20 guests" |
| Floor Number | Less than 1 | "Floor number must be at least 1" |
| Floor Number | More than 200 | "Floor number cannot exceed 200" |
| Size | Negative | "Size cannot be negative" |
| Size | Too large | "Size cannot exceed 10,000 sq ft" |
| Total Rooms | Less than 1 | "Total rooms must be at least 1" |
| Total Rooms | More than 1000 | "Total rooms cannot exceed 1000" |
| Image URL | Invalid format | "Please enter a valid URL (e.g., https://...)" |

## Benefits Summary

✅ **Immediate Feedback**: Users see errors as they type  
✅ **Clear Guidance**: Helpful messages explain what's expected  
✅ **Visual Indicators**: Red borders and error icons for problems  
✅ **Character Counters**: Live feedback on text length  
✅ **Smart Button**: Disabled until all validations pass  
✅ **User-Friendly**: Messages use plain language, not technical jargon  
✅ **Accessible**: Screen readers can announce validation states  
✅ **Professional**: Matches modern web application standards  

---

**Last Updated**: December 24, 2025

