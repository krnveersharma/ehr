# EHR Web Application - Usage Guide

This guide explains how to use the EHR (Electronic Health Record) web application.

---

## 1. Patients Page

- View a **list of patients**.
- Search for a **patient by ID**.
- On clicking a patient, you can view complete details including:
  - Demographics
  - Conditions
  - Allergies
  - Medications

---

## 2. Appointments Page

- **Find available slots**
  - Add filters: `start` date, `end` date, `type` (appointment type).
  - Optional filters: `location` and `practitioner`.
  - Appointment **types and locations are auto-fetched from ModMed**.

- After applying filters, slots for the selected days will be listed.

- **Book a slot**
  - Input a **patient ID** to book the selected slot.

- **Existing Appointments**
  - Search by **patient ID** or **practitioner ID**.
  - Each appointment supports **Update** and **Cancel** actions.

- **Update appointment**
  - Change the **status**.
  - **Reschedule** the appointment:
    - Choose a new date.
    - Available slots for that date are displayed.
    - Select a slot to reschedule the appointment.

---

## 3. Encounter Page

- View **upcoming visits**.
- On clicking a visit you can:
  - Take clinical **notes**.
  - Record **vital signs**.
  - Add **medications**.
**Note**: vital sign and notes are uploaded to s3 first

> When opening a visit page, `encounterId`, `patientId`, and `practitionerId` are passed along — you do not need to fetch them manually.

- **Patient documents**
  - S3 documents (reports) are fetched and listed for viewing/download.

---

## 4. Config Page

- Update and save your **ModMed API credentials**.
- Credentials are stored in **localStorage** and used across the application.

---

## 5. Add Condition Page

- Route: `/condition/[patientId]`
- Use this page to **add diagnoses/conditions** for the patient.
- Select options (e.g., diagnosis codes) are **auto-fetched from ModMed**.

---

## Notes & Recommendations

- Ensure you set valid ModMed credentials in the **Config** page before using pages that query ModMed APIs.
- The app relies on ModMed API responses; some UI options are dynamically populated from those responses.
- Error messages from API calls will appear in the UI — follow them to troubleshoot (e.g., missing credentials, invalid IDs).
- For booking/rescheduling, double-check the selected patient ID and slot time before confirming.

---
