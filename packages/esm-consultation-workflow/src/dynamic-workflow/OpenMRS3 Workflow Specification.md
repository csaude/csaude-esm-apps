# OpenMRS3 Workflow Feature - Business Requirements

## 1. Introduction

### 1.1 Purpose
This document outlines the business requirements for the OpenMRS3 Workflow feature. The workflow system will enable healthcare providers to follow structured, sequential processes when delivering care to patients, ensuring adherence to clinical protocols and standards of care.

### 1.2 Scope
This specification covers the workflow functionality, eligibility rules, provider access, and the workflow creation interface from a business perspective.

### 1.3 Business Value
- Improved quality of care through standardized clinical protocols
- Enhanced regulatory compliance by enforcing required steps
- Reduced errors by guiding providers through appropriate clinical pathways
- Improved training and onboarding for new providers

### 1.4 Examples of Use Cases
- **HIV Care**: Ensuring patient consent is gathered before conducting an HIV test
- **Outpatient Department (OPD)**: Enforcing that vitals are recorded before collecting patient symptoms
- **First-visit protocols**: Guiding providers through specific steps required for initial consultations

## 2. Feature Overview

### 2.1 Workflow Definition
A workflow is a series of sequential steps that providers must complete when delivering care to a patient. Each workflow has:
- A name and description
- Eligibility rules for patients
- Provider roles that can access it
- A sequence of steps with specific actions required

### 2.2 Workflow Eligibility
Workflows will be made available to providers based on:
- Patient demographic information (age, gender, etc.)
- Patient attributes (HIV status, pregnancy status, etc.)
- Visit context (first visit, follow-up, etc.)
- Provider role/specialty
- Other contextual information from the patient's medical history

### 2.3 Workflow Experience
Workflows will appear as guided wizards with next/previous navigation buttons, guiding providers through the required steps sequentially.

## 3. Functional Requirements

### 3.1 Workflow Eligibility and Selection

1. **Smart Workflow Filtering**:
   - The system will automatically evaluate patient information to determine eligible workflows
   - Only workflows relevant to the current patient and provider will be displayed
   - Complex eligibility rules combining multiple conditions will be supported

2. **Multiple Eligible Workflows**:
   - When multiple workflows are eligible, the system will present a list to the provider
   - Recommended workflows will be clearly indicated
   - Priority ordering will help guide provider selection
   - Administrators can configure whether recommended workflows should be enforced

### 3.2 Workflow Execution

1. **Guided Step-by-Step Process**:
   - Workflows will present as guided wizards with clear navigation
   - Steps will be displayed sequentially
   - Progress through the workflow will be visually indicated

2. **Dynamic Step Visibility**:
   - Steps will only be visible when previous dependent steps are completed
   - Steps may be conditionally displayed based on information collected in earlier steps
   - The system will notify providers when steps cannot be displayed due to missing information

3. **Data Integration**:
   - Data entered in one step will be available to later steps
   - Patient information will be pre-populated where available
   - New information entered will be stored in the patient record

4. **Validation and Safety**:
   - Each step will validate provider inputs
   - The system will prevent advancement when required information is missing
   - Clinical safety checks will be performed where appropriate

### 3.3 Workflow Management

1. **Admin Access Control**:
   - Only administrators will be able to create and manage workflow definitions
   - Workflows can be activated or deactivated as needed

2. **Provider Access Restrictions**:
   - Providers will only see workflows they are authorized to execute
   - Role-based filtering will ensure appropriate access

## 4. Workflow Builder Interface

### 4.1 Workflow Management Dashboard

1. **Workflow Directory**:
   - Administrators will see a list of all existing workflows
   - Key information such as name, description, and status will be displayed
   - Actions to edit, delete, or clone workflows will be available

2. **New Workflow Creation**:
   - A clear option to create new workflows will be provided
   - Guidance will be available when no workflows exist

### 4.2 Workflow Definition

1. **Basic Information Collection**:
   - Name and description of the workflow
   - Provider roles that can access the workflow
   - Patient eligibility criteria
   - Priority level and recommendation status

2. **Workflow Builder Interface**:
   - A visual interface with two main sections:
     - A configuration viewer showing the current workflow structure
     - A builder interface with preview and editing capabilities

### 4.3 Step Configuration

1. **Step Management**:
   - Add, edit, reorder, and delete steps
   - Configure step details including:
     - Step name and description
     - Type of interaction (form, orders, medications, etc.)
     - Required vs. optional steps
     - Dependencies on other steps
     - Visibility conditions

2. **Step Visibility Rules**:
   - Configure when steps should be shown or hidden
   - Create rules based on patient information or previous step results
   - Support for complex logical conditions

### 4.4 Testing and Validation

1. **Workflow Preview**:
   - Simulate workflow execution with test patient scenarios
   - Validate the flow logic works as expected
   - Identify potential issues before deploying to production
   - Test different patient and provider combinations

## 5. User Experience Requirements

### 5.1 Provider Experience

1. **Intuitive Navigation**:
   - Clear indication of current step and overall progress
   - Obvious next/previous actions
   - Ability to review previous steps

2. **Clear Communication**:
   - Informative error messages when issues arise
   - Explanation when steps are skipped due to conditions
   - Confirmation when the workflow is completed successfully

### 5.2 Administrator Experience

1. **Workflow Builder Usability**:
   - Intuitive interface for creating complex workflows without technical knowledge
   - Visual representations of workflow steps and conditions
   - Help text and tooltips for complex features

2. **Management Capabilities**:
   - Easy monitoring of active workflows
   - Ability to update workflows as clinical protocols change
   - Version control to track changes over time

## 6. Future Considerations

1. **Enhanced Workflow Capabilities**:
   - Support for pausing and resuming workflows across visits
   - Ability to branch workflows based on clinical decision points
   - Support for concurrent workflows that may interact

2. **Analytics and Reporting**:
   - Metrics on workflow usage and completion rates
   - Identification of bottlenecks or frequent issues
   - Compliance reporting for regulatory requirements

3. **Advanced Configuration**:
   - Workflow templates for common clinical scenarios
   - Ability to share workflows between facilities
   - Multi-language support for diverse healthcare settings

## 7. Glossary

**Workflow**: A defined sequence of clinical steps that providers follow when delivering care to a patient.

**Step**: A single action or data collection point within a workflow.

**Eligibility Criteria**: Rules that determine which patients and providers a workflow applies to.

**Condition**: A logical expression that determines when a workflow or step should be visible or required.

**Rendering Type**: The type of interaction required for a step (form, orders, medications, etc.).

**Provider Role**: The clinical role of the healthcare worker (doctor, nurse, lab tech, etc.).
