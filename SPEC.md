# K12 Tutoring Journey - Customer Funnel Dashboard

## Project Overview
- **Project Name**: K12 Tutoring Journey
- **Type**: Internal Product Dashboard (Web Application)
- **Core Functionality**: Visualizes the customer journey funnel for an online K-12 tutoring business, showing conversion metrics across different stages from awareness to enrollment.
- **Target Users**: Internal product managers, marketing team, and business analysts

---

## UI/UX Specification

### Layout Structure
- **Header**: Fixed top navigation with logo, dashboard title, and date range selector
- **Sidebar**: Collapsible left sidebar for navigation (Dashboard, Analytics, Reports, Settings)
- **Main Content Area**: 
  - Summary metrics row at top (4 KPI cards)
  - Funnel visualization in center
  - Detailed breakdown table below
- **Responsive Breakpoints**:
  - Desktop: 1200px+ (full sidebar)
  - Tablet: 768px-1199px (collapsed sidebar)
  - Mobile: <768px (hidden sidebar, hamburger menu)

### Visual Design

#### Color Palette
- **Primary**: `#2563EB` (Royal Blue)
- **Secondary**: `#1E293B` (Slate Dark)
- **Accent**: `#10B981` (Emerald Green - for positive metrics)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)
- **Background**: `#F8FAFC` (Slate 50)
- **Surface**: `#FFFFFF` (White)
- **Text Primary**: `#0F172A` (Slate 900)
- **Text Secondary**: `#64748B` (Slate 500)
- **Border**: `#E2E8F0` (Slate 200)

#### Funnel Stage Colors
- Stage 1 (Awareness): `#3B82F6` (Blue 500)
- Stage 2 (Interest): `#8B5CF6` (Violet 500)
- Stage 3 (Consideration): `#EC4899` (Pink 500)
- Stage 4 (Intent): `#F59E0B` (Amber 500)
- Stage 5 (Enrollment): `#10B981` (Emerald 500)

#### Typography
- **Font Family**: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Headings**:
  - H1: 28px, 700 weight
  - H2: 22px, 600 weight
  - H3: 18px, 600 weight
- **Body**: 14px, 400 weight
- **Small/Labels**: 12px, 500 weight
- **Monospace (numbers)**: `"JetBrains Mono", monospace`

#### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Card padding: 24px
- Section gaps: 24px

#### Visual Effects
- Card shadows: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- Hover shadows: `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)`
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)
- Transitions: 150ms ease-in-out

### Components

#### KPI Cards (4 across top)
- Total Visitors
- Total Leads
- Conversion Rate
- Revenue
- Each shows: icon, label, value, trend indicator (% change with up/down arrow)

#### Funnel Visualization
- Horizontal funnel chart with 5 stages
- Each stage shows: stage name, count, conversion rate from previous stage
- Bars decrease in width proportionally
- Hover reveals detailed tooltip

#### Funnel Stages Table
- Columns: Stage, Visitors, Conversion Rate, Revenue, Avg Time in Stage
- Sortable headers
- Alternating row colors
- Pagination (10 rows per page)

#### Date Range Selector
- Preset options: Today, Last 7 Days, Last 30 Days, This Month, Last Month, Custom
- Custom shows two date inputs

#### Sidebar Navigation
- Logo at top
- Nav items with icons
- Active state: blue background, white text
- Hover: light blue background

---

## Functionality Specification

### Core Features
1. **Dashboard Overview**: Display summary KPIs and funnel visualization
2. **Funnel Analysis**: Interactive funnel chart showing conversion between stages
3. **Detailed Metrics Table**: Paginated table with all funnel stage data
4. **Date Filtering**: Filter data by date range
5. **Export Functionality**: Export data to CSV (bonus)

### User Interactions
- Click on funnel stage to filter table to that stage
- Hover on chart elements for tooltips
- Sort table by clicking column headers
- Navigate between pages in table

### Data Handling
- Mock data for demonstration (no backend)
- Data structure: array of funnel stage objects
- Client-side filtering and sorting

### Edge Cases
- Empty data: Show "No data available" message
- Loading state: Show skeleton/spinner
- Error state: Show error message with retry button

---

## Acceptance Criteria

1. ✅ Dashboard loads with 4 KPI cards showing mock data
2. ✅ Funnel visualization displays 5 stages with proper proportions
3. ✅ Table shows all funnel data with pagination
4. ✅ Date range selector filters the displayed data
5. ✅ Responsive layout works on desktop and tablet
6. ✅ All hover states and transitions work smoothly
7. ✅ No console errors on page load
8. ✅ Typography and colors match specification exactly
