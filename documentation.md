# EHR System API Documentation

## API Discovery Document

### Complete List of Endpoints

#### Patient Management APIs
- **GET/POST** `/api/modmed/patient` - Patient search and retrieval
  - Query parameters: `name`, `id`, `birthdate`, `_count`
  - Supports both GET (query params) and POST (JSON body) for complex searches
  - Returns FHIR Bundle with patient resources

- **GET** `/api/modmed/patient/search` - Advanced patient search
  - Supports pagination and complex filtering
  - Returns structured patient data

#### Appointment Management APIs
- **GET** `/api/modmed/appointment` - Retrieve appointments
  - Query parameters: supports both practitioner, patient id
  - Returns appointments scheduled for practitioner/patient

- **GET** `/api/modmed/slot` - Retrieve available time slots 
  - Required: `appointmentType`, `start`, `end`
  - Optional: `_count` (default: 50, max: 100)
  - Returns available slots for scheduling

- **GET** `/api/modmed/slot/search` - Advanced slot search by  date ranges, appointment type(additional feature:- search by location, practitioner id too)
  - Supports complex availability queries
  - Practitioner and location filtering


- **POST** `/api/modmed/appointment` - Create new appointments
  - Accepts FHIR Appointment resource
  - Validates participant references and time slots

- **PUT** `/api/modmed/appointment?id={id}` - Update existing appointments(for date ranges , time slots are shown and when selected only then we can update it)
  - Supports status changes, rescheduling, cancellation
  - Validates appointment state transitions
  - same api is used while cancelling 

#### Clinical Data APIs
- **GET** `/api/modmed/medications` - Retrieve patient medications
  - Query parameter: `patientId`
  - Returns FHIR MedicationStatement resources

- **POST** `/api/modmed/medications` - Add new medication
  - Required: `patientId`, `medicationCode`, `medicationText`
  - Optional: `startDate`
  - Uses RxNorm coding system

- **POST** `/api/modmed/addCondition` - Add patient conditions/diagnoses
  - Required: `patientId`, `diagnosisCode`, `diagnosisDisplay`, `clinicalStatus`, `categoryCode`, `onsetDateTime`, `recordedDate`
  - Uses ICD-10 coding system

#### Encounter Management APIs
- **POST** `/api/modmed/encounter/record` - Record encounter data
  - Required: `encounterId`, `patientId`, `practitionerId`, `summary`, `topic`
  - Creates Binary resource with S3 storage for encounter summaries
  - This api is used to record both vitals and encounter
  - use DocumentReference api in background

- **GET** `/api/modmed/encounter/lab-results` - Retrieve lab results
  - Query parameter: `patientId`
  - Returns FHIR DiagnosticReport resources, from /DocumentReference search api

#### Provider and Location APIs
- **GET** `/api/modmed/practitioner` - Retrieve practitioners
  - Optional: `id` for specific practitioner
  - Returns FHIR Practitioner resources

- **POST** `/api/modmed/practitioner` - Create new practitioner
  - Accepts FHIR Practitioner resource
  - Validates required fields

- **GET** `/api/modmed/location` - Retrieve locations
  - Returns all available locations
  - Used for appointment scheduling

- **GET** `/api/modmed/practitioner/search` - Advanced practitioner search
  - Supports name, specialty, and availability filtering
  - api used while slot searching and booking

### Capabilities and Limitations

#### Capabilities
2. **Multi-tenant Architecture**: Supports multiple firm configurations
3. **Real-time Authentication**: OAuth2 token management with automatic refresh
4. **File Storage Integration**: S3-compatible storage for encounter documents
5. **Advanced Search**: Complex querying with pagination support
6. **State Management**: Redux-based client-side state management(while at last doing assignment, moved many things to use state due to time constraints)
7. **Error Handling**: Comprehensive error handling with user-friendly messages
8. **Performance Optimization**: Token caching, used server side for hitting main api requests, used redux state rather than props drillings
9. **Safely Hitting main modmed server**: Integrated every api in server side and user hits to nextjs server nd then request goes to endpoint, so user hasnt been exposed to main api(also better for future if we want to do some internal api management)
10.  **env compatibility**: made every data fetch of config in config.ts, just have to change access point to process.env and everything will work.

#### Limitations
**instead of integrating env details in every dashboard, i have made config tab, where have to add env details, and it will be valid across website(right now saved in localstorage)**
1. **Hardcoded Patient ID**: Medication API uses hardcoded patient ID (1254)
2. **Limited Error Context**: Some error responses lack detailed context
4. **Single Environment**: Limited multi-environment support
6. **Limited Validation**: Some endpoints lack comprehensive input validation
7. **Works if connected to us proxy**
## Implementation Guide

### How the Integration Works

#### Architecture Overview
The EHR system follows a three-tier architecture:
1. **Frontend**: Next.js React application with Redux state management
2. **API Layer**: Next.js API routes acting as middleware
3. **Backend**: ModMed FHIR API with S3 storage integration

#### Authentication Flow
```typescript
// Token management with caching
let cachedAccessToken: string | null = null;
let cachedTokenExpiryEpochSec: number | null = null;

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedTokenExpiryEpochSec && cachedTokenExpiryEpochSec - now > 60) {
    return cachedAccessToken; // Use cached token if valid
  }
  return fetchAccessToken(); // Fetch new token
}
```

#### Configuration Management
- **Environment-based**: Supports dev/prod configurations
- **Local Storage**: Client-side configuration persistence
- **Fallback System**: Environment variables as fallback

### Command Processing Logic

#### FHIR Resource Processing
1. **Input Validation**: Required field validation before processing
2. **Resource Transformation**: Convert API input to FHIR-compliant resources
3. **Reference Resolution**: Handle FHIR references and relationships
4. **Response Processing**: Transform FHIR responses to client-friendly format

#### Example: Appointment Creation
```typescript
const resource = {
  resourceType: "Appointment",
  status: "booked",
  appointmentType: {
    coding: [{ system: "appointment-type", code: appointmentType }],
    text: appointmentType,
  },
  start: slot.start,
  end: slot.end,
  minutesDuration: Math.ceil((new Date(slot.end).getTime() - new Date(slot.start).getTime()) / 60000),
  participant: [
    { actor: { reference: `Location/${locationId}` } },
    { actor: { reference: `Practitioner/${practitionerId}` } },
    { actor: { reference: `Patient/${patientId}` } },
  ],
};
```

### State Management Approach

#### Redux Store Structure
```typescript
export const store = configureStore({
  reducer: {
    appointments: appointmentsReducer,
    patients: patientsReducer,
    appointmentFilter: appointmentFilterReducer,
    encounter: encounterSlice
  },
  devTools: process.env.NODE_ENV !== "production",
});
```

#### State Slices
1. **Appointments Slice**: Manages appointment data, availability, and booking state
2. **Patients Slice**: Handles patient data, demographics, and clinical information
3. **Appointment Filter Slice**: Manages filtering and search criteria
4. **Encounter Slice**: Manages encounter data and clinical operations

#### Async Actions
- **createAsyncThunk**: Used for all API calls
- **Pending/Fulfilled/Rejected**: Standard async state management
- **Error Handling**: Centralized error state management

### Error Handling Strategies

#### API Level Error Handling
```typescript
export async function POST(req: NextRequest) {
  try {
    // API logic
    const response = await fhirFetch(`/Resource`, { method: "POST", body: JSON.stringify(data) });
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }
    return NextResponse.json(await response.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

#### Client-Side Error Handling
1. **Redux Error State**: Centralized error state in Redux store
2. **Component Error Boundaries**: React error boundaries for UI errors
4. **Retry Logic**: Automatic retry for transient failures

#### Error Types
- **Validation Errors**: 400 status with field-specific messages
- **Authentication Errors**: 401 status with token refresh logic
- **Authorization Errors**: 403 status with permission messages
- **Server Errors**: 500 status with generic error messages
- **Network Errors**: Timeout and connection error handling

### Performance Optimizations

#### Token Caching
- **In-Memory Caching**: Access tokens cached in memory
- **Reduced API Calls**: Minimize authentication requests

#### Parallel Data Fetching
```typescript
const [patientRes, conditionsRes, allergiesRes, medsRes] = await Promise.all([
  fhirFetch(`/Patient/${id}`),
  fhirFetch(`/Condition?patient=${id}`),
  fhirFetch(`/AllergyIntolerance?patient=${id}`),
  fhirFetch(`/MedicationStatement?patient=${id}`),
]);
```


#### API Optimizations
1. **Request Batching**: Multiple requests in single API call
2. **Pagination**: Efficient data loading with pagination
3. **Caching Headers**: Appropriate cache headers for static data

### Integration Architecture Decisions

#### Technology Stack
- **Frontend**: Next.js 15.5.3 with React 19.1.0
- **State Management**: Redux Toolkit with React-Redux
- **Styling**: Tailwind CSS 4.0
- **Type Safety**: TypeScript 5.0
- **Build Tool**: Turbopack for faster builds

#### API Design Decisions
1. **RESTful Design**: Standard HTTP methods and status codes
2. **FHIR Compliance**: Full FHIR R4 standard adherence
3. **Middleware Pattern**: Next.js API routes as middleware
4. **Error Standardization**: Consistent error response format

#### Scalability Decisions
1. **Stateless Design**: No server-side session management
2. **Horizontal Scaling**: API routes support horizontal scaling

This documentation provides a comprehensive overview of the EHR system's API architecture, implementation details, and optimization strategies, enabling developers to understand and extend the system effectively.
