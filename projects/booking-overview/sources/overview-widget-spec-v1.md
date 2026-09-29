# Booking Overview — Pricing & Ticket Matrix (V1)

## 1. Goal

Build a compact `Passenger × Segment` matrix that shows the actual **Pricing** and **Ticket** entities related to each passenger and flight segment.

The widget is a factual overview, not an audit tool. It must show what exists in the booking and what status each entity currently has, without adding extra business interpretation, severity scoring, or recommendations.

---

## 2. Problem

Pricing and Ticket data currently live in separate parts of Booking Overview. In bookings with multiple passengers, segments, repricing, exchanges, voids, and historical documents, the user has to manually correlate those entities.

A simplified model such as “Ticket wins over Pricing” is not sufficient because both entities may exist at the same time and older entities may still be relevant as booking history.

The widget must therefore:

- show which Pricing and Ticket entities exist for every `Passenger × Segment` combination;
- preserve the visible document history;
- make Pricing and Ticket easy to distinguish when scanning the matrix;
- expose non-default statuses without turning the table into a warning dashboard;
- allow navigation to the original entity in Booking Overview.

---

## 3. Core V1 Principle

> Show the entities and statuses that actually exist in the booking. Do not invent additional analytical states.

The widget does **not** decide whether a booking is good, bad, valid, invalid, or requires attention.

Status belongs to an individual Pricing or Ticket entity, not to the matrix cell as a whole.

---

## 4. Matrix Structure

### Rows

Rows represent flight segments in itinerary order.

Each segment row should expose enough information to identify the segment, for example:

- segment reference: `S1`, `S2`, etc.;
- route: `KBP–FRA`;
- departure date;
- flight number.

### Columns

Columns represent passengers in the original booking/PNR order.

Passenger header format:

```text
P1 / ADT
P2 / ADT
P3 / CHD
```

### Cell

Each cell represents one:

```text
Passenger × Segment
```

A cell may contain:

- one Pricing;
- multiple Pricing records from history;
- one Ticket;
- multiple Tickets;
- both Pricing and Ticket entities;
- no visible documents.

The same entity may appear in more than one cell when it applies to multiple passenger/segment combinations. This is expected: the widget is a coverage matrix, not a unique-document list.

---

## 5. Entity Ordering

All visible entities inside a cell are sorted chronologically:

```text
oldest → newest
```

The oldest entity is displayed at the top and the newest at the bottom.

Sorting date:

- Pricing → `Created date`
- Ticket → `Issued date`

Do not infer a workflow order such as `Pricing → Ticket`. Use the actual timestamps supplied by the system.

If two entities have the same timestamp, use a stable deterministic fallback order from the backend so that the UI order does not change between renders.

---

## 6. Pricing

### Visible fields

A Pricing item contains:

- Pricing icon;
- label `Pricing`;
- optional status badge.

### Pricing statuses

Supported statuses:

- `Active`
- `Ticketed`
- `Unknown`
- `Reprice required`
- `Itinerary changed`
- `Inactive`
- `Deleted`

### Display rules

#### Active

`Active` is the default state.

Do **not** show an `Active` badge.

```text
Pricing
```

#### Ticketed

Show the Pricing entity and the `Ticketed` badge.

```text
Pricing    [Ticketed]
```

Do not hide Ticketed Pricing just because a Ticket exists. It is part of the visible history.

#### Unknown

```text
Pricing    [Unknown]
```

#### Reprice required

```text
Pricing    [Reprice required]
```

#### Itinerary changed

```text
Pricing    [Itinerary changed]
```

#### Inactive

```text
Pricing    [Inactive]
```

#### Deleted

`Deleted` Pricing is excluded from this widget.

Do not render it in the cell.

---

## 7. Ticket

### Visible fields

A Ticket item contains:

- Ticket icon;
- label `Ticket`;
- ticket number;
- optional status badge.

Example active Ticket:

```text
Ticket
421-1324311324
```

### Ticket states in V1

Supported states:

- `Active`
- `Voided`

### Display rules

#### Active

`Active` is the default state.

Do **not** show an `Active` badge.

```text
Ticket
421-1324311324
```

#### Voided

Render the Ticket and show a `Voided` badge.

```text
Ticket    [Voided]
421-1324311324
```

Do not remove Voided Tickets from history.

---

## 8. Empty Cell

After filtering hidden entities such as `Deleted Pricing`, if the cell contains no visible Pricing or Ticket, render the dedicated empty state:

```text
No document
```

The final design uses a visually noticeable placeholder rather than a simple dash, because absence of a document must remain easy to detect when scanning a large matrix.

The placeholder is not an error or severity indicator. It is only an explicit empty state.

Recommended visual treatment from the current design:

- subtle outlined container;
- light diagonal pattern;
- `No document` label;
- neutral colors.

---

## 9. Visual System

Pricing and Ticket use the same general item anatomy but must remain visually distinguishable during fast scanning.

### Shared anatomy

```text
[type icon]  primary content              [optional status badge]
             secondary identifier
```

### Pricing styling

Use the Pricing accent consistently:

- orange Pricing icon;
- orange `Pricing` label;
- thin orange line/accent on the left.

Do not fill the whole card with a strong orange background.

### Ticket styling

Use a neutral Ticket treatment:

- neutral/dark Ticket icon;
- neutral text;
- subtle neutral left accent;
- ticket number on the second line.

### Why the distinction is minimal

The widget can contain many passengers, segments, and historical entities.

Avoid strong full-card colors or per-status traffic-light colors. The matrix should remain calm and readable, not become a visual “Christmas tree”.

Color is used primarily to distinguish **entity type**, not severity.

---

## 10. Status Badge Rules

Status badge is positioned on the right side of the entity item.

Show a badge only when the status carries additional information beyond the default active state.

### No badge

- Pricing `Active`
- Ticket `Active`

### Badge

Pricing:

- `Ticketed`
- `Unknown`
- `Reprice required`
- `Itinerary changed`
- `Inactive`

Ticket:

- `Voided`

`Deleted Pricing` is not rendered.

Badges should remain secondary to the entity itself and should not use a complex severity color system in V1.

---

## 11. Interaction

Each Pricing and Ticket item is individually clickable.

### Click behavior

- Pricing → navigate/open the corresponding Pricing entity in Booking Overview.
- Ticket → navigate/open the corresponding Ticket entity in Booking Overview.

The navigation target must identify the exact entity clicked.

### Hover behavior

The current design uses a hover cover/state to communicate that the item is interactive.

Reason: there is not enough persistent horizontal space for an additional navigation icon because the right side may already contain a status badge.

Requirements:

- entire entity item is the click target;
- hover must clearly communicate interactivity;
- hover must not change the underlying entity identity or navigation target.

---

## 12. Rendering Logic

Recommended render pipeline for each `Passenger × Segment` cell:

```text
1. Load all Pricing entities linked to the passenger and segment.
2. Load all Ticket entities linked to the passenger and segment.
3. Exclude Pricing where status = Deleted.
4. Normalize each visible record into a common display model.
5. Merge Pricing and Ticket records into one list.
6. Sort ascending by:
   - Pricing.createdAt
   - Ticket.issuedAt
7. Render each entity using its type-specific component.
8. If the visible list is empty, render "No document".
```

Pseudo-model:

```ts
type OverviewDocument =
  | {
      type: 'pricing'
      id: string
      status:
        | 'Active'
        | 'Ticketed'
        | 'Unknown'
        | 'Reprice required'
        | 'Itinerary changed'
        | 'Inactive'
      createdAt: Date
      navigationTarget: string
    }
  | {
      type: 'ticket'
      id: string
      ticketNumber: string
      status: 'Active' | 'Voided'
      issuedAt: Date
      navigationTarget: string
    }
```

`Deleted` Pricing should be removed before this display model is rendered.

---

## 13. Suggested Component Architecture

```text
BookingOverviewMatrix
├── MatrixHeader
│   ├── SegmentHeader
│   └── PassengerHeader[]
├── SegmentRow[]
│   ├── SegmentCell
│   └── PassengerSegmentCell[]
│       ├── PricingItem[]
│       ├── TicketItem[]
│       └── NoDocumentState
```

A reusable base entity item can be used internally:

```text
OverviewEntityItem
├── typeIcon
├── title
├── secondaryText?
├── statusBadge?
├── typeAccent
└── hover/click behavior
```

Variants:

```text
type = Pricing | Ticket
status = supported status
interactive = true
```

---

## 14. Out of Scope for V1

Do not add the following to this widget in V1:

- EMD;
- services;
- payment status;
- coupon-level Ticket statuses;
- automatic audit results;
- severity levels;
- warnings/recommendations generated by the widget;
- “good/bad” booking state;
- automatic prioritization of one document over another;
- full Pricing metadata;
- full Ticket metadata.

Those belong to specialized widgets or future analysis/audit functionality.

---

## 15. Important Product Rules

1. Ticket and Pricing are **not mutually exclusive**.
2. Never hide Pricing simply because a Ticket exists.
3. `Ticketed Pricing` remains visible as part of history.
4. `Deleted Pricing` is hidden.
5. Voided Tickets remain visible.
6. Status belongs to the entity, not the whole cell.
7. Active state is represented by the absence of a badge.
8. History order is oldest to newest.
9. Use actual timestamps, not inferred workflow order.
10. `No document` is rendered only when there are no visible entities after filtering.
11. One backend entity may appear in several matrix cells if its coverage includes several passenger/segment combinations.
12. Overview displays facts only; it does not evaluate booking health.

---

## 16. Acceptance Criteria

### Matrix

- All booking segments are shown as rows in itinerary order.
- All passengers are shown as columns in PNR order.
- Each cell represents exactly one passenger/segment combination.

### Pricing

- Active Pricing is rendered without a badge.
- Ticketed, Unknown, Reprice required, Itinerary changed, and Inactive are rendered with their status badge.
- Deleted Pricing is never rendered.

### Ticket

- Active Ticket is rendered without a badge.
- Ticket number is visible.
- Voided Ticket is rendered with a `Voided` badge.

### History

- Multiple entities can appear inside one cell.
- Pricing and Tickets can coexist.
- Entities are sorted oldest → newest using Created/Issued dates.
- Historical Voided/Ticketed/Inactive entities remain visible unless explicitly excluded by the rules above.

### Empty state

- A cell with no visible entities displays `No document`.
- The empty state is visually distinguishable during matrix scanning.

### Visual behavior

- Pricing and Ticket are distinguishable without requiring the user to read every status.
- Pricing uses the defined orange type accent.
- Ticket uses the neutral type treatment.
- Status colors do not create a severity/traffic-light system.
- The matrix remains visually minimal even when many entities are present.

### Interaction

- Every visible Pricing and Ticket item is clickable.
- Clicking opens/navigates to the exact corresponding entity in Booking Overview.
- Hover communicates that the item is interactive.

---

## 17. Reference Scenario

Example cell after sorting:

```text
Pricing                     [Inactive]

Pricing                     [Ticketed]

Ticket                      [Voided]
421-1324311324

Ticket
421-1324311325
```

This cell should be interpreted only as a chronological list of actual entities.

The Overview widget must not infer or display an additional cell-level status from this sequence.
